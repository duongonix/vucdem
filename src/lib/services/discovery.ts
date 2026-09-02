export interface TrendingTopic {
	id: string;
	name: string;
	count: number;
}

export interface TopAuthor {
	id: string;
	username: string;
	displayName: string;
	avatarUrl: string | null;
	followersCount: number;
	verify: boolean;
}

export async function getSidebarDiscovery(): Promise<{
	topics: TrendingTopic[];
	authors: TopAuthor[];
	topicsFailed: boolean;
	authorsFailed: boolean;
}> {
	const response = await fetch('/api/discovery/sidebar');
	const body = (await response.json().catch(() => ({}))) as {
		topics?: TrendingTopic[];
		authors?: TopAuthor[];
		topicsFailed?: boolean;
		authorsFailed?: boolean;
		message?: string;
	};
	if (!response.ok || !body.topics || !body.authors)
		throw new Error(body.message ?? 'Không thể tải nội dung khám phá.');
	return {
		topics: body.topics,
		authors: body.authors,
		topicsFailed: body.topicsFailed === true,
		authorsFailed: body.authorsFailed === true
	};
}
