import { requireFirebaseUser, optionalFirebaseUser } from '$lib/server/auth';
import { serializeChapter } from '$lib/server/chapters';
import { getFirebaseAdminDb } from '$lib/server/firebase-admin';
import { chapterInputSchema, countWords } from '$lib/validation/chapter';
import { error, json, type RequestHandler } from '@sveltejs/kit';
import { FieldValue } from 'firebase-admin/firestore';
import { assertCloudinaryAudioMetadata } from '$lib/server/media-authorization';
import { assertInteractiveMedia, writeInteractiveContent } from '$lib/server/interactive-stories';
import { notifyChapterPublicationFollowers } from '$lib/server/publication-notifications';

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
	const userRef = db.collection('users').doc(identity.uid);
	const chapterRef = parsed.data.id
		? storyRef.collection('chapters').doc(parsed.data.id)
		: storyRef.collection('chapters').doc();
	let publication: { storySlug: string; chapterNumber: number } | null = null;
	if (parsed.data.audio)
		assertCloudinaryAudioMetadata(
			parsed.data.audio,
			`vucdem/stories/${storyRef.id}/chapters/${chapterRef.id}/audio`
		);
	if (parsed.data.contentFormat === 'interactive')
		assertInteractiveMedia(storyRef.id, chapterRef.id, parsed.data.interactive);
	await db.runTransaction(async (transaction) => {
		const [story, user] = await Promise.all([transaction.get(storyRef), transaction.get(userRef)]);
		if (!story.exists || story.get('authorId') !== identity.uid)
			error(403, 'Bạn không sở hữu truyện này.');
		if (!user.exists || user.get('status') !== 'active')
			error(403, 'Tài khoản không thể đăng chương.');
		if (story.get('status') === 'removed') error(409, 'Truyện đã bị gỡ.');
		if (story.get('format') === 'short')
			error(409, 'Truyện ngắn chỉ có một phần nội dung duy nhất.');
		const chapterNumber =
			Number(story.get('chapterSequence') ?? story.get('chapterCount') ?? 0) + 1;
		const now = FieldValue.serverTimestamp();
		const submitted = parsed.data.status === 'published';
		const autoApproved = submitted && user.get('role') === 'admin';
		if (autoApproved) publication = { storySlug: String(story.get('slug')), chapterNumber };
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
			status: autoApproved ? 'published' : 'draft',
			moderationStatus: autoApproved ? 'approved' : submitted ? 'pending' : 'not_submitted',
			submissionVersion: submitted ? 1 : 0,
			submittedAt: submitted ? now : null,
			reviewedAt: autoApproved ? now : null,
			reviewedBy: autoApproved ? identity.uid : null,
			rejectionReason: null,
			contentFormat: parsed.data.contentFormat,
			audio: parsed.data.audio,
			createdAt: now,
			updatedAt: now,
			publishedAt: autoApproved ? now : null
		});
		if (autoApproved)
			transaction.create(chapterRef.collection('moderationReviews').doc(), {
				decision: 'approved',
				reason: null,
				reviewerId: identity.uid,
				reviewerName: String(user.get('displayName') ?? user.get('username') ?? 'Quản trị viên'),
				submissionVersion: 1,
				createdAt: now
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
	const published = publication as { storySlug: string; chapterNumber: number } | null;
	if (published)
		await notifyChapterPublicationFollowers(db, {
			authorId: identity.uid,
			storyId: storyRef.id,
			storySlug: published.storySlug,
			chapterId: chapterRef.id,
			chapterNumber: published.chapterNumber
		});
	return json({ chapter: serializeChapter(await chapterRef.get()) }, { status: 201 });
};
