import { error } from '@sveltejs/kit';
export function serializeReport(snapshot: FirebaseFirestore.DocumentSnapshot) {
	const data = snapshot.data();
	if (!data) error(404, 'Không tìm thấy báo cáo.');
	return {
		id: snapshot.id,
		...data,
		createdAt: data.createdAt?.toMillis?.() ?? 0,
		reviewedAt: data.reviewedAt?.toMillis?.() ?? null
	};
}
