import { getFirebaseAdminDb } from '$lib/server/firebase-admin';
import { json, type RequestHandler } from '@sveltejs/kit';
import { normalizeUsername } from '$lib/validation/auth';
import { serializePost } from '$lib/server/posts';
import { serializeStory } from '$lib/server/stories';

const CANDIDATE_LIMIT = 150;
const RESULT_LIMIT = 12;

function searchable(...values: unknown[]): string {
	return normalizeUsername(
		values
			.flatMap((value) => (Array.isArray(value) ? value : [value]))
			.filter((value): value is string => typeof value === 'string')
			.join(' ')
	);
}

export const GET: RequestHandler = async (event) => {
	const raw = (event.url.searchParams.get('q') ?? '').trim();
	if (raw.length < 2) return json({ users: [], posts: [], stories: [] });
	const q = normalizeUsername(raw).slice(0, 40);
	const db = getFirebaseAdminDb();
	const [users, posts, stories] = await Promise.all([
		db.collection('users').where('status', '==', 'active').limit(CANDIDATE_LIMIT).get(),
		db.collection('posts').where('status', '==', 'published').limit(CANDIDATE_LIMIT).get(),
		db
			.collection('stories')
			.where('status', 'in', ['ongoing', 'hiatus', 'completed'])
			.limit(CANDIDATE_LIMIT)
			.get()
	]);
	return json({
		users: users.docs
			.filter((document) =>
				searchable(
					document.get('username'),
					document.get('usernameNormalized'),
					document.get('displayName'),
					document.get('bio')
				).includes(q)
			)
			.slice(0, RESULT_LIMIT)
			.map((document) => ({
				id: document.id,
				username: document.get('username'),
				displayName: document.get('displayName'),
				verify: document.get('verify') === true,
				avatar: document.get('avatar') ?? null
			})),
		posts: posts.docs
			.filter((document) =>
				searchable(
					document.get('title'),
					document.get('excerpt'),
					document.get('content'),
					document.get('tags'),
					document.get('authorName'),
					document.get('authorUsername')
				).includes(q)
			)
			.slice(0, RESULT_LIMIT)
			.map(serializePost),
		stories: stories.docs
			.filter((document) =>
				searchable(
					document.get('title'),
					document.get('description'),
					document.get('tags'),
					document.get('authorName'),
					document.get('authorUsername')
				).includes(q)
			)
			.slice(0, RESULT_LIMIT)
			.map(serializeStory)
	});
};
