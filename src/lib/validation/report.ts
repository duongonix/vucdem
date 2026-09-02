import { z } from 'zod';
export const REPORT_REASONS = ['spam', 'harassment', 'nsfw', 'stolen_content', 'other'] as const;
export const createReportSchema = z.object({
	targetType: z.enum(['post', 'story', 'comment']),
	targetId: z.string().min(1).max(128),
	reason: z.enum(REPORT_REASONS),
	explanation: z.string().trim().max(1000)
});
export type CreateReportInput = z.infer<typeof createReportSchema>;
