import type { FirestoreEntity, FirestoreTimestamp } from './firestore';

export type NotificationType =
	'comment' | 'reply' | 'follow' | 'upvote' | 'story_update' | 'mention';
export type NotificationTargetType = 'user' | 'post' | 'story' | 'chapter' | 'comment';

export interface Notification extends FirestoreEntity {
	userId: string;
	actorId: string;
	actorName: string;
	actorAvatarUrl: string | null;
	type: NotificationType;
	targetType: NotificationTargetType;
	targetId: string;
	isRead: boolean;
	createdAt: FirestoreTimestamp;
	readAt: FirestoreTimestamp | null;
}
