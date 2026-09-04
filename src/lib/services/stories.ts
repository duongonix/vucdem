import { getFirebaseAuth } from '$lib/firebase/auth';
import { getFirestoreDb } from '$lib/firebase/firestore';
import type { Story } from '$lib/types';
import type { CreateStoryInput, StoryMetadataInput } from '$lib/validation/story';
import { collection, doc, Timestamp } from 'firebase/firestore';
interface SerializedStory extends Omit<
	Story,
	'createdAt' | 'updatedAt' | 'publishedAt' | 'pinnedAt'
> {
	createdAt: number;
	updatedAt: number;
	publishedAt: number | null;
	pinnedAt: number | null;
}
interface StoryResponse {
	story?: SerializedStory;
	message?: string;
}
export interface StoryPage {
	stories: Story[];
	nextCursor: string | null;
}
function revive(value: SerializedStory): Story {
	return {
		...value,
		createdAt: Timestamp.fromMillis(value.createdAt),
		updatedAt: Timestamp.fromMillis(value.updatedAt),
		publishedAt: value.publishedAt === null ? null : Timestamp.fromMillis(value.publishedAt),
		pinnedAt: value.pinnedAt === null ? null : Timestamp.fromMillis(value.pinnedAt)
	};
}
async function headers() {
	const user = getFirebaseAuth().currentUser;
	if (!user) throw new Error('Bạn cần đăng nhập để quản lý truyện.');
	return { authorization: `Bearer ${await user.getIdToken()}`, 'content-type': 'application/json' };
}
async function optionalHeaders(): Promise<HeadersInit> {
	try {
		const user = getFirebaseAuth().currentUser;
		return user ? { authorization: `Bearer ${await user.getIdToken()}` } : {};
	} catch {
		return {};
	}
}
async function parse(response: Response): Promise<Story> {
	const body = (await response.json().catch(() => ({}))) as StoryResponse;
	if (!response.ok || !body.story)
		throw new Error(
			body.message && body.message !== 'Internal Error' ? body.message : 'Không thể tải truyện.'
		);
	return revive(body.story);
}
export function createStoryId(): string {
	return doc(collection(getFirestoreDb(), 'stories')).id;
}
export async function createStory(input: CreateStoryInput): Promise<Story> {
	return parse(
		await fetch('/api/stories', {
			method: 'POST',
			headers: await headers(),
			body: JSON.stringify(input)
		})
	);
}
export async function updateStory(id: string, input: StoryMetadataInput): Promise<Story> {
	return parse(
		await fetch(`/api/stories/${encodeURIComponent(id)}`, {
			method: 'PATCH',
			headers: await headers(),
			body: JSON.stringify(input)
		})
	);
}
export async function removeStory(id: string): Promise<Story> {
	return parse(
		await fetch(`/api/stories/${encodeURIComponent(id)}`, {
			method: 'PATCH',
			headers: await headers(),
			body: JSON.stringify({ action: 'remove' })
		})
	);
}
export async function getStory(id: string): Promise<Story> {
	const requestHeaders = await optionalHeaders();
	return parse(await fetch(`/api/stories/${encodeURIComponent(id)}`, { headers: requestHeaders }));
}
export async function getStoryBySlug(slug: string): Promise<Story> {
	const requestHeaders = await optionalHeaders();
	return parse(
		await fetch(`/api/stories/slug/${encodeURIComponent(slug)}`, { headers: requestHeaders })
	);
}
export async function queryStories(
	options: { cursor?: string; tag?: string } = {}
): Promise<StoryPage> {
	const query = new URLSearchParams();
	if (options.cursor) query.set('cursor', options.cursor);
	if (options.tag) query.set('tag', options.tag);
	const response = await fetch(`/api/stories?${query}`);
	const body = (await response.json().catch(() => ({}))) as {
		stories?: SerializedStory[];
		nextCursor?: string | null;
		message?: string;
	};
	if (!response.ok || !body.stories)
		throw new Error(
			body.message && body.message !== 'Internal Error' ? body.message : 'Không thể tải truyện.'
		);
	return { stories: body.stories.map(revive), nextCursor: body.nextCursor ?? null };
}
