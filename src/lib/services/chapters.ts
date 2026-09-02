import { getFirebaseAuth } from '$lib/firebase/auth';
import type { Chapter, InteractiveCharacter, InteractiveStoryContent } from '$lib/types';
import type { ChapterInput } from '$lib/validation/chapter';
import { Timestamp } from 'firebase/firestore';
import { collection, doc } from 'firebase/firestore';
import { getFirestoreDb } from '$lib/firebase/firestore';

type Serialized = Omit<Chapter, 'createdAt' | 'updatedAt' | 'publishedAt'> & {
	createdAt: number;
	updatedAt: number;
	publishedAt: number | null;
};

async function authHeaders(json = false): Promise<HeadersInit> {
	const headers: Record<string, string> = {};
	try {
		const user = getFirebaseAuth().currentUser;
		if (user) headers.authorization = `Bearer ${await user.getIdToken()}`;
	} catch {
		// Public chapter reads remain available without Firebase browser configuration.
	}
	if (json) headers['content-type'] = 'application/json';
	return headers;
}
function revive(chapter: Serialized): Chapter {
	return {
		...chapter,
		createdAt: Timestamp.fromMillis(chapter.createdAt),
		updatedAt: Timestamp.fromMillis(chapter.updatedAt),
		publishedAt: chapter.publishedAt ? Timestamp.fromMillis(chapter.publishedAt) : null
	};
}
async function parse(response: Response): Promise<Chapter> {
	const body = await response.json().catch(() => ({}));
	if (!response.ok || !body.chapter)
		throw new Error(
			body.message && body.message !== 'Internal Error' ? body.message : 'Không thể tải chương.'
		);
	return revive(body.chapter);
}
export async function listChapters(storyId: string): Promise<Chapter[]> {
	const response = await fetch(`/api/stories/${storyId}/chapters`, {
		headers: await authHeaders()
	});
	const body = await response.json().catch(() => ({}));
	if (!response.ok)
		throw new Error(
			body.message && body.message !== 'Internal Error'
				? body.message
				: 'Không thể tải danh sách chương.'
		);
	return (body.chapters as Serialized[]).map(revive);
}
export async function getChapter(storyId: string, chapterId: string) {
	return parse(
		await fetch(`/api/stories/${storyId}/chapters/${chapterId}`, { headers: await authHeaders() })
	);
}
export async function getInteractiveContent(
	storyId: string,
	chapterId: string
): Promise<InteractiveStoryContent> {
	const response = await fetch(`/api/stories/${storyId}/chapters/${chapterId}/interactive`, {
		headers: await authHeaders()
	});
	const body = await response.json().catch(() => ({}));
	if (!response.ok || !body.interactive)
		throw new Error(body.message ?? 'Không thể tải kịch bản nhập vai.');
	return body.interactive as InteractiveStoryContent;
}
export async function getInteractiveCharacters(storyId: string): Promise<InteractiveCharacter[]> {
	const response = await fetch(`/api/stories/${storyId}/interactive`, {
		headers: await authHeaders()
	});
	const body = await response.json().catch(() => ({}));
	if (!response.ok) throw new Error(body.message ?? 'Không thể tải nhân vật.');
	return body.characters as InteractiveCharacter[];
}
export async function createChapter(storyId: string, input: ChapterInput) {
	return parse(
		await fetch(`/api/stories/${storyId}/chapters`, {
			method: 'POST',
			headers: await authHeaders(true),
			body: JSON.stringify(input)
		})
	);
}
export function createChapterId(storyId: string): string {
	return doc(collection(getFirestoreDb(), 'stories', storyId, 'chapters')).id;
}
export async function updateChapter(storyId: string, chapterId: string, input: ChapterInput) {
	return parse(
		await fetch(`/api/stories/${storyId}/chapters/${chapterId}`, {
			method: 'PATCH',
			headers: await authHeaders(true),
			body: JSON.stringify(input)
		})
	);
}
export async function removeChapter(storyId: string, chapterId: string) {
	const response = await fetch(`/api/stories/${storyId}/chapters/${chapterId}`, {
		method: 'DELETE',
		headers: await authHeaders()
	});
	if (!response.ok)
		throw new Error((await response.json().catch(() => ({}))).message ?? 'Không thể gỡ chương.');
}
