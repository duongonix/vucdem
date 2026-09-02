import { optionalFirebaseUser } from '$lib/server/auth';
import { getFirebaseAdminDb } from '$lib/server/firebase-admin';
import { serializePost } from '$lib/server/posts';
import { serializeStory } from '$lib/server/stories';
import { normalizeUsername } from '$lib/validation/auth';
import { error, json, type RequestHandler } from '@sveltejs/kit';
import { FieldPath, Timestamp } from 'firebase-admin/firestore';
function encode(ms: number, id: string) {
	return Buffer.from(JSON.stringify([ms, id])).toString('base64url');
}
function decode(raw: string) {
	const value = JSON.parse(Buffer.from(raw, 'base64url').toString()) as [number, string];
	return { date: Timestamp.fromMillis(value[0]), id: value[1] };
}
function isMissingIndex(cause: unknown): boolean {
	const code = (cause as { code?: number | string })?.code;
	return code === 9 || code === '9' || code === 'FAILED_PRECONDITION';
}
export const GET: RequestHandler = async (event) => {
	const identity = await optionalFirebaseUser(event);
	const type = event.url.searchParams.get('type');
	if (!['posts', 'stories'].includes(type ?? '')) error(400);
	const db = getFirebaseAdminDb();
	const reservation = await db
		.collection('usernames')
		.doc(normalizeUsername(event.params.username!))
		.get();
	if (!reservation.exists) error(404);
	const uid = reservation.get('uid');
	const owner = identity?.uid === uid;
	let query: FirebaseFirestore.Query = db.collection(type!).where('authorId', '==', uid);
	if (!owner)
		query = query.where(
			'status',
			type === 'posts' ? '==' : 'in',
			type === 'posts' ? 'published' : ['ongoing', 'hiatus', 'completed']
		);
	query = query.orderBy('createdAt', 'desc').orderBy(FieldPath.documentId(), 'desc').limit(10);
	const cursor = event.url.searchParams.get('cursor');
	let decodedCursor: ReturnType<typeof decode> | null = null;
	if (cursor) {
		try {
			decodedCursor = decode(cursor);
			query = query.startAfter(decodedCursor.date, decodedCursor.id);
		} catch {
			error(400, 'Cursor không hợp lệ.');
		}
	}
	let documents: FirebaseFirestore.QueryDocumentSnapshot[];
	let hasMore: boolean;
	try {
		const snap = await query.get();
		documents = snap.docs;
		hasMore = snap.size === 10;
	} catch (cause) {
		if (!isMissingIndex(cause)) throw cause;
		let fallback: FirebaseFirestore.Query = db
			.collection(type!)
			.orderBy('createdAt', 'desc')
			.limit(100);
		if (decodedCursor) fallback = fallback.startAfter(decodedCursor.date);
		const snap = await fallback.get();
		const publicStoryStatuses = ['ongoing', 'hiatus', 'completed'];
		const matching = snap.docs.filter(
			(document) =>
				document.get('authorId') === uid &&
				(owner ||
					(type === 'posts'
						? document.get('status') === 'published'
						: publicStoryStatuses.includes(document.get('status'))))
		);
		documents = matching.slice(0, 10);
		hasMore = matching.length > 10 || snap.size === 100;
	}
	const last = documents.at(-1);
	return json({
		items: documents.map(type === 'posts' ? serializePost : serializeStory),
		nextCursor: hasMore && last ? encode(last.get('createdAt').toMillis(), last.id) : null
	});
};
