import type { FirestoreEntity, FirestoreTimestamp } from './firestore';

export type ReportTargetType = 'post' | 'story' | 'comment';
export type ReportReason = 'spam' | 'harassment' | 'nsfw' | 'stolen_content' | 'other';
export type ReportStatus = 'open' | 'reviewing' | 'resolved' | 'dismissed';

export interface Report extends FirestoreEntity {
	reporterId: string;
	targetType: ReportTargetType;
	targetId: string;
	reason: ReportReason;
	explanation: string;
	status: ReportStatus;
	createdAt: FirestoreTimestamp;
	reviewedBy: string | null;
	reviewedAt: FirestoreTimestamp | null;
}
