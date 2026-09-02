import { optionalFirebaseUser, requireFirebaseUser } from '$lib/server/auth';
import { serializeChapter } from '$lib/server/chapters';
import { getFirebaseAdminDb } from '$lib/server/firebase-admin';
import { chapterInputSchema, countWords } from '$lib/validation/chapter';
import { error, json, type RequestHandler } from '@sveltejs/kit';
import { FieldValue } from 'firebase-admin/firestore';
import { actorSnapshot } from '$lib/server/notifications';
import { assertCloudinaryAudioMetadata } from '$lib/server/media-authorization';
import { assertInteractiveMedia, writeInteractiveContent } from '$lib/server/interactive-stories';

async function context(event: Parameters<RequestHandler>[0]) {
	const db = getFirebaseAdminDb();
	const storyRef = db.collection('stories').doc(event.params.id!);
	const chapterRef = storyRef.collection('chapters').doc(event.params.chapterId!);
	return { db, storyRef, chapterRef };
}

export const GET: RequestHandler = async (event) => {
	const identity = await optionalFirebaseUser(event);
	const { storyRef, chapterRef } = await context(event);
	const [story, chapter] = await Promise.all([storyRef.get(), chapterRef.get()]);
	const owner = story.exists && identity?.uid === story.get('authorId');
	if (!chapter.exists || !story.exists || (!owner && chapter.get('status') !== 'published'))
		error(404);
	if (!owner && !['ongoing', 'hiatus', 'completed'].includes(story.get('status'))) error(404);
	return json({ chapter: serializeChapter(chapter) });
};

export const PATCH: RequestHandler = async (event) => {
	const identity = await requireFirebaseUser(event);
	const parsed = chapterInputSchema.safeParse(await event.request.json().catch(() => null));
	if (!parsed.success) error(400, parsed.error.issues[0]?.message ?? 'Chương không hợp lệ.');
	const { db, storyRef, chapterRef } = await context(event);
	const existingInteractiveEvents =
		parsed.data.contentFormat === 'interactive'
			? (await chapterRef.collection('interactiveEvents').select().get()).docs.map(
					(item) => item.id
				)
			: [];
	if (parsed.data.audio)
		assertCloudinaryAudioMetadata(
			parsed.data.audio,
			`vucdem/stories/${storyRef.id}/chapters/${chapterRef.id}/audio`
		);
	if (parsed.data.contentFormat === 'interactive')
		assertInteractiveMedia(storyRef.id, chapterRef.id, parsed.data.interactive);
	let firstPublication = false;
	await db.runTransaction(async (transaction) => {
		const [story, chapter] = await Promise.all([
			transaction.get(storyRef),
			transaction.get(chapterRef)
		]);
		if (!story.exists || story.get('authorId') !== identity.uid) error(403);
		if (!chapter.exists || chapter.get('status') === 'removed') error(404);
		if (
			story.get('format') === 'short' &&
			['ongoing', 'hiatus', 'completed'].includes(String(story.get('status'))) &&
			parsed.data.status !== 'published'
		)
			error(409, 'Không thể chuyển nội dung của truyện ngắn đã xuất bản về bản nháp.');
		const now = FieldValue.serverTimestamp();
		firstPublication = chapter.get('status') !== 'published' && parsed.data.status === 'published';
		transaction.update(chapterRef, {
			title: parsed.data.title,
			content: parsed.data.content,
			wordCount: countWords(parsed.data.content),
			contentFormat: parsed.data.contentFormat,
			audio: parsed.data.audio,
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
			updatedAt: now,
			publishedAt: parsed.data.status === 'published' ? (chapter.get('publishedAt') ?? now) : null
		});
		if (parsed.data.contentFormat === 'interactive')
			writeInteractiveContent(
				transaction,
				storyRef,
				chapterRef,
				parsed.data.interactive,
				existingInteractiveEvents
			);
		const existingStoryFormat = String(story.get('contentFormat') ?? 'text');
		transaction.update(storyRef, {
			contentFormat:
				existingStoryFormat === parsed.data.contentFormat ? existingStoryFormat : 'mixed',
			updatedAt: now
		});
	});
	if (firstPublication) {
		const [followers, actor] = await Promise.all([
			storyRef.collection('followers').get(),
			db.collection('users').doc(identity.uid).get()
		]);
		if (actor.exists && !followers.empty) {
			const batch = db.batch();
			const snapshot = actorSnapshot(actor);
			for (const follower of followers.docs) {
				if (follower.id === identity.uid) continue;
				batch.set(
					db.collection('notifications').doc(`story_update_${chapterRef.id}_${follower.id}`),
					{
						userId: follower.id,
						actorId: identity.uid,
						...snapshot,
						type: 'story_update',
						targetType: 'chapter',
						targetId: `${storyRef.id}:${chapterRef.id}`,
						isRead: false,
						createdAt: FieldValue.serverTimestamp(),
						readAt: null
					}
				);
			}
			await batch.commit();
		}
	}
	return json({ chapter: serializeChapter(await chapterRef.get()) });
};

export const DELETE: RequestHandler = async (event) => {
	const identity = await requireFirebaseUser(event);
	const { db, storyRef, chapterRef } = await context(event);
	await db.runTransaction(async (transaction) => {
		const [story, chapter] = await Promise.all([
			transaction.get(storyRef),
			transaction.get(chapterRef)
		]);
		if (!story.exists || story.get('authorId') !== identity.uid) error(403);
		if (!chapter.exists || chapter.get('status') === 'removed') error(404);
		if (story.get('format') === 'short')
			error(409, 'Không thể xóa nội dung duy nhất của truyện ngắn.');
		const now = FieldValue.serverTimestamp();
		transaction.update(chapterRef, { status: 'removed', updatedAt: now });
		transaction.update(storyRef, {
			chapterCount: Math.max(0, Number(story.get('chapterCount') ?? 0) - 1),
			updatedAt: now
		});
	});
	return json({ ok: true });
};
