import { optionalFirebaseUser } from '$lib/server/auth';
import { getFirebaseAdminDb } from '$lib/server/firebase-admin';
import { readInteractiveContent } from '$lib/server/interactive-stories';
import { error, json, type RequestHandler } from '@sveltejs/kit';

export const GET: RequestHandler = async (event) => {
	const identity = await optionalFirebaseUser(event);
	const db = getFirebaseAdminDb();
	const storyRef = db.collection('stories').doc(event.params.id!);
	const chapterRef = storyRef.collection('chapters').doc(event.params.chapterId!);
	const [story, chapter] = await Promise.all([storyRef.get(), chapterRef.get()]);
	const owner = story.exists && identity?.uid === story.get('authorId');
	if (!story.exists || !chapter.exists) error(404, 'Không tìm thấy kịch bản nhập vai.');
	if (
		!owner &&
		(!['ongoing', 'hiatus', 'completed'].includes(String(story.get('status'))) ||
			chapter.get('status') !== 'published')
	)
		error(404);
	return json({ interactive: await readInteractiveContent(storyRef, chapterRef) });
};
