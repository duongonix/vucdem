import type { FirestoreEntity, FirestoreTimestamp } from './firestore';

export type VoteValue = 1;
export type VoteTargetType = 'post' | 'story' | 'comment';

export interface Vote extends FirestoreEntity {
	value: VoteValue;
	createdAt: FirestoreTimestamp;
	updatedAt: FirestoreTimestamp;
}

export type BookmarkTargetType = 'post' | 'story';

export interface Bookmark extends FirestoreEntity {
	targetType: BookmarkTargetType;
	targetId: string;
	createdAt: FirestoreTimestamp;
}

/** A user ID is represented by `id`; direction is determined by the containing subcollection. */
export interface Follow extends FirestoreEntity {
	createdAt: FirestoreTimestamp;
}
