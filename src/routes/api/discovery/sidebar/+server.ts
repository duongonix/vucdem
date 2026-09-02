import { getFirebaseAdminDb } from '$lib/server/firebase-admin';
import { rankTrendingTags } from '$lib/server/trending-tags';
import { json, type RequestHandler } from '@sveltejs/kit';

const LIMIT = 5;
const TAG_SOURCE_LIMIT = 200;

async function getTopics(db: FirebaseFirestore.Firestore) {
	try {
		const [postTags, storyTags] = await Promise.all([
			db
				.collection('posts')
				.where('status', '==', 'published')
				.orderBy('createdAt', 'desc')
				.select('tags')
				.limit(TAG_SOURCE_LIMIT)
				.get(),
			db
				.collection('stories')
				.where('status', 'in', ['ongoing', 'completed', 'hiatus'])
				.orderBy('createdAt', 'desc')
				.select('tags')
				.limit(TAG_SOURCE_LIMIT)
				.get()
		]);
		return rankTrendingTags(
			[...postTags.docs, ...storyTags.docs].map((document) => document.get('tags')),
			LIMIT
		);
	} catch {
		// This fallback only uses Firestore's automatic single-field indexes. It keeps the
		// sidebar available while a newly declared composite index is still being deployed.
		const [postTags, storyTags] = await Promise.all([
			db
				.collection('posts')
				.where('status', '==', 'published')
				.select('tags')
				.limit(TAG_SOURCE_LIMIT)
				.get(),
			db
				.collection('stories')
				.where('status', 'in', ['ongoing', 'completed', 'hiatus'])
				.select('tags')
				.limit(TAG_SOURCE_LIMIT)
				.get()
		]);
		return rankTrendingTags(
			[...postTags.docs, ...storyTags.docs].map((document) => document.get('tags')),
			LIMIT
		);
	}
}

async function getAuthors(db: FirebaseFirestore.Firestore) {
	try {
		return (
			await db
				.collection('users')
				.where('status', '==', 'active')
				.orderBy('followersCount', 'desc')
				.limit(LIMIT)
				.get()
		).docs;
	} catch {
		return (await db.collection('users').where('status', '==', 'active').limit(100).get()).docs
			.sort(
				(left, right) =>
					Number(right.get('followersCount') ?? 0) - Number(left.get('followersCount') ?? 0)
			)
			.slice(0, LIMIT);
	}
}

export const GET: RequestHandler = async () => {
	const db = getFirebaseAdminDb();
	const [topicResult, authorResult] = await Promise.allSettled([getTopics(db), getAuthors(db)]);
	const topics = topicResult.status === 'fulfilled' ? topicResult.value : [];
	const authorDocuments = authorResult.status === 'fulfilled' ? authorResult.value : [];

	return json({
		topics,
		topicsFailed: topicResult.status === 'rejected',
		authorsFailed: authorResult.status === 'rejected',
		authors: authorDocuments.map((document) => ({
			id: document.id,
			username: String(document.get('username') ?? ''),
			displayName: String(document.get('displayName') ?? document.get('username') ?? 'Thành viên'),
			avatarUrl: (document.get('avatar') as { url?: string } | null)?.url ?? null,
			verify: document.get('verify') === true,
			followersCount: Math.max(0, Number(document.get('followersCount') ?? 0))
		}))
	});
};
