import { FieldValue } from 'firebase-admin/firestore';
export type NotificationKind =
	| 'comment'
	| 'reply'
	| 'follow'
	| 'upvote'
	| 'story_update'
	| 'mention'
	| 'content_approved'
	| 'content_rejected';
export function createNotification(
	transaction: FirebaseFirestore.Transaction,
	db: FirebaseFirestore.Firestore,
	input: {
		id?: string;
		userId: string;
		actorId: string;
		actorName: string;
		actorAvatarUrl: string | null;
		type: NotificationKind;
		targetType: 'user' | 'post' | 'story' | 'chapter' | 'comment';
		targetId: string;
		message?: string | null;
		destination?: string | null;
	}
) {
	if (input.userId === input.actorId) return;
	const { id, ...data } = input;
	const ref = id ? db.collection('notifications').doc(id) : db.collection('notifications').doc();
	transaction.set(
		ref,
		{ ...data, isRead: false, createdAt: FieldValue.serverTimestamp(), readAt: null },
		{ merge: false }
	);
}
export function actorSnapshot(user: FirebaseFirestore.DocumentSnapshot) {
	const avatar = user.get('avatar') as { url?: unknown } | null;
	return {
		actorName: String(user.get('displayName') ?? user.get('username') ?? 'Thành viên'),
		actorAvatarUrl: typeof avatar?.url === 'string' ? avatar.url : null
	};
}
export function serializeNotification(snapshot: FirebaseFirestore.DocumentSnapshot) {
	const data = snapshot.data()!;
	return {
		id: snapshot.id,
		...data,
		createdAt: data.createdAt?.toMillis?.() ?? 0,
		readAt: data.readAt?.toMillis?.() ?? null
	};
}
