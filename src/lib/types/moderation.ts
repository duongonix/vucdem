import type { FirestoreTimestamp } from './firestore';

export type ModerationStatus = 'not_submitted' | 'pending' | 'approved' | 'rejected';
export type ModerationDecision = 'approved' | 'rejected';

export interface ModerationFields {
	moderationStatus: ModerationStatus;
	submissionVersion: number;
	submittedAt: FirestoreTimestamp | null;
	reviewedAt: FirestoreTimestamp | null;
	reviewedBy: string | null;
	rejectionReason: string | null;
}

export interface ModerationReview {
	id: string;
	decision: ModerationDecision;
	reason: string | null;
	reviewerId: string;
	reviewerName: string;
	submissionVersion: number;
	createdAt: FirestoreTimestamp;
}
