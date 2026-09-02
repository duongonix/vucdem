import { getFirebaseAuth } from '$lib/firebase/auth';

export interface StoryRatingState {
	value: number;
	average: number;
	count: number;
}

async function request(storyId: string, value?: number): Promise<StoryRatingState> {
	const user = getFirebaseAuth().currentUser;
	const response = await fetch(`/api/stories/${encodeURIComponent(storyId)}/rating`, {
		method: value === undefined ? 'GET' : 'PUT',
		headers: {
			...(user ? { authorization: `Bearer ${await user.getIdToken()}` } : {}),
			...(value === undefined ? {} : { 'content-type': 'application/json' })
		},
		body: value === undefined ? undefined : JSON.stringify({ value })
	});
	const body = (await response.json().catch(() => ({}))) as Partial<StoryRatingState> & {
		message?: string;
	};
	if (!response.ok) throw new Error(body.message ?? 'Không thể cập nhật đánh giá truyện.');
	return {
		value: Number(body.value ?? 0),
		average: Number(body.average ?? 0),
		count: Number(body.count ?? 0)
	};
}

export const getStoryRating = (storyId: string) => request(storyId);
export const rateStory = (storyId: string, value: number) => request(storyId, value);
