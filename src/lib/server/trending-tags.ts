const MAX_TAG_LENGTH = 24;

export interface RankedTag {
	id: string;
	name: string;
	count: number;
}

function normalizeTag(value: unknown) {
	if (typeof value !== 'string') return null;
	const normalized = value.normalize('NFKC').trim().toLocaleLowerCase('vi-VN');
	return normalized && normalized.length <= MAX_TAG_LENGTH ? normalized : null;
}

export function rankTrendingTags(tagLists: unknown[], limit: number): RankedTag[] {
	const counts = new Map<string, number>();

	for (const value of tagLists) {
		if (!Array.isArray(value)) continue;
		const documentTags = new Set(
			value.map(normalizeTag).filter((tag): tag is string => Boolean(tag))
		);
		for (const tag of documentTags) counts.set(tag, (counts.get(tag) ?? 0) + 1);
	}

	return [...counts.entries()]
		.map(([name, count]) => ({ id: name, name, count }))
		.sort((left, right) => right.count - left.count || left.name.localeCompare(right.name, 'vi-VN'))
		.slice(0, Math.max(0, limit));
}
