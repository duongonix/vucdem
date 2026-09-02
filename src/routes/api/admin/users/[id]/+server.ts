import { requireApplicationRole } from '$lib/server/auth';
import { getFirebaseAdminDb } from '$lib/server/firebase-admin';
import { error, json, type RequestHandler } from '@sveltejs/kit';
import { FieldValue } from 'firebase-admin/firestore';
export const PATCH: RequestHandler = async (event) => {
	const { identity } = await requireApplicationRole(event, ['admin']);
	const body = await event.request.json().catch(() => ({}));
	if (identity.uid === event.params.id && (body.role !== undefined || body.status !== undefined))
		error(400, 'Không thể thay đổi vai trò hoặc khóa chính mình.');
	const updates: Record<string, unknown> = { updatedAt: FieldValue.serverTimestamp() };
	if (body.role !== undefined) {
		if (!['user', 'moderator', 'admin'].includes(body.role)) error(400);
		updates.role = body.role;
	}
	if (body.status !== undefined) {
		if (!['active', 'suspended', 'banned'].includes(body.status)) error(400);
		updates.status = body.status;
	}
	if (body.verify !== undefined) {
		if (typeof body.verify !== 'boolean') error(400, 'Trạng thái xác minh không hợp lệ.');
		updates.verify = body.verify;
	}
	if (Object.keys(updates).length === 1) error(400);
	const ref = getFirebaseAdminDb().collection('users').doc(event.params.id!);
	if (!(await ref.get()).exists) error(404);
	await ref.update(updates);
	if (typeof updates.verify === 'boolean') {
		const writer = getFirebaseAdminDb().bulkWriter();
		for (const collection of ['posts', 'stories', 'comments']) {
			const authored = await getFirebaseAdminDb()
				.collection(collection)
				.where('authorId', '==', event.params.id)
				.get();
			for (const document of authored.docs)
				writer.update(document.ref, { authorVerified: updates.verify });
		}
		await writer.close();
	}
	return json({ ok: true });
};
