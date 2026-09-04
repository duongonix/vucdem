import { getFirebaseAdminDb } from '$lib/server/firebase-admin';
import { serializeStory } from '$lib/server/stories';
import { json, type RequestHandler } from '@sveltejs/kit';

const publicStatuses = ['ongoing', 'hiatus', 'completed'];
const TOP_LIMIT = 10;

function rank(documents: FirebaseFirestore.QueryDocumentSnapshot[], format: 'short' | 'serial') {
	return documents
		.filter((document) =>
			format === 'short' ? document.get('format') === 'short' : document.get('format') !== 'short'
		)
		.sort((left, right) => {
			const views = Number(right.get('viewCount') ?? 0) - Number(left.get('viewCount') ?? 0);
			return views || left.id.localeCompare(right.id);
		})
		.slice(0, TOP_LIMIT)
		.map(serializeStory);
}

export const GET: RequestHandler = async () => {
	const db = getFirebaseAdminDb();
	let documents: FirebaseFirestore.QueryDocumentSnapshot[];
	try {
		const snapshot = await db
			.collection('stories')
			.where('status', 'in', publicStatuses)
			.orderBy('viewCount', 'desc')
			.orderBy('__name__', 'desc')
			.limit(250)
			.get();
		documents = snapshot.docs;
	} catch {
		const snapshots = await Promise.all(
			publicStatuses.map((status) =>
				db.collection('stories').where('status', '==', status).limit(100).get()
			)
		);
		documents = snapshots.flatMap((snapshot) => snapshot.docs);
	}
	return json({
		short: rank(documents, 'short'),
		serial: rank(documents, 'serial')
	});
};
