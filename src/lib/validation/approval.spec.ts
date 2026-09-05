import { describe, expect, it } from 'vitest';
import { approvalReviewSchema } from './approval';

describe('approvalReviewSchema', () => {
	it('requires a nonblank rejection reason', () => {
		expect(
			approvalReviewSchema.safeParse({
				kind: 'post',
				id: 'post-1',
				decision: 'rejected',
				reason: '   ',
				expectedSubmissionVersion: 1
			}).success
		).toBe(false);
	});

	it('requires a positive expected version and story context for chapters', () => {
		expect(
			approvalReviewSchema.safeParse({
				kind: 'chapter',
				id: 'chapter-1',
				decision: 'approved',
				reason: null,
				expectedSubmissionVersion: 0
			}).success
		).toBe(false);
	});

	it('accepts a version-bound approval', () => {
		expect(
			approvalReviewSchema.safeParse({
				kind: 'chapter',
				id: 'chapter-1',
				storyId: 'story-1',
				decision: 'approved',
				reason: null,
				expectedSubmissionVersion: 2
			}).success
		).toBe(true);
	});
});
