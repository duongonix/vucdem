import { optionalFirebaseUser, requireFirebaseUser } from '$lib/server/auth';
import { getFirebaseAdminDb } from '$lib/server/firebase-admin';
import { error, json, type RequestHandler } from '@sveltejs/kit';
import { FieldValue } from 'firebase-admin/firestore';
import { z } from 'zod';

function commentId(value?: string): string {
	if (!value || value.includes('/')) error(400, 'ID bình luận không hợp lệ.');
	return value;
}

export const GET: RequestHandler = async (event) => {
	const identity = await optionalFirebaseUser(event);
	const reference = getFirebaseAdminDb().collection('comments').doc(commentId(event.params.id));
	const comment = await reference.get();
	if (!comment.exists || comment.get('status') !== 'published')
		error(404, 'Không tìm thấy bình luận.');
	const vote = identity ? await reference.collection('votes').doc(identity.uid).get() : null;
	return json({
		value: vote?.exists ? vote.get('value') : 0,
		score: Number(comment.get('voteScore') ?? 0)
	});
};

export const POST: RequestHandler = async (event) => {
	const identity = await requireFirebaseUser(event);
	const parsed = z
		.object({ value: z.union([z.literal(-1), z.literal(0), z.literal(1)]) })
		.safeParse(await event.request.json().catch(() => null));
	if (!parsed.success) error(400, 'Giá trị bình chọn không hợp lệ.');
	const db = getFirebaseAdminDb();
	const reference = db.collection('comments').doc(commentId(event.params.id));
	const voteReference = reference.collection('votes').doc(identity.uid);
	let score = 0;
	await db.runTransaction(async (transaction) => {
		const [comment, vote, actor] = await Promise.all([
			transaction.get(reference),
			transaction.get(voteReference),
			transaction.get(db.collection('users').doc(identity.uid))
		]);
		if (!comment.exists || comment.get('status') !== 'published')
			error(404, 'Không tìm thấy bình luận.');
		if (!actor.exists || actor.get('status') !== 'active')
			error(403, 'Tài khoản không thể bình chọn.');
		const previous = vote.exists ? Number(vote.get('value')) : 0;
		const next = parsed.data.value;
		score = Math.max(0, Number(comment.get('voteScore') ?? 0) + next - previous);
		if (next === 0) {
			if (vote.exists) transaction.delete(voteReference);
		} else if (vote.exists) {
			transaction.update(voteReference, { value: next, updatedAt: FieldValue.serverTimestamp() });
		} else {
			transaction.create(voteReference, {
				value: next,
				createdAt: FieldValue.serverTimestamp(),
				updatedAt: FieldValue.serverTimestamp()
			});
		}
		if (next !== previous) transaction.update(reference, { voteScore: score });
	});
	return json({ value: parsed.data.value, score });
};
