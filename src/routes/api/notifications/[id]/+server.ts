import { requireFirebaseUser } from '$lib/server/auth';
import { getFirebaseAdminDb } from '$lib/server/firebase-admin';
import { error, json, type RequestHandler } from '@sveltejs/kit';
import { FieldValue } from 'firebase-admin/firestore';
export const PATCH: RequestHandler = async (event) => {
	const identity = await requireFirebaseUser(event);
	const ref = getFirebaseAdminDb().collection('notifications').doc(event.params.id!);
	const doc = await ref.get();
	if (!doc.exists || doc.get('userId') !== identity.uid) error(404);
	await ref.update({ isRead: true, readAt: FieldValue.serverTimestamp() });
	return json({ ok: true });
};
