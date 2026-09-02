import { requireApplicationRole } from '$lib/server/auth';
import { getFirebaseAdminDb } from '$lib/server/firebase-admin';
import { serializeReport } from '$lib/server/reports';
import { error, json, type RequestHandler } from '@sveltejs/kit';
import { FieldValue } from 'firebase-admin/firestore';
export const PATCH: RequestHandler = async (event) => {
	const { identity } = await requireApplicationRole(event, ['moderator', 'admin']);
	const body = await event.request.json().catch(() => ({}));
	if (!['reviewing', 'resolved', 'dismissed'].includes(body.status))
		error(400, 'Trạng thái không hợp lệ.');
	const ref = getFirebaseAdminDb().collection('reports').doc(event.params.id!);
	if (!(await ref.get()).exists) error(404);
	await ref.update({
		status: body.status,
		reviewedBy: identity.uid,
		reviewedAt: FieldValue.serverTimestamp()
	});
	return json({ report: serializeReport(await ref.get()) });
};
