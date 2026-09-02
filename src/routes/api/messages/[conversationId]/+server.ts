import { requireActiveFirebaseUser } from '$lib/server/auth';
import { getFirebaseAdminDb } from '$lib/server/firebase-admin';
import {
	assertParticipant,
	markRead,
	serializeConversation,
	serializeMessage,
	validateMessageContent
} from '$lib/server/messages';
import { error, json, type RequestHandler } from '@sveltejs/kit';
import { FieldValue } from 'firebase-admin/firestore';

export const GET: RequestHandler = async (event) => {
	const { identity } = await requireActiveFirebaseUser(event);
	const { ref } = await assertParticipant(event.params.conversationId!, identity.uid);
	const snapshot = await ref.collection('messages').orderBy('createdAt', 'desc').limit(100).get();
	return json({
		messages: snapshot.docs
			.reverse()
			.map((document) => serializeMessage(document, ref.id, identity.uid))
	});
};

export const POST: RequestHandler = async (event) => {
	const { identity } = await requireActiveFirebaseUser(event);
	const body = await event.request.json().catch(() => ({}));
	const content = validateMessageContent(body.content);
	const { ref, snapshot } = await assertParticipant(event.params.conversationId!, identity.uid);
	const recipientId = (snapshot.get('participantIds') as string[]).find(
		(id) => id !== identity.uid
	);
	if (!recipientId) error(400, 'Người nhận không hợp lệ.');
	const messageRef = ref.collection('messages').doc();
	const db = getFirebaseAdminDb();
	await db.runTransaction(async (transaction) => {
		transaction.create(messageRef, {
			senderId: identity.uid,
			content,
			createdAt: FieldValue.serverTimestamp(),
			readBy: [identity.uid]
		});
		transaction.update(ref, {
			lastMessage: content,
			lastMessageAt: FieldValue.serverTimestamp(),
			lastSenderId: identity.uid,
			[`unreadCounts.${recipientId}`]: FieldValue.increment(1),
			hiddenBy: FieldValue.arrayRemove(identity.uid, recipientId),
			updatedAt: FieldValue.serverTimestamp()
		});
	});
	return json({ message: serializeMessage(await messageRef.get(), ref.id, identity.uid) });
};

export const PATCH: RequestHandler = async (event) => {
	const { identity } = await requireActiveFirebaseUser(event);
	const body = await event.request.json().catch(() => ({}));
	if (body.action === 'read') {
		await markRead(event.params.conversationId!, identity.uid);
		return json({ ok: true });
	}
	if (body.action === 'mute') {
		const { ref, snapshot } = await assertParticipant(event.params.conversationId!, identity.uid);
		const muted = ((snapshot.get('mutedBy') as string[] | undefined) ?? []).includes(identity.uid);
		await ref.update({
			mutedBy: muted ? FieldValue.arrayRemove(identity.uid) : FieldValue.arrayUnion(identity.uid)
		});
		return json({ conversation: await serializeConversation(await ref.get(), identity.uid) });
	}
	error(400, 'Thao tác không hợp lệ.');
};

export const DELETE: RequestHandler = async (event) => {
	const { identity } = await requireActiveFirebaseUser(event);
	const { ref } = await assertParticipant(event.params.conversationId!, identity.uid);
	await ref.update({ hiddenBy: FieldValue.arrayUnion(identity.uid) });
	return json({ ok: true });
};
