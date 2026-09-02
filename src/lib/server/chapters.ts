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
		publishedAt: data.publishedAt?.toMillis?.() ?? null
	};
}
