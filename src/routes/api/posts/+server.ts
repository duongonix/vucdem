import { optionalFirebaseUser, requireFirebaseUser } from '$lib/server/auth';
import { getFirebaseAdminDb } from '$lib/server/firebase-admin';
import { decodePostCursor, encodePostCursor, serializePost } from '$lib/server/posts';
import {
	createPostSchema,
	generatePostExcerpt,
	validatePublishablePost
} from '$lib/validation/post';
import { error, json, type RequestHandler } from '@sveltejs/kit';
import { FieldPath, FieldValue } from 'firebase-admin/firestore';
import { assertPostMediaMetadata } from '$lib/server/media-authorization';
import { assertActivePostCategory } from '$lib/server/post-categories';

export const POST: RequestHandler = async (event) => {
	const identity = await requireFirebaseUser(event);
	const parsed = createPostSchema.safeParse(await event.request.json().catch(() => null));
	if (!parsed.success) error(400, parsed.error.issues[0]?.message ?? 'Bài viết không hợp lệ.');
	if (parsed.data.id.includes('/')) error(400, 'ID bài viết không hợp lệ.');
	assertPostMediaMetadata(parsed.data.id, parsed.data.thumbnail, parsed.data.images);
	await assertActivePostCategory(parsed.data.category).catch(() =>
		error(400, 'Danh mục không hợp lệ hoặc đã bị tắt.')
	);
	if (parsed.data.status === 'published') {
		const problems = validatePublishablePost(parsed.data);
		if (problems.length) error(400, problems[0]);
	}

	const db = getFirebaseAdminDb();
	const userRef = db.collection('users').doc(identity.uid);
	const postRef = db.collection('posts').doc(parsed.data.id);
	await db.runTransaction(async (transaction) => {
		const communityRef = parsed.data.communityId
			? db.collection('communities').doc(parsed.data.communityId)
			: null;
		const [user, existing, community, membership] = await Promise.all([
			transaction.get(userRef),
			transaction.get(postRef),
			communityRef ? transaction.get(communityRef) : Promise.resolve(null),
			communityRef
				? transaction.get(communityRef.collection('members').doc(identity.uid))
				: Promise.resolve(null)
		]);
		if (!user.exists || user.get('status') !== 'active')
			error(403, 'Tài khoản không thể đăng bài.');
		if (existing.exists) error(409, 'Bài viết đã tồn tại.');
		if (
			communityRef &&
			(!community?.exists || community.get('status') !== 'active' || !membership?.exists)
		)
			error(403, 'Bạn cần tham gia cộng đồng trước khi đăng bài.');
		const avatar = user.get('avatar') as { url?: unknown } | null;
		const timestamp = FieldValue.serverTimestamp();
		transaction.create(postRef, {
			authorId: identity.uid,
			authorName: user.get('displayName'),
			authorUsername: user.get('username'),
			authorAvatarUrl: typeof avatar?.url === 'string' ? avatar.url : null,
			authorVerified: user.get('verify') === true,
			title: parsed.data.title,
			content: parsed.data.content,
			excerpt: generatePostExcerpt(parsed.data.content),
			category: parsed.data.category,
			tags: parsed.data.tags,
			communityId: parsed.data.communityId,
			thumbnail: parsed.data.thumbnail,
			images: parsed.data.images,
			voteScore: 0,
			commentCount: 0,
			viewCount: 0,
			status: parsed.data.status,
			createdAt: timestamp,
			updatedAt: timestamp,
			publishedAt: parsed.data.status === 'published' ? timestamp : null
		});
		if (parsed.data.status === 'published')
			transaction.update(userRef, { postCount: FieldValue.increment(1), updatedAt: timestamp });
		if (parsed.data.status === 'published' && communityRef)
			transaction.update(communityRef, {
				postCount: FieldValue.increment(1),
				updatedAt: timestamp
			});
	});
	return json({ post: serializePost(await postRef.get()) }, { status: 201 });
};

export const GET: RequestHandler = async (event) => {
	await optionalFirebaseUser(event);
	const sort = event.url.searchParams.get('sort') ?? 'newest';
	const sortField =
		sort === 'popular' ? 'voteScore' : sort === 'viewed' ? 'viewCount' : 'createdAt';
	if (!['newest', 'popular', 'viewed'].includes(sort)) error(400, 'Kiểu sắp xếp không hợp lệ.');
	const filtered = ['category', 'communityId', 'authorId'].some((field) =>
		event.url.searchParams.has(field)
	);
	if (filtered && sort !== 'newest')
		error(400, 'Feed có bộ lọc chỉ hỗ trợ sắp xếp mới nhất trong MVP.');

	const filters = new Map<'category' | 'communityId' | 'authorId', string>();
	let query: FirebaseFirestore.Query = getFirebaseAdminDb()
		.collection('posts')
		.where('status', '==', 'published');
	for (const field of ['category', 'communityId', 'authorId'] as const) {
		const value = event.url.searchParams.get(field);
		if (value) {
			filters.set(field, value);
			query = query.where(field, '==', value);
		}
	}
	query = query.orderBy(sortField, 'desc').orderBy(FieldPath.documentId(), 'desc').limit(20);
	const cursor = event.url.searchParams.get('cursor');
	const decodedCursor = cursor ? decodePostCursor(cursor, sortField) : null;
	if (cursor) {
		query = query.startAfter(decodedCursor?.value, decodedCursor?.id);
	}

	try {
		const snapshot = await query.get();
		const last = snapshot.docs.at(-1);
		return json({
			posts: snapshot.docs.map(serializePost),
			nextCursor: snapshot.size === 20 && last ? encodePostCursor(last, sortField) : null
		});
	} catch (cause) {
		const code = (cause as { code?: number | string })?.code;
		if (code !== 9 && code !== '9' && code !== 'FAILED_PRECONDITION') throw cause;
	}

	// Keep feeds usable while a newly declared composite index is still building or awaiting
	// deployment. The bounded fallback uses Firestore's single-field index and never downloads
	// the complete collection.
	let fallback: FirebaseFirestore.Query = getFirebaseAdminDb()
		.collection('posts')
		.orderBy(sortField, 'desc')
		.limit(100);
	if (decodedCursor) fallback = fallback.startAfter(decodedCursor.value);
	const snapshot = await fallback.get();
	const matching = snapshot.docs.filter(
		(document) =>
			document.get('status') === 'published' &&
			[...filters].every(([field, value]) => document.get(field) === value)
	);
	const page = matching.slice(0, 20);
	const last = page.at(-1);
	return json({
		posts: page.map(serializePost),
		nextCursor:
			last && (matching.length > 20 || snapshot.size === 100)
				? encodePostCursor(last, sortField)
				: null
	});
};
