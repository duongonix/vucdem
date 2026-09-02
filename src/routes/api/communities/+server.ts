import { optionalFirebaseUser, requireFirebaseUser } from '$lib/server/auth';
import { getFirebaseAdminDb } from '$lib/server/firebase-admin';
import { serializeCommunity } from '$lib/server/communities';
import { createCommunitySchema, communitySlug } from '$lib/validation/community';
import { assertCloudinaryAssetMetadata } from '$lib/server/media-authorization';
import { error, json, type RequestHandler } from '@sveltejs/kit';
import { FieldValue } from 'firebase-admin/firestore';
export const GET: RequestHandler = async (event) => {
	await optionalFirebaseUser(event);
	const snap = await getFirebaseAdminDb()
		.collection('communities')
		.where('status', '==', 'active')
		.orderBy('name')
		.limit(100)
		.get();
	return json({ communities: snap.docs.map(serializeCommunity) });
};
export const POST: RequestHandler = async (event) => {
	const identity = await requireFirebaseUser(event);
	const parsed = createCommunitySchema.safeParse(await event.request.json().catch(() => null));
	if (!parsed.success) error(400, parsed.error.issues[0]?.message);
	const db = getFirebaseAdminDb();
	const ref = db.collection('communities').doc(parsed.data.id);
	if (parsed.data.icon)
		assertCloudinaryAssetMetadata(parsed.data.icon, `vucdem/communities/${ref.id}/icon`);
	if (parsed.data.banner)
		assertCloudinaryAssetMetadata(parsed.data.banner, `vucdem/communities/${ref.id}/banner`);
	const slug = communitySlug(parsed.data.name);
	const slugRef = db.collection('communitySlugs').doc(slug);
	await db.runTransaction(async (t) => {
		const [user, existing] = await Promise.all([
			t.get(db.collection('users').doc(identity.uid)),
			t.get(slugRef)
		]);
		if (!user.exists || user.get('status') !== 'active') error(403);
		if (existing.exists) error(409, 'Tên đường dẫn cộng đồng đã tồn tại.');
		const now = FieldValue.serverTimestamp();
		t.create(slugRef, { communityId: ref.id, createdAt: now });
		t.create(ref, {
			ownerId: identity.uid,
			slug,
			name: parsed.data.name,
			nameNormalized: parsed.data.name.toLocaleLowerCase('vi-VN'),
			description: parsed.data.description,
			icon: parsed.data.icon,
			banner: parsed.data.banner,
			memberCount: 1,
			postCount: 0,
			status: 'active',
			createdAt: now,
			updatedAt: now
		});
		t.create(ref.collection('members').doc(identity.uid), {
			userId: identity.uid,
			role: 'owner',
			createdAt: now
		});
	});
	return json({ community: serializeCommunity(await ref.get()) }, { status: 201 });
};
