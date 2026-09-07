export interface SearchUser {
	id: string;
	username: string;
	displayName: string;
	verify: boolean;
	avatar: { url: string; publicId: string } | null;
}
export interface SearchContent {
	id: string;
	slug?: string;
	title: string;
	excerpt?: string;
	description?: string;
	authorName: string;
	category?: string;
	tags?: string[];
	status?: string;
	format?: 'serial' | 'short';
	viewCount?: number;
	ratingAverage?: number;
}
export interface SearchResults {
	users: SearchUser[];
	posts: SearchContent[];
	stories: SearchContent[];
}
export type SearchContentType = 'all' | 'posts' | 'stories';
export type SearchSort = 'relevance' | 'newest' | 'viewed' | 'rating';
export type StorySearchStatus = 'all' | 'ongoing' | 'completed' | 'hiatus';
export type StorySearchFormat = 'all' | 'serial' | 'short';

export interface SearchOptions {
	contentType?: SearchContentType;
	category?: string;
	tag?: string;
	storyStatus?: StorySearchStatus;
	storyFormat?: StorySearchFormat;
	sort?: SearchSort;
}

export async function search(q: string, options: SearchOptions = {}): Promise<SearchResults> {
	const params = new URLSearchParams({ q });
	if (options.contentType && options.contentType !== 'all') params.set('type', options.contentType);
	if (options.category) params.set('category', options.category);
	if (options.tag) params.set('tag', options.tag);
	if (options.storyStatus && options.storyStatus !== 'all')
		params.set('storyStatus', options.storyStatus);
	if (options.storyFormat && options.storyFormat !== 'all')
		params.set('storyFormat', options.storyFormat);
	if (options.sort && options.sort !== 'relevance') params.set('sort', options.sort);
	let r: Response;
	try {
		r = await fetch(`/api/search?${params}`, {
			signal: AbortSignal.timeout(15_000)
		});
	} catch {
		throw new Error('Tìm kiếm mất quá nhiều thời gian. Vui lòng thử lại.');
	}
	const b = await r.json().catch(() => ({}));
	if (!r.ok)
		throw new Error(
			b.message && b.message !== 'Internal Error' ? b.message : 'Không thể tìm kiếm.'
		);
	return b as SearchResults;
}
