import { optionalFirebaseUser } from '$lib/server/auth';
import { getFirebaseAdminDb } from '$lib/server/firebase-admin';
import { error, json, type RequestHandler } from '@sveltejs/kit';
import { createHash } from 'node:crypto';
import { FieldValue } from 'firebase-admin/firestore';
import { z } from 'zod';

const viewInput = z.discriminatedUnion('type', [
	z.object({ type: z.literal('post'), targetId: z.string().min(1).max(160) }),
	z.object({ type: z.literal('story'), targetId: z.string().min(1).max(160) }),
	z.object({
		type: z.literal('chapter'),
		storyId: z.string().min(1).max(160),
		targetId: z.string().min(1).max(160)
	})
]);
const publicStoryStatuses = ['ongoing', 'hiatus', 'completed'];
const VIEW_WINDOW_SECONDS = 60 * 60;

function assertDocumentId(value: string): string {
	if (value.includes('/')) error(400, 'ID nội dung không hợp lệ.');
	return value;
}

function cookieName(key: string): string {
	return `vd_view_${createHash('sha256').update(key).digest('hex').slice(0, 24)}`;
}

export const POST: RequestHandler = async (event) => {
	const parsed = viewInput.safeParse(await event.request.json().catch(() => null));
	if (!parsed.success) error(400, 'Lượt đọc không hợp lệ.');
	const identity = await optionalFirebaseUser(event);
	const db = getFirebaseAdminDb();
	const input = parsed.data;
	const storyId = input.type === 'chapter' ? assertDocumentId(input.storyId) : null;
	const targetId = assertDocumentId(input.targetId);
	const targetCookie = cookieName(`${input.type}:${storyId ?? ''}:${targetId}`);
	const targetSeen = event.cookies.get(targetCookie) === '1';
	const storyCookie = storyId ? cookieName(`story::${storyId}`) : null;
	const storySeen = storyCookie ? event.cookies.get(storyCookie) === '1' : false;

	const result = await db.runTransaction(async (transaction) => {
		if (input.type === 'post') {
			const ref = db.collection('posts').doc(targetId);
			const snapshot = await transaction.get(ref);
			if (!snapshot.exists || snapshot.get('status') !== 'published') error(404);
			const current = Number(snapshot.get('viewCount') ?? 0);
			if (targetSeen || snapshot.get('authorId') === identity?.uid)
				return { counted: false, viewCount: current };
			transaction.update(ref, { viewCount: FieldValue.increment(1) });
			return { counted: true, viewCount: current + 1 };
		}

		if (input.type === 'story') {
			const ref = db.collection('stories').doc(targetId);
			const snapshot = await transaction.get(ref);
			if (!snapshot.exists || !publicStoryStatuses.includes(String(snapshot.get('status'))))
				error(404);
			const current = Number(snapshot.get('viewCount') ?? 0);
			if (targetSeen || snapshot.get('authorId') === identity?.uid)
				return { counted: false, viewCount: current };
			transaction.update(ref, { viewCount: FieldValue.increment(1) });
			return { counted: true, viewCount: current + 1 };
		}

		const storyRef = db.collection('stories').doc(storyId!);
		const chapterRef = storyRef.collection('chapters').doc(targetId);
		const [story, chapter] = await Promise.all([
			transaction.get(storyRef),
			transaction.get(chapterRef)
		]);
		if (
			!story.exists ||
			!chapter.exists ||
			!publicStoryStatuses.includes(String(story.get('status'))) ||
			chapter.get('status') !== 'published'
		)
			error(404);
		const chapterCount = Number(chapter.get('viewCount') ?? 0);
		const storyCount = Number(story.get('viewCount') ?? 0);
		if (story.get('authorId') === identity?.uid)
			return {
				counted: false,
				storyCounted: false,
				viewCount: chapterCount,
				storyViewCount: storyCount
			};
		if (!targetSeen) transaction.update(chapterRef, { viewCount: FieldValue.increment(1) });
		if (!storySeen) transaction.update(storyRef, { viewCount: FieldValue.increment(1) });
		return {
			counted: !targetSeen,
			storyCounted: !storySeen,
			viewCount: chapterCount + (targetSeen ? 0 : 1),
			storyViewCount: storyCount + (storySeen ? 0 : 1)
		};
	});

	const cookieOptions = {
		path: '/',
		httpOnly: true,
		sameSite: 'lax' as const,
		secure: event.url.protocol === 'https:',
		maxAge: VIEW_WINDOW_SECONDS
	};
	if (result.counted) event.cookies.set(targetCookie, '1', cookieOptions);
	if ('storyCounted' in result && result.storyCounted && storyCookie)
		event.cookies.set(storyCookie, '1', cookieOptions);
	return json(result);
};
