import { describe, expect, it } from 'vitest';
import { rankTrendingTags } from './trending-tags';

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
});
