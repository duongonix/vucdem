import { z } from 'zod';

export const postCategoryIdSchema = z
	.string()
	.trim()
	.min(2, 'Mã danh mục cần ít nhất 2 ký tự.')
	.max(80)
	.regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Mã chỉ gồm chữ thường, số và dấu gạch ngang.');

export const postCategoryInputSchema = z
	.object({
		id: postCategoryIdSchema,
		name: z.string().trim().min(2, 'Tên danh mục cần ít nhất 2 ký tự.').max(80),
		description: z.string().trim().max(240).default(''),
		order: z.number().int().min(0).max(999).default(0),
		status: z.enum(['active', 'inactive']).default('active')
	})
	.strict();

export const postCategoryUpdateSchema = postCategoryInputSchema.omit({ id: true });
