import { describe, expect, it } from 'vitest';
import { rankTrendingTags, suggestUsedTags } from './trending-tags';

describe('rankTrendingTags', () => {
	it('combines normalized tags from posts and stories', () => {
		expect(
			rankTrendingTags([['Tâm Linh', 'bí ẩn'], [' tâm linh ', 'kinh dị'], ['BÍ ẨN']], 5)
		).toEqual([
			{ id: 'bí ẩn', name: 'bí ẩn', count: 2 },
			{ id: 'tâm linh', name: 'tâm linh', count: 2 },
			{ id: 'kinh dị', name: 'kinh dị', count: 1 }
		]);
	});

	it('counts a tag only once per content document and ignores invalid values', () => {
		expect(rankTrendingTags([['ma', 'MA', '', 4], null], 5)).toEqual([
			{ id: 'ma', name: 'ma', count: 1 }
		]);
	});

	it('suggests accent-insensitive and close tags before less relevant matches', () => {
		expect(
			suggestUsedTags([['bí mật', 'bí ẩn'], ['bí mật'], ['mật mã'], ['tâm linh']], 'bimat', 3)
		).toEqual([
			{ id: 'bí mật', name: 'bí mật', count: 2 },
			{ id: 'bí ẩn', name: 'bí ẩn', count: 1 }
		]);
	});
});
