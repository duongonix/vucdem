import { optionalFirebaseUser, requireFirebaseUser } from '$lib/server/auth';
import { getFirebaseAdminDb } from '$lib/server/firebase-admin';
import { error, json, type RequestHandler } from '@sveltejs/kit';
import { FieldValue } from 'firebase-admin/firestore';
async function refs(slug: string) {
	const db = getFirebaseAdminDb();
	const reservation = await db.collection('communitySlugs').doc(slug).get();
	if (!reservation.exists) error(404);
	const communityRef = db.collection('communities').doc(reservation.get('communityId'));
	return { db, communityRef };
}
export const GET: RequestHandler = async (event) => {
	const identity = await optionalFirebaseUser(event);
	if (!identity) return json({ joined: false });
	const { communityRef } = await refs(event.params.slug!);
	return json({
		joined: (await communityRef.collection('members').doc(identity.uid).get()).exists
	});
};
export const POST: RequestHandler = async (event) => {
	const identity = await requireFirebaseUser(event);
	const { db, communityRef } = await refs(event.params.slug!);
	const member = communityRef.collection('members').doc(identity.uid);
	await db.runTransaction(async (t) => {
		const [community, existing] = await Promise.all([t.get(communityRef), t.get(member)]);
		if (!community.exists || community.get('status') !== 'active') error(404);
		if (!existing.exists) {
			t.create(member, {
				userId: identity.uid,
				role: 'member',
				createdAt: FieldValue.serverTimestamp()
			});
			t.update(communityRef, { memberCount: FieldValue.increment(1) });
		}
	});
	return json({ joined: true });
};
export const DELETE: RequestHandler = async (event) => {
	const identity = await requireFirebaseUser(event);
	const { db, communityRef } = await refs(event.params.slug!);
	const member = communityRef.collection('members').doc(identity.uid);
	await db.runTransaction(async (t) => {
		const [existing, community] = await Promise.all([t.get(member), t.get(communityRef)]);
		if (existing.exists) {
			if (existing.get('role') === 'owner') error(409, 'Chủ sở hữu không thể rời cộng đồng.');
			t.delete(member);
			t.update(communityRef, {
				memberCount: Math.max(0, Number(community.get('memberCount') ?? 0) - 1)
			});
		}
	});
	return json({ joined: false });
};
