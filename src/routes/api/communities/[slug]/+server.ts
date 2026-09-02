import { optionalFirebaseUser } from '$lib/server/auth';
import { getFirebaseAdminDb } from '$lib/server/firebase-admin';
import { serializeCommunity } from '$lib/server/communities';
import { error, json, type RequestHandler } from '@sveltejs/kit';
export const GET: RequestHandler = async (event) => {
	await optionalFirebaseUser(event);
	const db = getFirebaseAdminDb();
	const reserved = await db.collection('communitySlugs').doc(event.params.slug!).get();
	if (!reserved.exists) error(404, 'Không tìm thấy cộng đồng.');
	const community = await db.collection('communities').doc(reserved.get('communityId')).get();
	if (!community.exists || community.get('status') !== 'active') error(404);
	return json({ community: serializeCommunity(community) });
};
