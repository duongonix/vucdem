import { error } from '@sveltejs/kit';
import type { QueryDocumentSnapshot } from 'firebase-admin/firestore';
export function serializeStory(
	snapshot: QueryDocumentSnapshot | FirebaseFirestore.DocumentSnapshot
) {
	const data = snapshot.data();
	if (!data) error(404, 'Không tìm thấy truyện.');
	return {
		id: snapshot.id,
		...data,
		format: data.format === 'short' ? 'short' : 'serial',
		contentFormat: ['audio', 'interactive', 'mixed'].includes(data.contentFormat)
			? data.contentFormat
			: 'text',
		commentCount: Number(data.commentCount ?? 0),
		ratingCount: Number(data.ratingCount ?? 0),
		ratingSum: Number(data.ratingSum ?? 0),
		ratingAverage: Number(data.ratingAverage ?? 0),
		createdAt: data.createdAt?.toMillis?.() ?? 0,
		updatedAt: data.updatedAt?.toMillis?.() ?? 0,
		publishedAt: data.publishedAt?.toMillis?.() ?? null,
		isPinned: data.isPinned === true,
		pinnedAt: data.pinnedAt?.toMillis?.() ?? null,
		pinnedBy: typeof data.pinnedBy === 'string' ? data.pinnedBy : null,
		moderationStatus:
			data.moderationStatus ??
			(['ongoing', 'completed', 'hiatus'].includes(data.status) ? 'approved' : 'not_submitted'),
		submissionVersion: Number(data.submissionVersion ?? 0),
		submittedAt: data.submittedAt?.toMillis?.() ?? null,
		reviewedAt: data.reviewedAt?.toMillis?.() ?? null,
		reviewedBy: typeof data.reviewedBy === 'string' ? data.reviewedBy : null,
		rejectionReason: typeof data.rejectionReason === 'string' ? data.rejectionReason : null
	};
}
