import { requireApplicationRole } from '$lib/server/auth';
import { serializeChapter } from '$lib/server/chapters';
import { getFirebaseAdminDb } from '$lib/server/firebase-admin';
import { serializePost } from '$lib/server/posts';
import { serializeStory } from '$lib/server/stories';
import { json, type RequestHandler } from '@sveltejs/kit';

function isMissingCollectionGroupIndex(cause: unknown): boolean {
	if (!cause || typeof cause !== 'object') return false;
	const value = cause as { code?: string | number; message?: string };
	return (
		value.code === 9 ||
		value.code === 'failed-precondition' ||
		value.message?.toLowerCase().includes('index') === true
	);
}

async function loadPendingChapters(db: FirebaseFirestore.Firestore) {
	try {
		return await db
			.collectionGroup('chapters')
			.where('moderationStatus', '==', 'pending')
			.limit(50)
			.get();
	} catch (cause) {
		if (!isMissingCollectionGroupIndex(cause)) throw cause;

		// A newly deployed environment can serve the moderation queue before its
		// collection-group index has finished building. Subcollection queries only
		// need Firestore's default collection index, so keep the admin queue usable
		// during that window. The bounded fallback is removed automatically as soon
		// as the configured collection-group index becomes available.
		const stories = await db.collection('stories').select().limit(250).get();
		const pending: FirebaseFirestore.QueryDocumentSnapshot[] = [];
		for (let offset = 0; offset < stories.docs.length && pending.length < 50; offset += 20) {
			const group = stories.docs.slice(offset, offset + 20);
			const snapshots = await Promise.all(
				group.map((story) =>
					story.ref
						.collection('chapters')
						.where('moderationStatus', '==', 'pending')
						.limit(50)
						.get()
				)
			);
			pending.push(...snapshots.flatMap((snapshot) => snapshot.docs));
		}
		return { docs: pending.slice(0, 50) };
	}
}

export const GET: RequestHandler = async (event) => {
	await requireApplicationRole(event, ['admin']);
	const db = getFirebaseAdminDb();
	const [postSnapshot, storySnapshot, chapterSnapshot] = await Promise.all([
		db.collection('posts').where('moderationStatus', '==', 'pending').limit(50).get(),
		db.collection('stories').where('moderationStatus', '==', 'pending').limit(50).get(),
		loadPendingChapters(db)
	]);
	const shortStories = storySnapshot.docs.filter((story) => story.get('format') === 'short');
	const pendingChapterStoryIds = new Set(
		chapterSnapshot.docs.map((chapter) => chapter.ref.parent.parent?.id).filter(Boolean)
	);
	const serialStoryMetadata = storySnapshot.docs.filter(
		(story) => story.get('format') !== 'short' && !pendingChapterStoryIds.has(story.id)
	);
	const serialChapters = chapterSnapshot.docs.filter(
		(chapter) => chapter.ref.parent.parent && chapter.id !== 'short-story'
	);
	const storyRefs = [
		...new Set(serialChapters.map((chapter) => chapter.ref.parent.parent!.path))
	].map((path) => db.doc(path));
	const serialStories = storyRefs.length ? await db.getAll(...storyRefs) : [];
	const storyById = new Map(
		serialStories.filter((story) => story.exists).map((story) => [story.id, story])
	);
	const submittedAt = (item: FirebaseFirestore.DocumentSnapshot) =>
		item.get('submittedAt')?.toMillis?.() ?? 0;
	return json({
		posts: postSnapshot.docs.sort((a, b) => submittedAt(b) - submittedAt(a)).map(serializePost),
		shortStories: shortStories
			.sort((a, b) => submittedAt(b) - submittedAt(a))
			.map((story) => ({
				story: serializeStory(story),
				chapter: chapterSnapshot.docs.find(
					(chapter) => chapter.ref.parent.parent?.id === story.id && chapter.id === 'short-story'
				)
					? serializeChapter(
							chapterSnapshot.docs.find(
								(chapter) =>
									chapter.ref.parent.parent?.id === story.id && chapter.id === 'short-story'
							)!
						)
					: null
			})),
		serialStories: serialStoryMetadata
			.sort((a, b) => submittedAt(b) - submittedAt(a))
			.map(serializeStory),
		serialChapters: serialChapters
			.sort((a, b) => submittedAt(b) - submittedAt(a))
			.map((chapter) => ({
				story: storyById.has(chapter.ref.parent.parent!.id)
					? serializeStory(storyById.get(chapter.ref.parent.parent!.id)!)
					: null,
				chapter: serializeChapter(chapter)
			}))
	});
};
