import { requireApplicationRole } from '$lib/server/auth';
import { getFirebaseAdminDb } from '$lib/server/firebase-admin';
import { error, json, type RequestHandler } from '@sveltejs/kit';
import { FieldValue } from 'firebase-admin/firestore';
const collections = { post: 'posts', story: 'stories', comment: 'comments' } as const;
export const PATCH: RequestHandler = async (event) => {
	const { identity } = await requireApplicationRole(event, ['moderator', 'admin']);
	const body = await event.request.json().catch(() => ({}));
	if (
		!(body.targetType in collections) ||
		typeof body.targetId !== 'string' ||
		!['hide', 'restore', 'remove'].includes(body.action)
	)
		error(400, 'Thao tác kiểm duyệt không hợp lệ.');
	const ref = getFirebaseAdminDb()
		.collection(collections[body.targetType as keyof typeof collections])
		.doc(body.targetId);
	const snapshot = await ref.get();
	if (!snapshot.exists) error(404);
	const currentStatus = snapshot.get('status');
	const fallbackStatus = body.targetType === 'story' ? 'ongoing' : 'published';
	const status =
		body.action === 'hide'
			? 'hidden'
			: body.action === 'remove'
				? 'removed'
				: snapshot.get('moderationPreviousStatus') || fallbackStatus;
	await ref.update({
		status,
		...(body.action === 'restore'
			? { moderationPreviousStatus: FieldValue.delete() }
			: !['hidden', 'removed'].includes(currentStatus)
				? { moderationPreviousStatus: currentStatus }
				: {}),
		moderatedBy: identity.uid,
		moderatedAt: FieldValue.serverTimestamp(),
		updatedAt: FieldValue.serverTimestamp()
	});
	return json({ ok: true, status });
};
