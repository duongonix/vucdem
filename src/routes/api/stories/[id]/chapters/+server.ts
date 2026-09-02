import { requireFirebaseUser, optionalFirebaseUser } from '$lib/server/auth';
import { serializeChapter } from '$lib/server/chapters';
import { getFirebaseAdminDb } from '$lib/server/firebase-admin';
import { chapterInputSchema, countWords } from '$lib/validation/chapter';
import { error, json, type RequestHandler } from '@sveltejs/kit';
import { FieldValue } from 'firebase-admin/firestore';
import { actorSnapshot } from '$lib/server/notifications';
import { assertCloudinaryAudioMetadata } from '$lib/server/media-authorization';
import { assertInteractiveMedia, writeInteractiveContent } from '$lib/server/interactive-stories';

async function notifyFollowers(storyId: string, chapterId: string, actorId: string) {
	const db = getFirebaseAdminDb();
	const [followers, actor] = await Promise.all([
		db.collection('stories').doc(storyId).collection('followers').get(),
		db.collection('users').doc(actorId).get()
	]);
	if (!actor.exists || followers.empty) return;
	const batch = db.batch();
	const snapshot = actorSnapshot(actor);
	for (const follower of followers.docs) {
		if (follower.id === actorId) continue;
		batch.set(db.collection('notifications').doc(`story_update_${chapterId}_${follower.id}`), {
			userId: follower.id,
			actorId,
			...snapshot,
			type: 'story_update',
			targetType: 'chapter',
			targetId: `${storyId}:${chapterId}`,
			isRead: false,
			createdAt: FieldValue.serverTimestamp(),
			readAt: null
		});
	}
	await batch.commit();
}

export const GET: RequestHandler = async (event) => {
	const identity = await optionalFirebaseUser(event);
	const db = getFirebaseAdminDb();
	const story = await db.collection('stories').doc(event.params.id!).get();
	if (!story.exists || story.get('status') === 'removed') error(404, 'Không tìm thấy truyện.');
	const owner = identity?.uid === story.get('authorId');
	if (!owner && !['ongoing', 'hiatus', 'completed'].includes(story.get('status'))) error(404);
	const snapshot = await story.ref.collection('chapters').orderBy('chapterNumber', 'asc').get();
	const visibleChapters = owner
		? snapshot.docs
		: snapshot.docs.filter((chapter) => chapter.get('status') === 'published');
	return json({ chapters: visibleChapters.map(serializeChapter) });
};

export const POST: RequestHandler = async (event) => {
	const identity = await requireFirebaseUser(event);
	const parsed = chapterInputSchema.safeParse(await event.request.json().catch(() => null));
	if (!parsed.success) error(400, parsed.error.issues[0]?.message ?? 'Chương không hợp lệ.');
	const db = getFirebaseAdminDb();
	const storyRef = db.collection('stories').doc(event.params.id!);
	const chapterRef = parsed.data.id
		? storyRef.collection('chapters').doc(parsed.data.id)
		: storyRef.collection('chapters').doc();
	if (parsed.data.audio)
		assertCloudinaryAudioMetadata(
			parsed.data.audio,
			`vucdem/stories/${storyRef.id}/chapters/${chapterRef.id}/audio`
		);
	if (parsed.data.contentFormat === 'interactive')
		assertInteractiveMedia(storyRef.id, chapterRef.id, parsed.data.interactive);
	await db.runTransaction(async (transaction) => {
		const story = await transaction.get(storyRef);
		if (!story.exists || story.get('authorId') !== identity.uid)
			error(403, 'Bạn không sở hữu truyện này.');
		if (story.get('status') === 'removed') error(409, 'Truyện đã bị gỡ.');
		if (story.get('format') === 'short')
			error(409, 'Truyện ngắn chỉ có một phần nội dung duy nhất.');
		const chapterNumber =
			Number(story.get('chapterSequence') ?? story.get('chapterCount') ?? 0) + 1;
		const now = FieldValue.serverTimestamp();
		transaction.create(chapterRef, {
			storyId: storyRef.id,
			chapterNumber,
			title: parsed.data.title,
			content: parsed.data.content,
			wordCount: countWords(parsed.data.content),
			viewCount: 0,
			commentCount: 0,
			conversationTitle:
				parsed.data.contentFormat === 'interactive'
					? parsed.data.interactive.conversationTitle
					: null,
			conversationType:
				parsed.data.contentFormat === 'interactive'
					? parsed.data.interactive.conversationType
					: null,
			conversationCharacterId:
				parsed.data.contentFormat === 'interactive'
					? parsed.data.interactive.conversationCharacterId
					: null,
			interactiveEventCount:
				parsed.data.contentFormat === 'interactive' ? parsed.data.interactive.events.length : 0,
			status: parsed.data.status,
			contentFormat: parsed.data.contentFormat,
			audio: parsed.data.audio,
			createdAt: now,
			updatedAt: now,
			publishedAt: parsed.data.status === 'published' ? now : null
		});
		if (parsed.data.contentFormat === 'interactive')
			writeInteractiveContent(transaction, storyRef, chapterRef, parsed.data.interactive);
		const currentFormat = String(story.get('contentFormat') ?? 'text');
		const storyContentFormat =
			Number(story.get('chapterCount') ?? 0) === 0
				? parsed.data.contentFormat
				: currentFormat === parsed.data.contentFormat
					? currentFormat
					: 'mixed';
		transaction.update(storyRef, {
			chapterSequence: chapterNumber,
			chapterCount: FieldValue.increment(1),
			contentFormat: storyContentFormat,
			updatedAt: now
		});
	});
	if (parsed.data.status === 'published')
		await notifyFollowers(storyRef.id, chapterRef.id, identity.uid);
	return json({ chapter: serializeChapter(await chapterRef.get()) }, { status: 201 });
};
