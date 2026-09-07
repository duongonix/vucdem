import { optionalFirebaseUser, requireFirebaseUser } from '$lib/server/auth';
import { getFirebaseAdminDb } from '$lib/server/firebase-admin';
import { actorSnapshot, createNotification } from '$lib/server/notifications';
import { error, json, type RequestHandler } from '@sveltejs/kit';
import { FieldValue } from 'firebase-admin/firestore';
import { z } from 'zod';

const publicStatuses = new Set(['ongoing', 'completed', 'hiatus']);

function storyId(value?: string): string {
	if (!value || value.includes('/')) error(400, 'ID truyện không hợp lệ.');
	return value;
}

export const GET: RequestHandler = async (event) => {
	const identity = await optionalFirebaseUser(event);
	const storyRef = getFirebaseAdminDb().collection('stories').doc(storyId(event.params.id));
	const story = await storyRef.get();
	if (!story.exists || !publicStatuses.has(String(story.get('status'))))
		error(404, 'Không tìm thấy truyện.');
	const rating = identity ? await storyRef.collection('ratings').doc(identity.uid).get() : null;
	return json({
		value: rating?.exists ? Number(rating.get('value')) : 0,
		average: Number(story.get('ratingAverage') ?? 0),
		count: Number(story.get('ratingCount') ?? 0)
	});
};

export const PUT: RequestHandler = async (event) => {
	const identity = await requireFirebaseUser(event);
	const parsed = z
		.object({ value: z.number().int().min(1).max(5) })
		.strict()
		.safeParse(await event.request.json().catch(() => null));
	if (!parsed.success) error(400, 'Đánh giá phải từ 1 đến 5 sao.');
	const db = getFirebaseAdminDb();
	const storyRef = db.collection('stories').doc(storyId(event.params.id));
	const ratingRef = storyRef.collection('ratings').doc(identity.uid);
	let average = 0;
	let count = 0;
	await db.runTransaction(async (transaction) => {
		const [story, previousRating, user] = await Promise.all([
			transaction.get(storyRef),
			transaction.get(ratingRef),
			transaction.get(db.collection('users').doc(identity.uid))
		]);
		if (!story.exists || !publicStatuses.has(String(story.get('status'))))
			error(404, 'Không tìm thấy truyện.');
		if (!user.exists || user.get('status') !== 'active')
			error(403, 'Tài khoản không thể đánh giá truyện.');
		const previous = previousRating.exists ? Number(previousRating.get('value')) : 0;
		count = Math.max(0, Number(story.get('ratingCount') ?? 0) + (previousRating.exists ? 0 : 1));
		const sum = Math.max(0, Number(story.get('ratingSum') ?? 0) + parsed.data.value - previous);
		average = count > 0 ? Math.round((sum / count) * 10) / 10 : 0;
		if (previousRating.exists)
			transaction.update(ratingRef, {
				value: parsed.data.value,
				updatedAt: FieldValue.serverTimestamp()
			});
		else
			transaction.create(ratingRef, {
				value: parsed.data.value,
				createdAt: FieldValue.serverTimestamp(),
				updatedAt: FieldValue.serverTimestamp()
			});
		transaction.update(storyRef, { ratingCount: count, ratingSum: sum, ratingAverage: average });
		if (
			story.get('authorId') !== identity.uid &&
			(!previousRating.exists || previous !== parsed.data.value)
		)
			createNotification(transaction, db, {
				id: `story_rating_${storyRef.id}_${identity.uid}`,
				userId: story.get('authorId'),
				actorId: identity.uid,
				...actorSnapshot(user),
				type: 'story_rating',
				targetType: 'story',
				targetId: storyRef.id,
				message: `đã đánh giá ${parsed.data.value} sao cho “${String(story.get('title') ?? 'truyện của bạn')}”.`,
				destination: `/story/${String(story.get('slug') ?? '')}`
			});
	});
	return json({ value: parsed.data.value, average, count });
};
