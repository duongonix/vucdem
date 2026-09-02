import { optionalFirebaseUser, requireFirebaseUser } from '$lib/server/auth';
import { getFirebaseAdminDb } from '$lib/server/firebase-admin';
import { error, json, type RequestHandler } from '@sveltejs/kit';
import { FieldValue } from 'firebase-admin/firestore';

export const GET: RequestHandler = async (event) => {
	const identity = await optionalFirebaseUser(event);
	if (!identity) return json({ following: false });
	const ref = getFirebaseAdminDb()
		.collection('stories')
		.doc(event.params.id!)
		.collection('followers')
		.doc(identity.uid);
	return json({ following: (await ref.get()).exists });
};
export const POST: RequestHandler = async (event) => {
	const identity = await requireFirebaseUser(event);
	const db = getFirebaseAdminDb();
	const storyRef = db.collection('stories').doc(event.params.id!);
	const followerRef = storyRef.collection('followers').doc(identity.uid);
	const userRef = db.collection('users').doc(identity.uid);
	await db.runTransaction(async (t) => {
		const [story, existing] = await Promise.all([t.get(storyRef), t.get(followerRef)]);
		if (!story.exists || !['ongoing', 'hiatus', 'completed'].includes(story.get('status')))
			error(404);
		if (!existing.exists) {
			t.create(followerRef, {
				userId: identity.uid,
				storyId: storyRef.id,
				createdAt: FieldValue.serverTimestamp()
			});
			t.set(userRef.collection('followedStories').doc(storyRef.id), {
				storyId: storyRef.id,
				createdAt: FieldValue.serverTimestamp()
			});
			t.update(storyRef, { followerCount: FieldValue.increment(1) });
		}
	});
	return json({ following: true });
};
export const DELETE: RequestHandler = async (event) => {
	const identity = await requireFirebaseUser(event);
	const db = getFirebaseAdminDb();
	const storyRef = db.collection('stories').doc(event.params.id!);
	const followerRef = storyRef.collection('followers').doc(identity.uid);
	await db.runTransaction(async (t) => {
		const [existing, story] = await Promise.all([t.get(followerRef), t.get(storyRef)]);
		if (existing.exists) {
			t.delete(followerRef);
			t.delete(
				db.collection('users').doc(identity.uid).collection('followedStories').doc(storyRef.id)
			);
			t.update(storyRef, {
				followerCount: Math.max(0, Number(story.get('followerCount') ?? 0) - 1)
			});
		}
	});
	return json({ following: false });
};
