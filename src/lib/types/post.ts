import type { AuthorSnapshot } from './author';
import type { FirestoreEntity, FirestoreTimestamp, TimestampedEntity } from './firestore';
import type { CloudinaryAsset } from './media';

export type PostCategory = string;

export type PostStatus = 'draft' | 'published' | 'hidden' | 'removed';

export interface Post extends FirestoreEntity, TimestampedEntity, AuthorSnapshot {
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
}
