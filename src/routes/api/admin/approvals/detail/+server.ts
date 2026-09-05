import { requireApplicationRole } from '$lib/server/auth';
import { getFirebaseAdminDb } from '$lib/server/firebase-admin';
import { readInteractiveContent } from '$lib/server/interactive-stories';
import { error, json, type RequestHandler } from '@sveltejs/kit';

export const GET: RequestHandler = async (event) => {
	await requireApplicationRole(event, ['admin']);
	const kind = event.url.searchParams.get('kind');
	const id = event.url.searchParams.get('id');
	const storyId = event.url.searchParams.get('storyId');
	if (!id || !['post', 'short_story', 'serial_story', 'chapter'].includes(kind ?? '')) error(400);
	const db = getFirebaseAdminDb();
	const storyRef = storyId ? db.collection('stories').doc(storyId) : null;
	const targetRef =
		kind === 'post'
			? db.collection('posts').doc(id)
			: kind === 'short_story' || kind === 'serial_story'
				? db.collection('stories').doc(id)
				: storyRef?.collection('chapters').doc(id);
	if (!targetRef) error(400);
	const target = await targetRef.get();
	if (!target.exists) error(404);
	const reviews = await targetRef
		.collection('moderationReviews')
		.orderBy('createdAt', 'desc')
		.limit(20)
		.get();
	let interactive = null;
	const chapterRef =
		kind === 'short_story'
			? targetRef.collection('chapters').doc('short-story')
			: kind === 'chapter'
				? targetRef
				: null;
	if (chapterRef) {
		const chapter = await chapterRef.get();
		if (chapter.exists && chapter.get('contentFormat') === 'interactive') {
			const parentStory = kind === 'short_story' ? targetRef : storyRef!;
			interactive = await readInteractiveContent(parentStory, chapterRef);
		}
	}
	return json({
		reviews: reviews.docs.map((review) => ({
			id: review.id,
			...review.data(),
			createdAt: review.get('createdAt')?.toMillis?.() ?? 0
		})),
		interactive
	});
};
