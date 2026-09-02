import type { Timestamp } from 'firebase/firestore';

/** Canonical timestamp returned by persisted Firestore documents. */
export type FirestoreTimestamp = Timestamp;

export interface FirestoreEntity {
	id: string;
}

export interface TimestampedEntity {
	createdAt: FirestoreTimestamp;
	updatedAt: FirestoreTimestamp;
}
