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
}
export interface SearchResults {
	users: SearchUser[];
	posts: SearchContent[];
	stories: SearchContent[];
}
export async function search(q: string): Promise<SearchResults> {
	let r: Response;
	try {
		r = await fetch(`/api/search?q=${encodeURIComponent(q)}`, {
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
