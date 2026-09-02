import { json } from '@sveltejs/kit';
import { FieldValue } from 'firebase-admin/firestore';
import { z } from 'zod';
import { requireFirebaseUser } from '$lib/server/auth';
import { getFirebaseAdminDb } from '$lib/server/firebase-admin';
import type { RequestHandler } from './$types';

const inputSchema = z.object({
	storyId: z.string().min(1).max(128),
	storySlug: z.string().min(1).max(180),
	storyTitle: z.string().min(1).max(200),
	chapterId: z.string().min(1).max(128),
	chapterNumber: z.number().int().positive(),
	chapterTitle: z.string().min(1).max(200),
	progressPercent: z.number().min(0).max(100)
});

export const GET: RequestHandler = async (event) => {
	const identity = await requireFirebaseUser(event);
	const snapshot = await getFirebaseAdminDb()
		.collection('users')
		.doc(identity.uid)
		.collection('readingProgress')
		.doc(event.params.storyId)
		.get();
	if (!snapshot.exists) return json({ message: 'Chưa có tiến độ đọc.' }, { status: 404 });
	const data = snapshot.data()!;
	return json({ progress: { ...data, updatedAt: data.updatedAt.toMillis() } });
};

export const PUT: RequestHandler = async (event) => {
	const identity = await requireFirebaseUser(event);
	const parsed = inputSchema.safeParse(await event.request.json().catch(() => null));
	if (!parsed.success || parsed.data.storyId !== event.params.storyId)
		return json({ message: 'Tiến độ đọc không hợp lệ.' }, { status: 400 });
	const db = getFirebaseAdminDb();
	const [story, chapter] = await Promise.all([
		db.collection('stories').doc(parsed.data.storyId).get(),
		db
			.collection('stories')
			.doc(parsed.data.storyId)
			.collection('chapters')
			.doc(parsed.data.chapterId)
			.get()
	]);
	if (!story.exists || !chapter.exists || chapter.get('status') !== 'published')
		return json({ message: 'Chương không khả dụng.' }, { status: 404 });
	await db
		.collection('users')
		.doc(identity.uid)
		.collection('readingProgress')
		.doc(parsed.data.storyId)
		.set({ ...parsed.data, updatedAt: FieldValue.serverTimestamp() });
	return json({ ok: true });
};
