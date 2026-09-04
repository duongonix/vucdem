import { getFirebaseAdminDb } from '$lib/server/firebase-admin';
import { serializePost } from '$lib/server/posts';
import { serializeStory } from '$lib/server/stories';
import { json, type RequestHandler } from '@sveltejs/kit';

export const GET: RequestHandler = async () => {
	const db = getFirebaseAdminDb();
	const [postSnapshot, storySnapshot] = await Promise.all([
		db.collection('posts').where('isPinned', '==', true).limit(50).get(),
		db.collection('stories').where('isPinned', '==', true).limit(50).get()
	]);
	const pinnedTime = (document: FirebaseFirestore.QueryDocumentSnapshot) =>
		document.get('pinnedAt')?.toMillis?.() ?? 0;
	const posts = postSnapshot.docs
		.filter((document) => document.get('status') === 'published')
		.sort((a, b) => pinnedTime(b) - pinnedTime(a));
	const publicStoryStatuses = new Set(['ongoing', 'completed', 'hiatus']);
	const stories = storySnapshot.docs
		.filter((document) => publicStoryStatuses.has(String(document.get('status'))))
		.sort((a, b) => pinnedTime(b) - pinnedTime(a));
	return json({ posts: posts.map(serializePost), stories: stories.map(serializeStory) });
};
