import type { FirestoreEntity, TimestampedEntity } from './firestore';
import type { CloudinaryAsset } from './media';

export type CommunityStatus = 'active' | 'hidden' | 'removed';

export interface Community extends FirestoreEntity, TimestampedEntity {
	ownerId: string;
	slug: string;
	name: string;
	nameNormalized: string;
	description: string;
	icon: CloudinaryAsset | null;
	banner: CloudinaryAsset | null;
	memberCount: number;
	postCount: number;
	status: CommunityStatus;
}
