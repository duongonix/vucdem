import { optionalFirebaseUser, requireFirebaseUser } from '$lib/server/auth';
import { getFirebaseAdminDb } from '$lib/server/firebase-admin';
import { error, json, type RequestHandler } from '@sveltejs/kit';
import { FieldValue } from 'firebase-admin/firestore';
import { z } from 'zod';
import { actorSnapshot, createNotification } from '$lib/server/notifications';

function id(value?: string): string {
	if (!value || value.includes('/')) error(400, 'ID bài viết không hợp lệ.');
	return value;
}

export const GET: RequestHandler = async (event) => {
	const identity = await optionalFirebaseUser(event);
	const postRef = getFirebaseAdminDb().collection('posts').doc(id(event.params.id));
	const post = await postRef.get();
	if (!post.exists || post.get('status') !== 'published') error(404, 'Không tìm thấy bài viết.');
	const vote = identity ? await postRef.collection('votes').doc(identity.uid).get() : null;
	return json({
		value: vote?.exists && vote.get('value') === 1 ? 1 : 0,
		score: Math.max(0, Number(post.get('voteScore') ?? 0))
	});
};

export const POST: RequestHandler = async (event) => {
	const identity = await requireFirebaseUser(event);
	const parsed = z
		.object({ value: z.union([z.literal(0), z.literal(1)]) })
		.safeParse(await event.request.json().catch(() => null));
	if (!parsed.success) error(400, 'Giá trị bình chọn không hợp lệ.');
	const postRef = getFirebaseAdminDb().collection('posts').doc(id(event.params.id));
	const voteRef = postRef.collection('votes').doc(identity.uid);
	let score = 0;
	await getFirebaseAdminDb().runTransaction(async (transaction) => {
		const [post, vote, actor] = await Promise.all([
			transaction.get(postRef),
			transaction.get(voteRef),
			transaction.get(getFirebaseAdminDb().collection('users').doc(identity.uid))
		]);
		if (!post.exists || post.get('status') !== 'published') error(404, 'Không tìm thấy bài viết.');
		const previous = vote.exists ? Number(vote.get('value')) : 0;
		const next = parsed.data.value;
		score = Math.max(0, Number(post.get('voteScore') ?? 0) + next - previous);
		if (next === 0) {
			if (vote.exists) transaction.delete(voteRef);
		} else if (vote.exists)
			transaction.update(voteRef, { value: next, updatedAt: FieldValue.serverTimestamp() });
		else
			transaction.create(voteRef, {
				value: next,
				createdAt: FieldValue.serverTimestamp(),
				updatedAt: FieldValue.serverTimestamp()
			});
		if (next !== previous) transaction.update(postRef, { voteScore: score });
		if (next === 1 && previous !== 1 && actor.exists)
			createNotification(transaction, getFirebaseAdminDb(), {
				id: `upvote_post_${postRef.id}_${identity.uid}`,
				userId: post.get('authorId'),
				actorId: identity.uid,
				...actorSnapshot(actor),
				type: 'upvote',
				targetType: 'post',
				targetId: postRef.id
			});
		if (next !== 1 && previous === 1)
			transaction.delete(
				getFirebaseAdminDb()
					.collection('notifications')
					.doc(`upvote_post_${postRef.id}_${identity.uid}`)
			);
	});
	return json({ value: parsed.data.value, score });
};
