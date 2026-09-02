import { optionalFirebaseUser, requireFirebaseUser } from '$lib/server/auth';
import { decodeCommentCursor, encodeCommentCursor, serializeComment } from '$lib/server/comments';
import { getFirebaseAdminDb } from '$lib/server/firebase-admin';
import { createCommentSchema } from '$lib/validation/comment';
import { error, json, type RequestHandler } from '@sveltejs/kit';
import { FieldPath, FieldValue, Timestamp } from 'firebase-admin/firestore';
import { actorSnapshot, createNotification } from '$lib/server/notifications';
import { assertCommentTargetReadable, commentTargetRefs } from '$lib/server/comment-targets';
import type { CommentTargetType } from '$lib/types';

function isMissingIndex(cause: unknown): boolean {
	const code = (cause as { code?: number | string })?.code;
	return code === 9 || code === '9' || code === 'FAILED_PRECONDITION';
}

export const GET: RequestHandler = async (event) => {
	await optionalFirebaseUser(event);
	const targetType = event.url.searchParams.get('targetType') as CommentTargetType | null;
	const targetId = event.url.searchParams.get('targetId');
	if (!['post', 'story', 'chapter'].includes(targetType ?? '') || !targetId)
		error(400, 'Đích bình luận không hợp lệ.');
	const validTargetType = targetType as CommentTargetType;
	const db = getFirebaseAdminDb();
	const refs = commentTargetRefs(db, validTargetType, targetId);
	const [targetDocument, ownerDocument] = await Promise.all([
		refs.targetRef.get(),
		refs.ownerRef.path === refs.targetRef.path ? refs.targetRef.get() : refs.ownerRef.get()
	]);
	assertCommentTargetReadable(validTargetType, targetDocument, ownerDocument);
	let roots: FirebaseFirestore.Query = db
		.collection('comments')
		.where('targetType', '==', validTargetType)
		.where('targetId', '==', targetId)
		.where('parentId', '==', null)
		.where('status', 'in', ['published', 'removed'])
		.orderBy('createdAt', 'desc')
		.orderBy(FieldPath.documentId(), 'desc')
		.limit(20);
	const cursor = event.url.searchParams.get('cursor');
	let decodedCursor: ReturnType<typeof decodeCommentCursor> | null = null;
	if (cursor) {
		try {
			decodedCursor = decodeCommentCursor(cursor);
			roots = roots.startAfter(Timestamp.fromDate(decodedCursor.createdAt), decodedCursor.id);
		} catch {
			error(400, 'Cursor bình luận không hợp lệ.');
		}
	}
	let rootDocuments: FirebaseFirestore.QueryDocumentSnapshot[];
	let hasMoreRoots: boolean;
	try {
		const rootSnapshot = await roots.get();
		rootDocuments = rootSnapshot.docs;
		hasMoreRoots = rootSnapshot.size === 20;
	} catch (cause) {
		if (!isMissingIndex(cause)) throw cause;
		let fallback: FirebaseFirestore.Query = db
			.collection('comments')
			.orderBy('createdAt', 'desc')
			.limit(100);
		if (decodedCursor) fallback = fallback.startAfter(Timestamp.fromDate(decodedCursor.createdAt));
		const fallbackSnapshot = await fallback.get();
		const matching = fallbackSnapshot.docs.filter(
			(document) =>
				document.get('targetType') === validTargetType &&
				document.get('targetId') === targetId &&
				document.get('parentId') === null &&
				['published', 'removed'].includes(document.get('status'))
		);
		rootDocuments = matching.slice(0, 20);
		hasMoreRoots = matching.length > 20 || fallbackSnapshot.size === 100;
	}

	const all = [...rootDocuments];
	let parents = rootDocuments.map((item) => item.id);
	for (let depth = 0; depth < 2 && parents.length; depth += 1) {
		const descendants: FirebaseFirestore.QueryDocumentSnapshot[] = [];
		for (let offset = 0; offset < parents.length; offset += 30) {
			const parentBatch = parents.slice(offset, offset + 30);
			const query = db
				.collection('comments')
				.where('parentId', 'in', parentBatch)
				.where('status', 'in', ['published', 'removed'])
				.orderBy('createdAt', 'asc');
			try {
				descendants.push(...(await query.get()).docs);
			} catch (cause) {
				if (!isMissingIndex(cause)) throw cause;
				const fallback = await db.collection('comments').where('parentId', 'in', parentBatch).get();
				descendants.push(
					...fallback.docs
						.filter((document) => ['published', 'removed'].includes(document.get('status')))
						.sort(
							(a, b) =>
								(a.get('createdAt')?.toMillis?.() ?? 0) - (b.get('createdAt')?.toMillis?.() ?? 0)
						)
				);
			}
		}
		all.push(...descendants);
		parents = descendants.map((item) => item.id);
	}
	const last = rootDocuments.at(-1);
	return json({
		comments: all.map(serializeComment),
		nextCursor: hasMoreRoots && last ? encodeCommentCursor(last) : null
	});
};

export const POST: RequestHandler = async (event) => {
	const identity = await requireFirebaseUser(event);
	const parsed = createCommentSchema.safeParse(await event.request.json().catch(() => null));
	if (!parsed.success) error(400, parsed.error.issues[0]?.message ?? 'Bình luận không hợp lệ.');
	const db = getFirebaseAdminDb();
	const commentRef = db.collection('comments').doc();
	const userRef = db.collection('users').doc(identity.uid);
	const { targetRef, ownerRef } = commentTargetRefs(
		db,
		parsed.data.targetType,
		parsed.data.targetId
	);
	const mentionedUsernames = [
		...new Set(
			Array.from(parsed.data.content.matchAll(/(?:^|\s)@([a-z0-9_]{3,24})\b/gi), (match) =>
				match[1].toLowerCase()
			)
		)
	].slice(0, 10);
	const mentionReservations = mentionedUsernames.length
		? await db.getAll(
				...mentionedUsernames.map((username) => db.collection('usernames').doc(username))
			)
		: [];
	const mentionedUserIds = [
		...new Set(
			mentionReservations
				.filter((reservation) => reservation.exists)
				.map((reservation) => reservation.get('uid'))
				.filter((uid): uid is string => typeof uid === 'string' && uid !== identity.uid)
		)
	];
	await db.runTransaction(async (transaction) => {
		const [user, target, owner] = await Promise.all([
			transaction.get(userRef),
			transaction.get(targetRef),
			ownerRef.path === targetRef.path ? transaction.get(targetRef) : transaction.get(ownerRef)
		]);
		if (!user.exists || user.get('status') !== 'active')
			error(403, 'Tài khoản không thể bình luận.');
		assertCommentTargetReadable(parsed.data.targetType, target, owner);
		let parent: FirebaseFirestore.DocumentSnapshot | null = null;
		if (parsed.data.parentId) {
			parent = await transaction.get(db.collection('comments').doc(parsed.data.parentId));
			if (
				!parent.exists ||
				parent.get('status') === 'hidden' ||
				parent.get('targetType') !== parsed.data.targetType ||
				parent.get('targetId') !== parsed.data.targetId
			)
				error(400, 'Bình luận cha không hợp lệ.');
			const grandparentId = parent.get('parentId');
			if (typeof grandparentId === 'string') {
				const grandparent = await transaction.get(db.collection('comments').doc(grandparentId));
				if (!grandparent.exists || grandparent.get('parentId') !== null)
					error(400, 'Cuộc thảo luận chỉ hỗ trợ tối đa 3 cấp.');
			}
		}
		const avatar = user.get('avatar') as { url?: unknown } | null;
		const now = FieldValue.serverTimestamp();
		transaction.create(commentRef, {
			authorId: identity.uid,
			authorName: user.get('displayName'),
			authorUsername: user.get('username'),
			authorAvatarUrl: typeof avatar?.url === 'string' ? avatar.url : null,
			authorVerified: user.get('verify') === true,
			...parsed.data,
			voteScore: 0,
			replyCount: 0,
			status: 'published',
			createdAt: now,
			updatedAt: now
		});
		transaction.update(targetRef, { commentCount: FieldValue.increment(1) });
		if (parent) transaction.update(parent.ref, { replyCount: FieldValue.increment(1) });
		createNotification(transaction, db, {
			userId: parent ? parent.get('authorId') : owner.get('authorId'),
			actorId: identity.uid,
			...actorSnapshot(user),
			type: parent ? 'reply' : 'comment',
			targetType: parsed.data.targetType,
			targetId: parsed.data.targetId
		});
		for (const mentionedUserId of mentionedUserIds) {
			createNotification(transaction, db, {
				id: `mention_${commentRef.id}_${mentionedUserId}`,
				userId: mentionedUserId,
				actorId: identity.uid,
				...actorSnapshot(user),
				type: 'mention',
				targetType: parsed.data.targetType,
				targetId: parsed.data.targetId
			});
		}
	});
	return json({ comment: serializeComment(await commentRef.get()) }, { status: 201 });
};
