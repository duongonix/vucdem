import type { AuthorSnapshot } from './author';
import type { FirestoreEntity, TimestampedEntity } from './firestore';

export type CommentTargetType = 'post' | 'story' | 'chapter';
export type CommentStatus = 'published' | 'hidden' | 'removed';

export interface Comment extends FirestoreEntity, TimestampedEntity, AuthorSnapshot {
	targetType: CommentTargetType;
	targetId: string;
	parentId: string | null;
	content: string;
	isSpoiler: boolean;
	voteScore: number;
	replyCount: number;
	status: CommentStatus;
}
