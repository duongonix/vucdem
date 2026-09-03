const MAX_TAG_LENGTH = 24;

export interface RankedTag {
	id: string;
	name: string;
	count: number;
}

function searchable(value: string) {
	return value
		.toLocaleLowerCase('vi-VN')
		.replaceAll('đ', 'd')
		.normalize('NFD')
		.replace(/[\u0300-\u036f]/g, '')
		.replace(/[^a-z0-9]+/g, '');
}

function editDistance(left: string, right: string) {
	const previous = Array.from({ length: right.length + 1 }, (_, index) => index);
	for (let leftIndex = 1; leftIndex <= left.length; leftIndex += 1) {
		const current = [leftIndex];
		for (let rightIndex = 1; rightIndex <= right.length; rightIndex += 1) {
			current[rightIndex] = Math.min(
				(current[rightIndex - 1] ?? 0) + 1,
				(previous[rightIndex] ?? 0) + 1,
				(previous[rightIndex - 1] ?? 0) + (left[leftIndex - 1] === right[rightIndex - 1] ? 0 : 1)
			);
		}
		previous.splice(0, previous.length, ...current);
	}
	return previous[right.length] ?? Number.POSITIVE_INFINITY;
}

function normalizeTag(value: unknown) {
	if (typeof value !== 'string') return null;
	const normalized = value.normalize('NFKC').trim().toLocaleLowerCase('vi-VN');
	return normalized && normalized.length <= MAX_TAG_LENGTH ? normalized : null;
}

export function suggestUsedTags(tagLists: unknown[], query: string, limit: number): RankedTag[] {
	const needle = searchable(query.trim());
	if (!needle) return [];
	return rankTrendingTags(tagLists, Number.MAX_SAFE_INTEGER)
		.map((tag) => {
			const candidate = searchable(tag.name);
			const distance = editDistance(candidate, needle);
			const relevance =
				candidate === needle
					? 0
					: candidate.startsWith(needle)
						? 1
						: candidate.includes(needle)
							? 2
							: distance <= 2
								? 3 + distance
								: Number.POSITIVE_INFINITY;
			return { tag, relevance };
		})
		.filter(({ relevance }) => Number.isFinite(relevance))
		.sort(
			(left, right) =>
				left.relevance - right.relevance ||
				right.tag.count - left.tag.count ||
				left.tag.name.localeCompare(right.tag.name, 'vi-VN')
		)
		.slice(0, Math.max(0, limit))
		.map(({ tag }) => tag);
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
