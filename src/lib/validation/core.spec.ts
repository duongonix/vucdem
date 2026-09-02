import { describe, expect, it } from 'vitest';
import { profileUpdateSchema, safeRedirect } from './test-exports';
import { createCommentSchema } from './comment';
import { postMutationSchema } from './post';

describe('central validation boundaries', () => {
	it('rejects an invalid profile and oversized comment', () => {
		expect(profileUpdateSchema.safeParse({ displayName: '', bio: '', avatar: null }).success).toBe(
			false
		);
		expect(
			createCommentSchema.safeParse({
				targetType: 'post',
				targetId: 'p',
				parentId: null,
				content: 'x'.repeat(5001)
			}).success
		).toBe(false);
	});

	it('normalizes post tags and rejects malformed category identifiers', () => {
		const valid = postMutationSchema.safeParse({
			title: 'Một tiêu đề đủ dài',
			content: 'Nội dung',
			category: 'mystery',
			tags: ['  Bí Ẩn  '],
			communityId: null,
			thumbnail: null,
			images: [],
			status: 'draft'
		});
		expect(valid.success).toBe(true);
		expect(
			postMutationSchema.safeParse({ ...(valid.success ? valid.data : {}), category: '' }).success
		).toBe(false);
	});

	it('rejects unsafe external redirects', () => {
		expect(safeRedirect('//evil.example')).toBe('/');
		expect(safeRedirect('/write?draft=1')).toBe('/write?draft=1');
	});
});
