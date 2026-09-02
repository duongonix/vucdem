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
	if (!(type in statuses) || !statuses[type].includes(body.status))
		error(400, 'Trạng thái quản trị không hợp lệ.');
	const ref = getFirebaseAdminDb().collection(type).doc(event.params.id!);
	if (!(await ref.get()).exists) error(404);
	await ref.update({
		status: body.status,
		moderatedBy: identity.uid,
		moderatedAt: FieldValue.serverTimestamp(),
		updatedAt: FieldValue.serverTimestamp()
	});
	return json({ ok: true, status: body.status });
};
