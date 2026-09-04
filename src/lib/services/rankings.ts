import type { Story } from '$lib/types';
import { Timestamp } from 'firebase/firestore';

type SerializedStory = Omit<Story, 'createdAt' | 'updatedAt' | 'publishedAt'> & {
	createdAt: number;
	updatedAt: number;
	publishedAt: number | null;
};

function revive(story: SerializedStory): Story {
	return {
		...story,
		createdAt: Timestamp.fromMillis(story.createdAt),
		updatedAt: Timestamp.fromMillis(story.updatedAt),
		publishedAt: story.publishedAt === null ? null : Timestamp.fromMillis(story.publishedAt)
	};
}

export async function getStoryRankings(): Promise<{ short: Story[]; serial: Story[] }> {
	const response = await fetch('/api/ranks');
	const body = (await response.json().catch(() => ({}))) as {
		short?: SerializedStory[];
		serial?: SerializedStory[];
		message?: string;
	};
	if (!response.ok || !body.short || !body.serial)
		throw new Error(body.message ?? 'Không thể tải bảng xếp hạng.');
	return { short: body.short.map(revive), serial: body.serial.map(revive) };
}
