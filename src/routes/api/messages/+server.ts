import { requireActiveFirebaseUser } from '$lib/server/auth';
import { getFirebaseAdminDb } from '$lib/server/firebase-admin';
import { directConversationId, serializeConversation } from '$lib/server/messages';
import { json, error, type RequestHandler } from '@sveltejs/kit';
import { FieldValue } from 'firebase-admin/firestore';

export const GET: RequestHandler = async (event) => {
	const { identity } = await requireActiveFirebaseUser(event);
	const db = getFirebaseAdminDb();
	const snapshot = await db
		.collection('conversations')
		.where('participantIds', 'array-contains', identity.uid)
		.limit(50)
		.get();
	const conversations = await Promise.all(
		snapshot.docs
			.filter(
				(document) =>
					!((document.get('hiddenBy') as string[] | undefined) ?? []).includes(identity.uid)
			)
			.map((document) => serializeConversation(document, identity.uid))
	);
	conversations.sort((a, b) => b.lastMessageAt.localeCompare(a.lastMessageAt));
	return json({
		conversations,
		unreadCount: conversations.reduce((total, item) => total + item.unreadCount, 0)
	});
};

export const POST: RequestHandler = async (event) => {
	const { identity } = await requireActiveFirebaseUser(event);
	const body = await event.request.json().catch(() => ({}));
	const participantId = typeof body.participantId === 'string' ? body.participantId : '';
	if (!participantId || participantId === identity.uid) error(400, 'Người nhận không hợp lệ.');
	const db = getFirebaseAdminDb();
	const participant = await db.collection('users').doc(participantId).get();
	if (!participant.exists || participant.get('status') !== 'active')
		error(404, 'Không tìm thấy người dùng.');
	const id = directConversationId(identity.uid, participantId);
	const ref = db.collection('conversations').doc(id);
	const existing = await ref.get();
	if (!existing.exists) {
		await ref.create({
			participantIds: [identity.uid, participantId].sort(),
			lastMessage: '',
			lastMessageAt: FieldValue.serverTimestamp(),
			lastSenderId: null,
			unreadCounts: { [identity.uid]: 0, [participantId]: 0 },
			mutedBy: [],
			hiddenBy: [],
			createdAt: FieldValue.serverTimestamp(),
			updatedAt: FieldValue.serverTimestamp()
		});
	} else {
		await ref.update({ hiddenBy: FieldValue.arrayRemove(identity.uid) });
	}
	return json({ conversation: await serializeConversation(await ref.get(), identity.uid) });
};
