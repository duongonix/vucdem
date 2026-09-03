export interface TagSuggestion {
	id: string;
	name: string;
	count: number;
}

export async function getTagSuggestions(
	query: string,
	signal?: AbortSignal
): Promise<TagSuggestion[]> {
	const response = await fetch(`/api/tags/suggestions?q=${encodeURIComponent(query)}`, { signal });
	const body = (await response.json().catch(() => ({}))) as {
		tags?: TagSuggestion[];
		message?: string;
	};
	if (!response.ok || !body.tags) throw new Error(body.message ?? 'Không thể tải gợi ý tag.');
	return body.tags;
}
