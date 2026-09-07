import { requireApplicationRole } from '$lib/server/auth';
import { getFirebaseAdminDb } from '$lib/server/firebase-admin';
import { error, json, type RequestHandler } from '@sveltejs/kit';
import { FieldValue } from 'firebase-admin/firestore';

const statuses = {
	posts: ['published', 'hidden', 'removed'],
	stories: ['ongoing', 'hiatus', 'completed', 'hidden', 'removed'],
	comments: ['published', 'hidden', 'removed'],
	communities: ['active', 'hidden', 'removed']
} as const;

export const PATCH: RequestHandler = async (event) => {
	const { identity } = await requireApplicationRole(event, ['admin']);
	const type = event.params.type as keyof typeof statuses;
	const body = await event.request.json().catch(() => ({}));
	if (body.action === 'pin') {
		if (!['posts', 'stories'].includes(type) || typeof body.pinned !== 'boolean')
			error(400, 'Yêu cầu ghim không hợp lệ.');
		const ref = getFirebaseAdminDb().collection(type).doc(event.params.id!);
		const snapshot = await ref.get();
		if (!snapshot.exists) error(404);
		const publicStatuses = type === 'posts' ? ['published'] : ['ongoing', 'completed', 'hiatus'];
		if (body.pinned && !publicStatuses.includes(String(snapshot.get('status'))))
			error(400, 'Chỉ có thể ghim nội dung đang công khai.');
		await ref.update({
			isPinned: body.pinned,
			pinnedAt: body.pinned ? FieldValue.serverTimestamp() : null,
			pinnedBy: body.pinned ? identity.uid : null,
			updatedAt: FieldValue.serverTimestamp()
		});
		return json({ ok: true, pinned: body.pinned });
	}
	if (!(type in statuses) || !statuses[type].includes(body.status))
		error(400, 'Trạng thái quản trị không hợp lệ.');
	const db = getFirebaseAdminDb();
	const ref = db.collection(type).doc(event.params.id!);
	const snapshot = await ref.get();
	if (!snapshot.exists) error(404);
	const remainsPublic =
		(type === 'posts' && body.status === 'published') ||
		(type === 'stories' && ['ongoing', 'completed', 'hiatus'].includes(body.status));
	const now = FieldValue.serverTimestamp();
	const batch = db.batch();
	batch.update(ref, {
		status: body.status,
		...((type === 'posts' || type === 'stories') && !remainsPublic
			? { isPinned: false, pinnedAt: null, pinnedBy: null }
			: {}),
		moderatedBy: identity.uid,
		moderatedAt: now,
		updatedAt: now
	});
	if (
		['posts', 'stories', 'comments'].includes(type) &&
		['hidden', 'removed'].includes(body.status) &&
		!['hidden', 'removed'].includes(String(snapshot.get('status'))) &&
		String(snapshot.get('authorId')) !== identity.uid
	) {
		const destination =
			type === 'posts'
				? `/post/${snapshot.id}`
				: type === 'stories'
					? `/story/${String(snapshot.get('slug') ?? '')}`
					: '/notifications';
		batch.set(
			db.collection('notifications').doc(`content_hidden_${type}_${snapshot.id}_${body.status}`),
			{
				userId: String(snapshot.get('authorId')),
				actorId: identity.uid,
				actorName: 'Ban quản trị Vực Đêm',
				actorAvatarUrl: null,
				type: 'content_hidden',
				targetType: type === 'posts' ? 'post' : type === 'stories' ? 'story' : 'comment',
				targetId: snapshot.id,
				message:
					body.status === 'hidden'
						? 'Nội dung của bạn đã bị ẩn tạm thời bởi Ban quản trị.'
						: 'Nội dung của bạn đã bị gỡ bởi Ban quản trị.',
				destination,
				isRead: false,
				createdAt: now,
				readAt: null
			}
		);
	}
	await batch.commit();
	return json({ ok: true, status: body.status });
};
