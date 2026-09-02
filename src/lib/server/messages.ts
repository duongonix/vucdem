import { error } from '@sveltejs/kit';
import { FieldValue, Timestamp } from 'firebase-admin/firestore';
import { getFirebaseAdminDb } from './firebase-admin';
import type { Conversation, DirectMessage, MessageParticipant } from '$lib/types';

const MAX_MESSAGE_LENGTH = 4000;

function iso(value: unknown): string {
	return value instanceof Timestamp ? value.toDate().toISOString() : new Date(0).toISOString();
}

export function directConversationId(first: string, second: string): string {
	return [first, second].sort().join('--');
}

export async function assertParticipant(conversationId: string, uid: string) {
	const ref = getFirebaseAdminDb().collection('conversations').doc(conversationId);
	const snapshot = await ref.get();
	if (!snapshot.exists) error(404, 'Không tìm thấy cuộc trò chuyện.');
	const participantIds = snapshot.get('participantIds');
	if (!Array.isArray(participantIds) || !participantIds.includes(uid))
		error(403, 'Bạn không có quyền xem cuộc trò chuyện này.');
	return { ref, snapshot };
}

export async function serializeConversation(
	snapshot: FirebaseFirestore.DocumentSnapshot,
	uid: string
): Promise<Conversation> {
	const participantIds = snapshot.get('participantIds') as string[];
	const otherId = participantIds.find((id) => id !== uid);
	if (!otherId) error(500, 'Dữ liệu cuộc trò chuyện không hợp lệ.');
	const user = await getFirebaseAdminDb().collection('users').doc(otherId).get();
	if (!user.exists) error(404, 'Người dùng không còn tồn tại.');
	const avatar = user.get('avatar') as { url?: string } | null;
	const participant: MessageParticipant = {
		id: user.id,
		username: String(user.get('username') ?? ''),
		displayName: String(user.get('displayName') ?? user.get('username') ?? 'Người dùng'),
		avatarUrl: avatar?.url ?? null,
		online: false
	};
	return {
		id: snapshot.id,
		participant,
		lastMessage: String(snapshot.get('lastMessage') ?? 'Bắt đầu một cuộc trò chuyện…'),
		lastMessageAt: iso(snapshot.get('lastMessageAt') ?? snapshot.get('createdAt')),
		unreadCount: Number(snapshot.get(`unreadCounts.${uid}`) ?? 0),
		muted: ((snapshot.get('mutedBy') as string[] | undefined) ?? []).includes(uid)
	};
}

export function serializeMessage(
	snapshot: FirebaseFirestore.DocumentSnapshot,
	conversationId: string,
	viewerId: string
): DirectMessage {
	const readBy = (snapshot.get('readBy') as string[] | undefined) ?? [];
	return {
		id: snapshot.id,
		conversationId,
		senderId: String(snapshot.get('senderId')),
		content: String(snapshot.get('content')),
		createdAt: iso(snapshot.get('createdAt')),
		status: readBy.some((id) => id !== viewerId) ? 'read' : 'delivered'
	};
}

export function validateMessageContent(value: unknown): string {
	const content = typeof value === 'string' ? value.trim() : '';
	if (!content) error(400, 'Tin nhắn không được để trống.');
	if (content.length > MAX_MESSAGE_LENGTH)
		error(400, `Tin nhắn không được vượt quá ${MAX_MESSAGE_LENGTH} ký tự.`);
	return content;
}

export async function markRead(conversationId: string, uid: string): Promise<void> {
	const { ref } = await assertParticipant(conversationId, uid);
	const db = getFirebaseAdminDb();
	const recent = await ref.collection('messages').orderBy('createdAt', 'desc').limit(100).get();
	await db.runTransaction(async (transaction) => {
		const current = await transaction.get(ref);
		if (!current.exists) error(404, 'Không tìm thấy cuộc trò chuyện.');
		transaction.update(ref, {
			[`unreadCounts.${uid}`]: 0,
			updatedAt: FieldValue.serverTimestamp()
		});
	});
	const batch = db.batch();
	for (const message of recent.docs) {
		if (message.get('senderId') !== uid)
			batch.update(message.ref, { readBy: FieldValue.arrayUnion(uid) });
	}
	await batch.commit();
}
