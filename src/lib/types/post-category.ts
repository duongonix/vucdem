import type { FirestoreEntity, FirestoreTimestamp } from './firestore';

export interface PostCategoryDefinition extends FirestoreEntity {
	name: string;
	description: string;
	order: number;
	status: 'active' | 'inactive';
	createdAt: FirestoreTimestamp;
	updatedAt: FirestoreTimestamp;
}
