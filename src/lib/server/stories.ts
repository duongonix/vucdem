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
		publishedAt: data.publishedAt?.toMillis?.() ?? null
	};
}
