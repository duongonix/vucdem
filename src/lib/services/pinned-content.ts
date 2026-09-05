import type { Post, Story } from '$lib/types';
import { Timestamp } from 'firebase/firestore';

type Serialized<T> = Omit<
	T,
	'createdAt' | 'updatedAt' | 'publishedAt' | 'pinnedAt' | 'submittedAt' | 'reviewedAt'
> & {
	createdAt: number;
	updatedAt: number;
	publishedAt: number | null;
	pinnedAt: number | null;
	submittedAt: number | null;
	reviewedAt: number | null;
};

function revive<T extends Post | Story>(value: Serialized<T>): T {
	return {
		...value,
		createdAt: Timestamp.fromMillis(value.createdAt),
		updatedAt: Timestamp.fromMillis(value.updatedAt),
		publishedAt: value.publishedAt === null ? null : Timestamp.fromMillis(value.publishedAt),
		pinnedAt: value.pinnedAt === null ? null : Timestamp.fromMillis(value.pinnedAt),
		submittedAt: value.submittedAt === null ? null : Timestamp.fromMillis(value.submittedAt),
		reviewedAt: value.reviewedAt === null ? null : Timestamp.fromMillis(value.reviewedAt)
	} as T;
}

export async function getPinnedContent(): Promise<{ posts: Post[]; stories: Story[] }> {
	const response = await fetch('/api/pinned-content');
	const body = (await response.json().catch(() => ({}))) as {
		posts?: Serialized<Post>[];
		stories?: Serialized<Story>[];
		message?: string;
	};
	if (!response.ok || !body.posts || !body.stories)
		throw new Error(body.message ?? 'Không thể tải nội dung được ghim.');
	return { posts: body.posts.map(revive), stories: body.stories.map(revive) };
}
