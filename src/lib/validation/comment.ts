import { z } from 'zod';
export const COMMENT_MAX_LENGTH = 5_000;
export const createCommentSchema = z.object({
	targetType: z.enum(['post', 'story', 'chapter']),
	targetId: z.string().min(1).max(128),
	parentId: z.string().min(1).max(128).nullable().default(null),
	isSpoiler: z.boolean().default(false),
	content: z
		.string()
		.trim()
		.min(1, 'Bình luận không được để trống.')
		.max(COMMENT_MAX_LENGTH, 'Bình luận quá dài.')
});
export const updateCommentSchema = z.object({
	content: z
		.string()
		.trim()
		.min(1, 'Bình luận không được để trống.')
		.max(COMMENT_MAX_LENGTH, 'Bình luận quá dài.')
});
