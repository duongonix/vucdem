import type { QueryDocumentSnapshot } from 'firebase-admin/firestore';
export function serializeComment(
	snapshot: QueryDocumentSnapshot | FirebaseFirestore.DocumentSnapshot
) {
	const data = snapshot.data();
	if (!data) throw new Error('Comment snapshot is missing data.');
	return {
		id: snapshot.id,
		...data,
		createdAt: data.createdAt?.toMillis?.() ?? Date.now(),
		updatedAt: data.updatedAt?.toMillis?.() ?? Date.now()
	};
}
export function encodeCommentCursor(snapshot: QueryDocumentSnapshot): string {
	return Buffer.from(
		JSON.stringify({ createdAt: snapshot.get('createdAt').toMillis(), id: snapshot.id })
	).toString('base64url');
}
export function decodeCommentCursor(value: string): { createdAt: Date; id: string } {
	try {
		const parsed = JSON.parse(Buffer.from(value, 'base64url').toString()) as {
			createdAt: number;
			id: string;
		};
		if (!Number.isFinite(parsed.createdAt) || !parsed.id) throw new Error();
		return { createdAt: new Date(parsed.createdAt), id: parsed.id };
	} catch {
		throw new Error('Cursor bình luận không hợp lệ.');
	}
}
