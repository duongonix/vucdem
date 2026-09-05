import { error } from '@sveltejs/kit';
import type { QueryDocumentSnapshot } from 'firebase-admin/firestore';
import { Timestamp } from 'firebase-admin/firestore';

export function serializePost(
	snapshot: QueryDocumentSnapshot | FirebaseFirestore.DocumentSnapshot
) {
	const data = snapshot.data();
	if (!data) error(404, 'Không tìm thấy bài viết.');
	return {
		id: snapshot.id,
		...data,
		createdAt: data.createdAt?.toMillis?.() ?? 0,
		updatedAt: data.updatedAt?.toMillis?.() ?? 0,
		publishedAt: data.publishedAt?.toMillis?.() ?? null,
		isPinned: data.isPinned === true,
		pinnedAt: data.pinnedAt?.toMillis?.() ?? null,
		pinnedBy: typeof data.pinnedBy === 'string' ? data.pinnedBy : null,
		moderationStatus:
			data.moderationStatus ?? (data.status === 'published' ? 'approved' : 'not_submitted'),
		submissionVersion: Number(data.submissionVersion ?? 0),
		submittedAt: data.submittedAt?.toMillis?.() ?? null,
		reviewedAt: data.reviewedAt?.toMillis?.() ?? null,
		reviewedBy: typeof data.reviewedBy === 'string' ? data.reviewedBy : null,
		rejectionReason: typeof data.rejectionReason === 'string' ? data.rejectionReason : null
	};
}

export function encodePostCursor(snapshot: QueryDocumentSnapshot, field: string): string {
	const value = snapshot.get(field);
	const serialized = value instanceof Timestamp ? value.toMillis() : value;
	return Buffer.from(JSON.stringify({ id: snapshot.id, value: serialized }), 'utf8').toString(
		'base64url'
	);
}

export function decodePostCursor(value: string, field: string): { id: string; value: unknown } {
	try {
		const parsed = JSON.parse(Buffer.from(value, 'base64url').toString('utf8')) as {
			id?: unknown;
			value?: unknown;
		};
		if (typeof parsed.id !== 'string') throw new Error('invalid');
		return {
			id: parsed.id,
			value:
				field === 'createdAt' && typeof parsed.value === 'number'
					? Timestamp.fromMillis(parsed.value)
					: parsed.value
		};
	} catch {
		error(400, 'Cursor bài viết không hợp lệ.');
	}
}
