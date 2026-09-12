import { optionalFirebaseUser, requireFirebaseUser } from '$lib/server/auth';
import { getFirebaseAdminDb } from '$lib/server/firebase-admin';
import { serializePost } from '$lib/server/posts';
import {
	generatePostExcerpt,
	postMutationSchema,
	validatePublishablePost
} from '$lib/validation/post';
import { error, json, type RequestHandler } from '@sveltejs/kit';
import { FieldValue } from 'firebase-admin/firestore';
import { assertPostMediaMetadata } from '$lib/server/media-authorization';
import { assertActivePostCategory } from '$lib/server/post-categories';
import { notifyAuthorPublicationFollowers } from '$lib/server/publication-notifications';

function requiredId(value: string | undefined): string {
	if (!value || value.includes('/')) error(400, 'ID bài viết không hợp lệ.');
	return value;
}

export const GET: RequestHandler = async (event) => {
	const identity = await optionalFirebaseUser(event);
	const snapshot = await getFirebaseAdminDb()
		.collection('posts')
		.doc(requiredId(event.params.id))
		.get();
	if (!snapshot.exists) error(404, 'Không tìm thấy bài viết.');
	const status = snapshot.get('status');
	if (status !== 'published' && snapshot.get('authorId') !== identity?.uid) {
		error(404, 'Không tìm thấy bài viết.');
	}
	return json({ post: serializePost(snapshot) });
};

export const PATCH: RequestHandler = async (event) => {
	const identity = await requireFirebaseUser(event);
	const body = (await event.request.json().catch(() => null)) as unknown;
	const remove =
		typeof body === 'object' && body !== null && 'action' in body && body.action === 'remove';
	const parsed = remove ? null : postMutationSchema.safeParse(body);
	if (!remove && parsed && !parsed.success) {
		error(400, parsed.error.issues[0]?.message ?? 'Bài viết không hợp lệ.');
	}
	if (parsed?.success && parsed.data.status === 'published') {
		const problems = validatePublishablePost(parsed.data);
		if (problems.length) error(400, problems[0]);
	}
	if (parsed?.success) {
		await assertActivePostCategory(parsed.data.category).catch(() =>
			error(400, 'Danh mục không hợp lệ hoặc đã bị tắt.')
		);
	}
	const postId = requiredId(event.params.id);
	if (parsed?.success) assertPostMediaMetadata(postId, parsed.data.thumbnail, parsed.data.images);

	const db = getFirebaseAdminDb();
	const userRef = db.collection('users').doc(identity.uid);
	const postRef = db.collection('posts').doc(postId);
	let publicationVersion: number | null = null;
	let publicationTitle = '';
	await db.runTransaction(async (transaction) => {
		const [snapshot, user] = await Promise.all([
			transaction.get(postRef),
			transaction.get(userRef)
		]);
		if (!snapshot.exists) error(404, 'Không tìm thấy bài viết.');
		if (snapshot.get('authorId') !== identity.uid) error(403, 'Bạn không thể sửa bài viết này.');
		if (snapshot.get('status') === 'removed') error(409, 'Bài viết đã bị gỡ.');
		if (!remove && snapshot.get('moderationStatus') === 'pending' && user.get('role') !== 'admin')
			error(409, 'Bài viết đang được xét duyệt. Hãy chờ quản trị viên phản hồi.');
		const timestamp = FieldValue.serverTimestamp();
		if (remove) {
			transaction.update(postRef, { status: 'removed', updatedAt: timestamp });
			if (snapshot.get('status') === 'published')
				transaction.update(userRef, {
					postCount: Math.max(0, Number(user.get('postCount') ?? 0) - 1),
					updatedAt: timestamp
				});
			return;
		}
		if (!parsed?.success) error(400, 'Bài viết không hợp lệ.');
		const submitted = parsed.data.status === 'published';
		const autoApproved = submitted && user.get('role') === 'admin';
		const wasPublished = snapshot.get('status') === 'published';
		const version = Number(snapshot.get('submissionVersion') ?? 0) + (submitted ? 1 : 0);
		if (autoApproved && !wasPublished) {
			publicationVersion = version;
			publicationTitle = parsed.data.title;
		}
		transaction.update(postRef, {
			title: parsed.data.title,
			content: parsed.data.content,
			excerpt: generatePostExcerpt(parsed.data.content),
			category: parsed.data.category,
			tags: parsed.data.tags,
			communityId: parsed.data.communityId,
			thumbnail: parsed.data.thumbnail,
			images: parsed.data.images,
			status: autoApproved ? 'published' : 'draft',
			moderationStatus: autoApproved ? 'approved' : submitted ? 'pending' : 'not_submitted',
			submissionVersion: version,
			submittedAt: submitted ? timestamp : (snapshot.get('submittedAt') ?? null),
			reviewedAt: autoApproved
				? timestamp
				: submitted
					? null
					: (snapshot.get('reviewedAt') ?? null),
			reviewedBy: autoApproved
				? identity.uid
				: submitted
					? null
					: (snapshot.get('reviewedBy') ?? null),
			rejectionReason: submitted ? null : (snapshot.get('rejectionReason') ?? null),
			publishedAt: autoApproved ? (snapshot.get('publishedAt') ?? timestamp) : null,
			updatedAt: timestamp,
			...(wasPublished && !autoApproved ? { isPinned: false, pinnedAt: null, pinnedBy: null } : {})
		});
		if (autoApproved)
			transaction.create(postRef.collection('moderationReviews').doc(), {
				decision: 'approved',
				reason: null,
				reviewerId: identity.uid,
				reviewerName: String(user.get('displayName') ?? user.get('username') ?? 'Quản trị viên'),
				submissionVersion: version,
				createdAt: timestamp
			});
		if (autoApproved && !wasPublished)
			transaction.update(userRef, {
				postCount: FieldValue.increment(1),
				updatedAt: timestamp
			});
		else if (!autoApproved && wasPublished)
			transaction.update(userRef, {
				postCount: Math.max(0, Number(user.get('postCount') ?? 0) - 1),
				updatedAt: timestamp
			});
		if (!autoApproved && wasPublished && snapshot.get('communityId'))
			transaction.update(db.collection('communities').doc(snapshot.get('communityId')), {
				postCount: FieldValue.increment(-1),
				updatedAt: timestamp
			});
		if (autoApproved && !wasPublished && parsed.data.communityId)
			transaction.update(db.collection('communities').doc(parsed.data.communityId), {
				postCount: FieldValue.increment(1),
				updatedAt: timestamp
			});
		if (autoApproved && wasPublished && snapshot.get('communityId') !== parsed.data.communityId) {
			if (snapshot.get('communityId'))
				transaction.update(db.collection('communities').doc(snapshot.get('communityId')), {
					postCount: FieldValue.increment(-1),
					updatedAt: timestamp
				});
			if (parsed.data.communityId)
				transaction.update(db.collection('communities').doc(parsed.data.communityId), {
					postCount: FieldValue.increment(1),
					updatedAt: timestamp
				});
		}
	});
	if (publicationVersion !== null)
		await notifyAuthorPublicationFollowers(db, {
			authorId: identity.uid,
			contentId: postId,
			title: publicationTitle,
			destination: `/post/${postId}`,
			type: 'author_post',
			submissionVersion: publicationVersion
		});
	return json({ post: serializePost(await postRef.get()) });
};
