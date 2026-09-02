import type { FirestoreEntity, TimestampedEntity } from './firestore';
import type { CloudinaryAsset } from './media';

export type UserRole = 'user' | 'moderator' | 'admin';
export type ApplicationRole = 'guest' | UserRole;
export type UserStatus = 'active' | 'suspended' | 'banned';

export interface User extends FirestoreEntity, TimestampedEntity {
	username: string;
	usernameNormalized: string;
	displayName: string;
	avatar: CloudinaryAsset | null;
	bio: string;
	role: UserRole;
	status: UserStatus;
	verify: boolean;
	followersCount: number;
	followingCount: number;
	postCount: number;
	storyCount: number;
}

export type PublicUserProfile = Omit<User, 'status' | 'createdAt' | 'updatedAt'>;
