import { optionalFirebaseUser } from '$lib/server/auth';
import { getFirebaseAdminDb } from '$lib/server/firebase-admin';
import { error, json, type RequestHandler } from '@sveltejs/kit';

export const GET: RequestHandler = async (event) => {
	const identity = await optionalFirebaseUser(event);
	const db = getFirebaseAdminDb();
	const storyRef = db.collection('stories').doc(event.params.id!);
	const story = await storyRef.get();
	const owner = story.exists && identity?.uid === story.get('authorId');
	if (
		!story.exists ||
		(!owner && !['ongoing', 'hiatus', 'completed'].includes(String(story.get('status'))))
	)
		error(404);
	const snapshot = await storyRef.collection('characters').get();
	return json({ characters: snapshot.docs.map((item) => ({ id: item.id, ...item.data() })) });
};
