import type { FirestoreEntity, FirestoreTimestamp } from './firestore';

export type NotificationType =
	| 'comment'
	| 'reply'
	| 'follow'
	| 'upvote'
	| 'story_update'
	| 'mention'
	| 'content_approved'
	| 'content_rejected'
	| 'story_rating'
	| 'story_status'
	| 'content_reported'
	| 'content_hidden'
	| 'system_announcement'
	| 'reading_reminder'
	| 'author_post'
	| 'author_story'
	| 'author_chapter';
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
	message?: string | null;
	destination?: string | null;
}
