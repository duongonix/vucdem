import { requireFirebaseUser } from '$lib/server/auth';
import { getFirebaseAdminDb } from '$lib/server/firebase-admin';
import {
	assertCloudinaryAssetMetadata,
	assertCloudinaryAudioMetadata
} from '$lib/server/media-authorization';
import { serializeStory } from '$lib/server/stories';
import { createStorySchema, storySlug } from '$lib/validation/story';
import { countWords } from '$lib/validation/chapter';
import { error, json, type RequestHandler } from '@sveltejs/kit';
import { FieldValue } from 'firebase-admin/firestore';
import { assertInteractiveMedia, writeInteractiveContent } from '$lib/server/interactive-stories';

const PAGE_SIZE = 20;

function encodeCursor(createdAt: number, id: string) {
	return Buffer.from(JSON.stringify([createdAt, id])).toString('base64url');
}

function decodeCursor(value: string) {
	try {
		const parsed = JSON.parse(Buffer.from(value, 'base64url').toString()) as unknown;
		if (
			Array.isArray(parsed) &&
			parsed.length === 2 &&
			typeof parsed[0] === 'number' &&
			typeof parsed[1] === 'string'
		)
			return parsed as [number, string];
	} catch {
		// Invalid cursors are handled below.
	}
	error(400, 'Con trỏ phân trang không hợp lệ.');
}

export const GET: RequestHandler = async ({ url }) => {
	const db = getFirebaseAdminDb();
	const tag = url.searchParams.get('tag')?.trim();
	let query = db.collection('stories').where('status', 'in', ['ongoing', 'completed', 'hiatus']);
	if (tag) query = query.where('tags', 'array-contains', tag);
	query = query.orderBy('createdAt', 'desc').orderBy('__name__', 'desc').limit(PAGE_SIZE);
	const cursor = url.searchParams.get('cursor');
	if (cursor) {
		const [millis, id] = decodeCursor(cursor);
		query = query.startAfter(new Date(millis), id);
	}
	try {
		const snapshot = await query.get();
		const last = snapshot.docs.at(-1);
		return json({
			stories: snapshot.docs.map(serializeStory),
			nextCursor:
				snapshot.size === PAGE_SIZE && last
					? encodeCursor(last.get('createdAt').toMillis(), last.id)
					: null
		});
	} catch (cause) {
		const code = (cause as { code?: number | string }).code;
		if (code !== 9 && code !== 'failed-precondition') throw cause;
		const publicStatuses = new Set(['ongoing', 'completed', 'hiatus']);
		const fallback = await db.collection('stories').limit(100).get();
		const stories = fallback.docs
			.filter(
				(document) =>
					publicStatuses.has(String(document.get('status'))) &&
					(!tag || (document.get('tags') as unknown[] | undefined)?.includes(tag))
			)
			.sort(
				(a, b) => (b.get('createdAt')?.toMillis?.() ?? 0) - (a.get('createdAt')?.toMillis?.() ?? 0)
			)
			.slice(0, PAGE_SIZE);
		return json({ stories: stories.map(serializeStory), nextCursor: null });
	}
};
async function reserveSlug(
	transaction: FirebaseFirestore.Transaction,
	base: string,
	storyId: string
): Promise<string> {
	const db = getFirebaseAdminDb();
	for (let suffix = 1; suffix <= 100; suffix += 1) {
		const slug = suffix === 1 ? base : `${base}-${suffix}`;
		const ref = db.collection('storySlugs').doc(slug);
		const existing = await transaction.get(ref);
		if (!existing.exists) {
			transaction.create(ref, { storyId, createdAt: FieldValue.serverTimestamp() });
			return slug;
		}
	}
	error(409, 'Không thể tạo đường dẫn duy nhất cho truyện.');
}
export const POST: RequestHandler = async (event) => {
	const identity = await requireFirebaseUser(event);
	const parsed = createStorySchema.safeParse(await event.request.json().catch(() => null));
	if (!parsed.success) error(400, parsed.error.issues[0]?.message ?? 'Truyện không hợp lệ.');
	if (parsed.data.id.includes('/')) error(400, 'ID truyện không hợp lệ.');
	if (parsed.data.cover)
		assertCloudinaryAssetMetadata(parsed.data.cover, `vucdem/stories/${parsed.data.id}/cover`);
	if (parsed.data.format === 'short' && parsed.data.contentFormat === 'audio')
		assertCloudinaryAudioMetadata(
			parsed.data.shortAudio,
			`vucdem/stories/${parsed.data.id}/chapters/short-story/audio`
		);
	if (parsed.data.format === 'short' && parsed.data.contentFormat === 'interactive')
		assertInteractiveMedia(parsed.data.id, 'short-story', parsed.data.interactive);
	const db = getFirebaseAdminDb();
	const storyRef = db.collection('stories').doc(parsed.data.id);
	const shortChapterRef = storyRef.collection('chapters').doc('short-story');
	const userRef = db.collection('users').doc(identity.uid);
	await db.runTransaction(async (transaction) => {
		const [user, existing] = await Promise.all([
			transaction.get(userRef),
			transaction.get(storyRef)
		]);
		if (!user.exists || user.get('status') !== 'active')
			error(403, 'Tài khoản không thể tạo truyện.');
		if (existing.exists) error(409, 'Truyện đã tồn tại.');
		const slug = await reserveSlug(transaction, storySlug(parsed.data.title), parsed.data.id);
		const avatar = user.get('avatar') as { url?: unknown } | null;
		const now = FieldValue.serverTimestamp();
		transaction.create(storyRef, {
			authorId: identity.uid,
			authorName: user.get('displayName'),
			authorUsername: user.get('username'),
			authorAvatarUrl: typeof avatar?.url === 'string' ? avatar.url : null,
			authorVerified: user.get('verify') === true,
			title: parsed.data.title,
			slug,
			description: parsed.data.description,
			cover: parsed.data.cover,
			tags: parsed.data.tags,
			format: parsed.data.format,
			contentFormat: parsed.data.contentFormat,
			status: 'draft',
			chapterCount: parsed.data.format === 'short' ? 1 : 0,
			commentCount: 0,
			chapterSequence: parsed.data.format === 'short' ? 1 : 0,
			viewCount: 0,
			followerCount: 0,
			ratingCount: 0,
			ratingSum: 0,
			ratingAverage: 0,
			createdAt: now,
			updatedAt: now,
			publishedAt: null
		});
		if (parsed.data.format === 'short') {
			transaction.create(shortChapterRef, {
				storyId: storyRef.id,
				chapterNumber: 1,
				title: parsed.data.title,
				contentFormat: parsed.data.contentFormat,
				content: parsed.data.shortContent,
				audio: parsed.data.contentFormat === 'audio' ? parsed.data.shortAudio : null,
				wordCount: countWords(parsed.data.shortContent),
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
				status: 'published',
				createdAt: now,
				updatedAt: now,
				publishedAt: now
			});
			if (parsed.data.contentFormat === 'interactive')
				writeInteractiveContent(transaction, storyRef, shortChapterRef, parsed.data.interactive);
		}
	});
	return json({ story: serializeStory(await storyRef.get()) }, { status: 201 });
};
