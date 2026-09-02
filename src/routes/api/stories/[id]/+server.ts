import { optionalFirebaseUser, requireFirebaseUser } from '$lib/server/auth';
import { getFirebaseAdminDb } from '$lib/server/firebase-admin';
import { assertCloudinaryAssetMetadata } from '$lib/server/media-authorization';
import { serializeStory } from '$lib/server/stories';
import { storyMetadataSchema, validatePublishableStory } from '$lib/validation/story';
import { error, json, type RequestHandler } from '@sveltejs/kit';
import { FieldValue } from 'firebase-admin/firestore';
const publicStatuses = ['ongoing', 'completed', 'hiatus'];
function id(value?: string) {
	if (!value || value.includes('/')) error(400, 'ID truyện không hợp lệ.');
	return value;
}
export const GET: RequestHandler = async (event) => {
	const identity = await optionalFirebaseUser(event);
	const snapshot = await getFirebaseAdminDb().collection('stories').doc(id(event.params.id)).get();
	if (
		!snapshot.exists ||
		(!publicStatuses.includes(snapshot.get('status')) && snapshot.get('authorId') !== identity?.uid)
	)
		error(404, 'Không tìm thấy truyện.');
	return json({ story: serializeStory(snapshot) });
};
export const PATCH: RequestHandler = async (event) => {
	const identity = await requireFirebaseUser(event);
	const body = (await event.request.json().catch(() => null)) as unknown;
	const remove =
		typeof body === 'object' && body !== null && 'action' in body && body.action === 'remove';
	const parsed = remove ? null : storyMetadataSchema.safeParse(body);
	if (!remove && parsed && !parsed.success)
		error(400, parsed.error.issues[0]?.message ?? 'Truyện không hợp lệ.');
	const storyId = id(event.params.id);
	if (parsed?.success && parsed.data.cover)
		assertCloudinaryAssetMetadata(parsed.data.cover, `vucdem/stories/${storyId}/cover`);
	const db = getFirebaseAdminDb();
	const storyRef = db.collection('stories').doc(storyId);
	const userRef = db.collection('users').doc(identity.uid);
	await db.runTransaction(async (transaction) => {
		const [story, user] = await Promise.all([transaction.get(storyRef), transaction.get(userRef)]);
		if (!story.exists) error(404, 'Không tìm thấy truyện.');
		if (story.get('authorId') !== identity.uid) error(403, 'Bạn không thể sửa truyện này.');
		if (story.get('status') === 'removed') error(409, 'Truyện đã bị gỡ.');
		const current = story.get('status') as string;
		const format = story.get('format') === 'short' ? 'short' : 'serial';
		const now = FieldValue.serverTimestamp();
		if (remove) {
			transaction.update(storyRef, { status: 'removed', updatedAt: now });
			if (publicStatuses.includes(current))
				transaction.update(userRef, {
					storyCount: Math.max(0, Number(user.get('storyCount') ?? 0) - 1),
					updatedAt: now
				});
			return;
		}
		if (!parsed?.success) error(400, 'Truyện không hợp lệ.');
		const next = parsed.data.status;
		const allowed =
			current === 'draft'
				? format === 'short'
					? ['draft', 'completed']
					: ['draft', 'ongoing']
				: current === 'ongoing'
					? ['ongoing', 'hiatus', 'completed']
					: current === 'hiatus'
						? ['hiatus', 'ongoing', 'completed']
						: ['completed'];
		if (!allowed.includes(next)) error(409, 'Chuyển trạng thái truyện không hợp lệ.');
		const firstPublication =
			current === 'draft' && (next === 'ongoing' || (format === 'short' && next === 'completed'));
		if (firstPublication) {
			const publishedChapters = await transaction.get(
				storyRef.collection('chapters').where('status', '==', 'published').limit(1)
			);
			const problems = validatePublishableStory(parsed.data, publishedChapters.size);
			if (problems.length) error(400, problems[0]);
		}
		transaction.update(storyRef, {
			title: parsed.data.title,
			description: parsed.data.description,
			cover: parsed.data.cover,
			tags: parsed.data.tags,
			status: next,
			updatedAt: now,
			...(firstPublication ? { publishedAt: now } : {})
		});
		if (format === 'short')
			transaction.update(storyRef.collection('chapters').doc('short-story'), {
				title: parsed.data.title,
				updatedAt: now
			});
		if (firstPublication)
			transaction.update(userRef, { storyCount: FieldValue.increment(1), updatedAt: now });
	});
	return json({ story: serializeStory(await storyRef.get()) });
};
