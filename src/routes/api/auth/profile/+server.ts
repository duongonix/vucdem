import { getFirebaseAdminDb } from '$lib/server/firebase-admin';
import { requireFirebaseUser } from '$lib/server/auth';
import { profileSetupSchema } from '$lib/validation/auth';
import { error, json, type RequestHandler } from '@sveltejs/kit';
import { FieldValue } from 'firebase-admin/firestore';

function serializeProfile(id: string, data: FirebaseFirestore.DocumentData) {
	return {
		id,
		...data,
		verify: data.verify === true,
		createdAt: data.createdAt?.toMillis?.() ?? Date.now(),
		updatedAt: data.updatedAt?.toMillis?.() ?? Date.now()
	};
}

export const GET: RequestHandler = async (event) => {
	const identity = await requireFirebaseUser(event);
	const snapshot = await getFirebaseAdminDb().collection('users').doc(identity.uid).get();

	if (!snapshot.exists) return json({ profile: null });
	return json({ profile: serializeProfile(snapshot.id, snapshot.data() ?? {}) });
};

export const POST: RequestHandler = async (event) => {
	const identity = await requireFirebaseUser(event);
	const parsed = profileSetupSchema.safeParse(await event.request.json().catch(() => null));
	if (!parsed.success) error(400, parsed.error.issues[0]?.message ?? 'Dữ liệu hồ sơ không hợp lệ.');

	const db = getFirebaseAdminDb();
	const userRef = db.collection('users').doc(identity.uid);
	const usernameRef = db.collection('usernames').doc(parsed.data.username);

	await db.runTransaction(async (transaction) => {
		const [existingUser, reservation] = await Promise.all([
			transaction.get(userRef),
			transaction.get(usernameRef)
		]);

		if (existingUser.exists) return;
		if (reservation.exists && reservation.get('uid') !== identity.uid) {
			throw error(409, 'Tên người dùng đã được sử dụng.');
		}

		const timestamp = FieldValue.serverTimestamp();
		transaction.create(usernameRef, {
			uid: identity.uid,
			username: parsed.data.username,
			createdAt: timestamp
		});
		transaction.create(userRef, {
			username: parsed.data.username,
			usernameNormalized: parsed.data.username,
			displayName: parsed.data.displayName,
			avatar: null,
			bio: '',
			role: 'user',
			status: 'active',
			verify: false,
			followersCount: 0,
			followingCount: 0,
			postCount: 0,
			storyCount: 0,
			createdAt: timestamp,
			updatedAt: timestamp
		});
	});

	const snapshot = await userRef.get();
	return json({ profile: serializeProfile(snapshot.id, snapshot.data() ?? {}) }, { status: 201 });
};
