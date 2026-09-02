import { error } from '@sveltejs/kit';
export function serializeCommunity(snapshot: FirebaseFirestore.DocumentSnapshot) {
	const data = snapshot.data();
	if (!data) error(404, 'Không tìm thấy cộng đồng.');
	return {
		id: snapshot.id,
		...data,
		createdAt: data.createdAt?.toMillis?.() ?? 0,
		updatedAt: data.updatedAt?.toMillis?.() ?? 0
	};
}
