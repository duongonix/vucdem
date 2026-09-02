import { optionalFirebaseUser } from '$lib/server/auth';
import { getFirebaseAdminDb } from '$lib/server/firebase-admin';
import { serializeStory } from '$lib/server/stories';
import { error, json, type RequestHandler } from '@sveltejs/kit';
export const GET: RequestHandler = async (event) => {
	const identity = await optionalFirebaseUser(event);
	const slug = event.params.slug;
	if (!slug || slug.includes('/')) error(400, 'Đường dẫn truyện không hợp lệ.');
	const db = getFirebaseAdminDb();
	const reservation = await db.collection('storySlugs').doc(slug).get();
	const storyId = reservation.get('storyId');
	if (!reservation.exists || typeof storyId !== 'string') error(404, 'Không tìm thấy truyện.');
	const story = await db.collection('stories').doc(storyId).get();
	if (
		!story.exists ||
		(!['ongoing', 'completed', 'hiatus'].includes(story.get('status')) &&
			story.get('authorId') !== identity?.uid)
	)
		error(404, 'Không tìm thấy truyện.');
	return json({ story: serializeStory(story) });
};
