import { getFirebaseAdminDb } from '$lib/server/firebase-admin';
import { suggestUsedTags } from '$lib/server/trending-tags';
import { error, json, type RequestHandler } from '@sveltejs/kit';

const SOURCE_LIMIT = 200;
const RESULT_LIMIT = 8;

export const GET: RequestHandler = async ({ url }) => {
	const query = (url.searchParams.get('q') ?? '').trim();
	if (!query || query.length > 24) error(400, 'Từ khóa tag không hợp lệ.');
	const db = getFirebaseAdminDb();
	const [posts, stories] = await Promise.all([
		db
			.collection('posts')
			.where('status', '==', 'published')
			.select('tags')
			.limit(SOURCE_LIMIT)
			.get(),
		db
			.collection('stories')
			.where('status', 'in', ['ongoing', 'completed', 'hiatus'])
			.select('tags')
			.limit(SOURCE_LIMIT)
			.get()
	]);
	return json({
		tags: suggestUsedTags(
			[...posts.docs, ...stories.docs].map((document) => document.get('tags')),
			query,
			RESULT_LIMIT
		)
	});
};
