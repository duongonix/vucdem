import type { AuthorSnapshot } from './author';
import type { FirestoreEntity, FirestoreTimestamp, TimestampedEntity } from './firestore';
import type { CloudinaryAsset } from './media';
import type { ModerationFields } from './moderation';

export type PostCategory = string;

export type PostStatus = 'draft' | 'published' | 'hidden' | 'removed';

export interface Post extends FirestoreEntity, TimestampedEntity, AuthorSnapshot, ModerationFields {
	title: string;
	content: string;
	excerpt: string;
	category: PostCategory;
	tags: string[];
	communityId: string | null;
	thumbnail: CloudinaryAsset | null;
	images: CloudinaryAsset[];
	voteScore: number;
	commentCount: number;
	viewCount: number;
	status: PostStatus;
	publishedAt: FirestoreTimestamp | null;
	isPinned: boolean;
	pinnedAt: FirestoreTimestamp | null;
	pinnedBy: string | null;
}
