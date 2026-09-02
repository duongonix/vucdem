import { requireFirebaseUser } from '$lib/server/auth';
import { getFirebaseAdminDb } from '$lib/server/firebase-admin';
import { serializeNotification } from '$lib/server/notifications';
import { json, type RequestHandler } from '@sveltejs/kit';
import { FieldValue } from 'firebase-admin/firestore';

function isMissingIndex(cause: unknown): boolean {
	const code = (cause as { code?: number | string })?.code;
	return code === 9 || code === '9' || code === 'FAILED_PRECONDITION';
}

export const GET: RequestHandler = async (event) => {
	const identity = await requireFirebaseUser(event);
	const unread = event.url.searchParams.get('unread') === 'true';
	const db = getFirebaseAdminDb();
	let query: FirebaseFirestore.Query = db
		.collection('notifications')
		.where('userId', '==', identity.uid);
	if (unread) query = query.where('isRead', '==', false);
	let documents: FirebaseFirestore.QueryDocumentSnapshot[];
	try {
		documents = (
			await query
				.orderBy('createdAt', 'desc')
				.limit(unread ? 100 : 30)
				.get()
		).docs;
	} catch (cause) {
		if (!isMissingIndex(cause)) throw cause;
		const fallback = await db
			.collection('notifications')
			.where('userId', '==', identity.uid)
			.limit(500)
			.get();
		documents = fallback.docs
			.filter((document) => !unread || document.get('isRead') === false)
			.sort(
				(a, b) => (b.get('createdAt')?.toMillis?.() ?? 0) - (a.get('createdAt')?.toMillis?.() ?? 0)
			)
			.slice(0, unread ? 100 : 30);
	}
	return json({
		notifications: documents.map(serializeNotification),
		unreadCount: unread ? documents.length : undefined
	});
};
export const PATCH: RequestHandler = async (event) => {
	const identity = await requireFirebaseUser(event);
	const body = await event.request.json().catch(() => ({}));
	if (body.action !== 'read-all') return json({ ok: false }, { status: 400 });
	const db = getFirebaseAdminDb();
	let documents: FirebaseFirestore.QueryDocumentSnapshot[];
	try {
		documents = (
			await db
				.collection('notifications')
				.where('userId', '==', identity.uid)
				.where('isRead', '==', false)
				.limit(400)
				.get()
		).docs;
	} catch (cause) {
		if (!isMissingIndex(cause)) throw cause;
		documents = (
			await db.collection('notifications').where('userId', '==', identity.uid).limit(500).get()
		).docs
			.filter((document) => document.get('isRead') === false)
			.slice(0, 400);
	}
	const batch = db.batch();
	for (const doc of documents)
		batch.update(doc.ref, { isRead: true, readAt: FieldValue.serverTimestamp() });
	await batch.commit();
	return json({ ok: true, count: documents.length });
};
