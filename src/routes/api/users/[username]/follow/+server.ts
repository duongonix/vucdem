import { requireFirebaseUser } from '$lib/server/auth';
import { getFirebaseAdminDb } from '$lib/server/firebase-admin';
import { normalizeUsername } from '$lib/validation/auth';
import { error, json, type RequestHandler } from '@sveltejs/kit';
import { FieldValue } from 'firebase-admin/firestore';
import { actorSnapshot, createNotification } from '$lib/server/notifications';
async function targetUser(username?: string) {
	if (!username) error(400, 'Tên người dùng không hợp lệ.');
	const reservation = await getFirebaseAdminDb()
		.collection('usernames')
		.doc(normalizeUsername(username))
		.get();
	const uid = reservation.get('uid');
	if (!reservation.exists || typeof uid !== 'string') error(404, 'Không tìm thấy người dùng.');
	const user = await getFirebaseAdminDb().collection('users').doc(uid).get();
	if (!user.exists) error(404, 'Không tìm thấy người dùng.');
	return user;
}
export const GET: RequestHandler = async (event) => {
	const actor = await requireFirebaseUser(event);
	const target = await targetUser(event.params.username);
	const relation = await getFirebaseAdminDb()
		.collection('users')
		.doc(actor.uid)
		.collection('following')
		.doc(target.id)
		.get();
	return json({
		following: relation.exists,
		notificationsEnabled: relation.get('notificationsEnabled') === true,
		followersCount: Number(target.get('followersCount') ?? 0)
	});
};
async function mutate(event: Parameters<RequestHandler>[0], following: boolean) {
	const actor = await requireFirebaseUser(event);
	const target = await targetUser(event.params.username);
	if (actor.uid === target.id) error(400, 'Bạn không thể tự theo dõi chính mình.');
	const db = getFirebaseAdminDb();
	const actorRef = db.collection('users').doc(actor.uid);
	const targetRef = target.ref;
	const followingRef = actorRef.collection('following').doc(target.id);
	const followerRef = targetRef.collection('followers').doc(actor.uid);
	let followersCount = Number(target.get('followersCount') ?? 0);
	await db.runTransaction(async (transaction) => {
		const [actorUser, targetUser, relation] = await Promise.all([
			transaction.get(actorRef),
			transaction.get(targetRef),
			transaction.get(followingRef)
		]);
		if (!actorUser.exists || actorUser.get('status') !== 'active')
			error(403, 'Tài khoản không thể theo dõi người dùng.');
		if (!targetUser.exists || targetUser.get('status') !== 'active')
			error(404, 'Không tìm thấy người dùng.');
		const exists = relation.exists;
		followersCount = Number(targetUser.get('followersCount') ?? 0);
		const followingCount = Number(actorUser.get('followingCount') ?? 0);
		const now = FieldValue.serverTimestamp();
		if (following && !exists) {
			transaction.set(followingRef, { createdAt: now, notificationsEnabled: false });
			transaction.set(followerRef, { createdAt: now, notificationsEnabled: false });
			transaction.update(actorRef, { followingCount: followingCount + 1, updatedAt: now });
			transaction.update(targetRef, { followersCount: followersCount + 1, updatedAt: now });
			createNotification(transaction, db, {
				id: `follow_${actor.uid}_${target.id}`,
				userId: target.id,
				actorId: actor.uid,
				...actorSnapshot(actorUser),
				type: 'follow',
				targetType: 'user',
				targetId: String(actorUser.get('username') ?? actor.uid)
			});
			followersCount += 1;
		} else if (!following && exists) {
			transaction.delete(followingRef);
			transaction.delete(followerRef);
			transaction.update(actorRef, {
				followingCount: Math.max(0, followingCount - 1),
				updatedAt: now
			});
			transaction.update(targetRef, {
				followersCount: Math.max(0, followersCount - 1),
				updatedAt: now
			});
			followersCount = Math.max(0, followersCount - 1);
		}
	});
	return json({ following, notificationsEnabled: false, followersCount });
}
export const POST: RequestHandler = (event) => mutate(event, true);
export const DELETE: RequestHandler = (event) => mutate(event, false);

export const PATCH: RequestHandler = async (event) => {
	const actor = await requireFirebaseUser(event);
	const target = await targetUser(event.params.username);
	if (actor.uid === target.id) error(400, 'Bạn không thể thay đổi thông báo của chính mình.');
	if (target.get('status') !== 'active') error(404, 'Không tìm thấy người dùng.');
	const body = (await event.request.json().catch(() => null)) as {
		notificationsEnabled?: unknown;
	} | null;
	if (typeof body?.notificationsEnabled !== 'boolean')
		error(400, 'Trạng thái thông báo không hợp lệ.');
	const db = getFirebaseAdminDb();
	const followingRef = db.collection('users').doc(actor.uid).collection('following').doc(target.id);
	const followerRef = target.ref.collection('followers').doc(actor.uid);
	await db.runTransaction(async (transaction) => {
		const relation = await transaction.get(followingRef);
		if (!relation.exists) error(409, 'Bạn cần theo dõi người này trước khi bật thông báo.');
		const now = FieldValue.serverTimestamp();
		transaction.update(followingRef, {
			notificationsEnabled: body.notificationsEnabled,
			updatedAt: now
		});
		transaction.update(followerRef, {
			notificationsEnabled: body.notificationsEnabled,
			updatedAt: now
		});
	});
	return json({
		following: true,
		notificationsEnabled: body.notificationsEnabled,
		followersCount: Number(target.get('followersCount') ?? 0)
	});
};
