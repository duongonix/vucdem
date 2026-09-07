import { getFirebaseAdminDb } from '$lib/server/firebase-admin';
import { json, type RequestHandler } from '@sveltejs/kit';
import { normalizeUsername } from '$lib/validation/auth';
import { serializePost } from '$lib/server/posts';
import { serializeStory } from '$lib/server/stories';

const CANDIDATE_LIMIT = 150;
const RESULT_LIMIT = 12;
const CONTENT_TYPES = ['all', 'posts', 'stories'] as const;
const STORY_STATUSES = ['all', 'ongoing', 'completed', 'hiatus'] as const;
const STORY_FORMATS = ['all', 'serial', 'short'] as const;
const SORTS = ['relevance', 'newest', 'viewed', 'rating'] as const;

function searchable(...values: unknown[]): string {
	return normalizeUsername(
		values
			.flatMap((value) => (Array.isArray(value) ? value : [value]))
			.filter((value): value is string => typeof value === 'string')
			.join(' ')
	);
}

function enumParam<T extends readonly string[]>(
	url: URL,
	name: string,
	allowed: T,
	fallback: T[number]
): T[number] {
	const value = url.searchParams.get(name) ?? fallback;
	return (allowed as readonly string[]).includes(value) ? (value as T[number]) : fallback;
}

function timestampValue(value: unknown): number {
	return typeof (value as { toMillis?: unknown })?.toMillis === 'function'
		? (value as { toMillis(): number }).toMillis()
		: 0;
}

function sortContent(
	documents: FirebaseFirestore.QueryDocumentSnapshot[],
	sort: (typeof SORTS)[number],
	isStory: boolean
) {
	if (sort === 'relevance') return documents;
	return [...documents].sort((left, right) => {
		const score = (document: FirebaseFirestore.QueryDocumentSnapshot) => {
			if (sort === 'newest') return timestampValue(document.get('createdAt'));
			if (sort === 'viewed') return Number(document.get('viewCount') ?? 0);
			return isStory ? Number(document.get('ratingAverage') ?? 0) : 0;
		};
		return score(right) - score(left) || left.id.localeCompare(right.id);
	});
}

export const GET: RequestHandler = async (event) => {
	const raw = (event.url.searchParams.get('q') ?? '').trim();
	if (raw.length < 2) return json({ users: [], posts: [], stories: [] });
	const q = normalizeUsername(raw).slice(0, 40);
	const contentType = enumParam(event.url, 'type', CONTENT_TYPES, 'all');
	const storyStatus = enumParam(event.url, 'storyStatus', STORY_STATUSES, 'all');
	const storyFormat = enumParam(event.url, 'storyFormat', STORY_FORMATS, 'all');
	const sort = enumParam(event.url, 'sort', SORTS, 'relevance');
	const category = (event.url.searchParams.get('category') ?? '').trim().slice(0, 80);
	const tag = normalizeUsername(
		(event.url.searchParams.get('tag') ?? '').trim().replace(/^#/, '')
	).slice(0, 50);
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
	const matchedPosts = posts.docs.filter(
		(document) =>
			(contentType === 'all' || contentType === 'posts') &&
			(!category || document.get('category') === category) &&
			(!tag ||
				(document.get('tags') as unknown[] | undefined)?.some(
					(value) => searchable(value) === tag
				)) &&
			searchable(
				document.get('title'),
				document.get('excerpt'),
				document.get('content'),
				document.get('tags'),
				document.get('authorName'),
				document.get('authorUsername')
			).includes(q)
	);
	const matchedStories = stories.docs.filter(
		(document) =>
			(contentType === 'all' || contentType === 'stories') &&
			(storyStatus === 'all' || document.get('status') === storyStatus) &&
			(storyFormat === 'all' || document.get('format') === storyFormat) &&
			(!tag ||
				(document.get('tags') as unknown[] | undefined)?.some(
					(value) => searchable(value) === tag
				)) &&
			searchable(
				document.get('title'),
				document.get('description'),
				document.get('tags'),
				document.get('authorName'),
				document.get('authorUsername')
			).includes(q)
	);

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
		posts: sortContent(matchedPosts, sort, false).slice(0, RESULT_LIMIT).map(serializePost),
		stories: sortContent(matchedStories, sort, true).slice(0, RESULT_LIMIT).map(serializeStory)
	});
};
