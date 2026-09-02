import { describe, expect, it } from 'vitest';
import { createReportSchema } from './report';

describe('createReportSchema', () => {
	it('accepts a supported report and trims its explanation', () => {
		const result = createReportSchema.parse({
			targetType: 'comment',
			targetId: 'comment-1',
			reason: 'harassment',
			explanation: '  Nội dung quấy rối  '
		});
		expect(result.explanation).toBe('Nội dung quấy rối');
	});

	it('rejects unsupported reasons and oversized explanations', () => {
		expect(() =>
			createReportSchema.parse({
				targetType: 'post',
				targetId: 'post-1',
				reason: 'copyright',
				explanation: 'x'.repeat(1001)
			})
		).toThrow();
	});
});
