import { optionalFirebaseUser, requireFirebaseUser } from '$lib/server/auth';
import { getFirebaseAdminDb } from '$lib/server/firebase-admin';
import { error, json, type RequestHandler } from '@sveltejs/kit';
import { FieldValue } from 'firebase-admin/firestore';
import { actorSnapshot, createNotification } from '$lib/server/notifications';

export const GET: RequestHandler = async (event) => {
	const identity = await optionalFirebaseUser(event);
	if (!identity) return json({ following: false });
	const storyRef = getFirebaseAdminDb().collection('stories').doc(event.params.id!);
	const [story, relation] = await Promise.all([
		storyRef.get(),
		storyRef.collection('followers').doc(identity.uid).get()
	]);
	if (!story.exists || story.get('format') === 'short') return json({ following: false });
	return json({ following: relation.exists });
};
export const POST: RequestHandler = async (event) => {
	const identity = await requireFirebaseUser(event);
	const db = getFirebaseAdminDb();
	const storyRef = db.collection('stories').doc(event.params.id!);
	const followerRef = storyRef.collection('followers').doc(identity.uid);
	const userRef = db.collection('users').doc(identity.uid);
	await db.runTransaction(async (t) => {
		const [story, existing, actor] = await Promise.all([
			t.get(storyRef),
			t.get(followerRef),
			t.get(userRef)
		]);
		if (!story.exists || !['ongoing', 'hiatus', 'completed'].includes(story.get('status')))
			error(404);
		if (story.get('format') === 'short') error(409, 'Chỉ truyện dài mới có thể được theo dõi.');
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
			if (actor.exists) {
				createNotification(t, db, {
					id: `story_follow_${storyRef.id}_${identity.uid}`,
					userId: String(story.get('authorId')),
					actorId: identity.uid,
					...actorSnapshot(actor),
					type: 'follow',
					targetType: 'story',
					targetId: String(story.get('slug') ?? storyRef.id)
				});
			}
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
