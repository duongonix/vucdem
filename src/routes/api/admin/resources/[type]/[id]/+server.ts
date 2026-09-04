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
	const ref = getFirebaseAdminDb().collection(type).doc(event.params.id!);
	if (!(await ref.get()).exists) error(404);
	const remainsPublic =
		(type === 'posts' && body.status === 'published') ||
		(type === 'stories' && ['ongoing', 'completed', 'hiatus'].includes(body.status));
	await ref.update({
		status: body.status,
		...((type === 'posts' || type === 'stories') && !remainsPublic
			? { isPinned: false, pinnedAt: null, pinnedBy: null }
			: {}),
		moderatedBy: identity.uid,
		moderatedAt: FieldValue.serverTimestamp(),
		updatedAt: FieldValue.serverTimestamp()
	});
	return json({ ok: true, status: body.status });
};
