import { requireFirebaseUser } from '$lib/server/auth';
import { getFirebaseAdminDb } from '$lib/server/firebase-admin';
import { normalizeUsername, profileUpdateSchema } from '$lib/validation/auth';
import { error, json, type RequestHandler } from '@sveltejs/kit';
import { FieldValue } from 'firebase-admin/firestore';
import { assertCloudinaryAssetMetadata } from '$lib/server/media-authorization';

async function resolveUser(username: string) {
	const normalized = normalizeUsername(username);
	const reservation = await getFirebaseAdminDb().collection('usernames').doc(normalized).get();
	if (!reservation.exists) return null;
	const uid = reservation.get('uid');
	if (typeof uid !== 'string') return null;
	const user = await getFirebaseAdminDb().collection('users').doc(uid).get();
	return user.exists ? user : null;
}

function requiredUsername(value: string | undefined): string {
	if (!value) error(400, 'Tên người dùng không hợp lệ.');
	return value;
}

function publicProfile(snapshot: FirebaseFirestore.DocumentSnapshot) {
	const data = snapshot.data();
	if (!data) error(404, 'Không tìm thấy người dùng.');
	return {
		id: snapshot.id,
		username: data.username,
		usernameNormalized: data.usernameNormalized,
		displayName: data.displayName,
		avatar: data.avatar ?? null,
		bio: data.bio ?? '',
		role: data.role,
		verify: data.verify === true,
		followersCount: data.followersCount ?? 0,
		followingCount: data.followingCount ?? 0,
		postCount: data.postCount ?? 0,
		storyCount: data.storyCount ?? 0
	};
}

export const GET: RequestHandler = async ({ params }) => {
	const snapshot = await resolveUser(requiredUsername(params.username));
	if (!snapshot) error(404, 'Không tìm thấy người dùng.');
	return json({ profile: publicProfile(snapshot) });
};

export const PATCH: RequestHandler = async (event) => {
	const identity = await requireFirebaseUser(event);
	const snapshot = await resolveUser(requiredUsername(event.params.username));
	if (!snapshot) error(404, 'Không tìm thấy người dùng.');
	if (snapshot.id !== identity.uid) error(403, 'Bạn không thể sửa hồ sơ này.');

	const parsed = profileUpdateSchema.safeParse(await event.request.json().catch(() => null));
	if (!parsed.success) error(400, parsed.error.issues[0]?.message ?? 'Hồ sơ không hợp lệ.');
	if (
		parsed.data.avatar &&
		parsed.data.avatar.publicId !== `vucdem/avatars/${identity.uid}/avatar`
	) {
		error(400, 'Ảnh đại diện không thuộc tài khoản này.');
	}
	if (parsed.data.avatar)
		assertCloudinaryAssetMetadata(parsed.data.avatar, `vucdem/avatars/${identity.uid}/avatar`);

	await snapshot.ref.update({
		displayName: parsed.data.displayName,
		bio: parsed.data.bio,
		avatar: parsed.data.avatar,
		updatedAt: FieldValue.serverTimestamp()
	});
	const updated = await snapshot.ref.get();
	return json({ profile: publicProfile(updated) });
};
