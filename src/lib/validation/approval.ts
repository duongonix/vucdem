import { z } from 'zod';

export const approvalReviewSchema = z
	.object({
		kind: z.enum(['post', 'short_story', 'serial_story', 'chapter']),
		id: z.string().min(1).max(1500),
		storyId: z.string().min(1).max(1500).optional(),
		decision: z.enum(['approved', 'rejected']),
		reason: z.string().trim().max(2000).nullable().default(null),
		expectedSubmissionVersion: z.number().int().positive()
	})
	.strict()
	.superRefine((input, context) => {
		if (input.kind === 'chapter' && !input.storyId)
			context.addIssue({ code: 'custom', path: ['storyId'], message: 'Thiếu Story của chương.' });
		if (input.decision === 'rejected' && !input.reason)
			context.addIssue({ code: 'custom', path: ['reason'], message: 'Lý do từ chối là bắt buộc.' });
	});

export type ApprovalReviewInput = z.infer<typeof approvalReviewSchema>;
