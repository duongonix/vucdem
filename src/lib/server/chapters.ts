import { error } from '@sveltejs/kit';

export function serializeChapter(snapshot: FirebaseFirestore.DocumentSnapshot) {
	const data = snapshot.data();
	if (!data) error(404, 'Không tìm thấy chương truyện.');
	return {
		id: snapshot.id,
		...data,
		contentFormat: ['audio', 'interactive'].includes(data.contentFormat)
			? data.contentFormat
			: 'text',
		audio: data.audio ?? null,
		commentCount: Number(data.commentCount ?? 0),
		createdAt: data.createdAt?.toMillis?.() ?? 0,
		updatedAt: data.updatedAt?.toMillis?.() ?? 0,
		publishedAt: data.publishedAt?.toMillis?.() ?? null,
		moderationStatus:
			data.moderationStatus ?? (data.status === 'published' ? 'approved' : 'not_submitted'),
		submissionVersion: Number(data.submissionVersion ?? 0),
		submittedAt: data.submittedAt?.toMillis?.() ?? null,
		reviewedAt: data.reviewedAt?.toMillis?.() ?? null,
		reviewedBy: typeof data.reviewedBy === 'string' ? data.reviewedBy : null,
		rejectionReason: typeof data.rejectionReason === 'string' ? data.rejectionReason : null
	};
}
