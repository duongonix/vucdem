import { z } from 'zod';
import { cloudinaryAssetSchema } from './media';

export const POST_TITLE_MAX_LENGTH = 180;
export const POST_CONTENT_MAX_LENGTH = 50_000;
export const POST_EXCERPT_LENGTH = 240;
export const POST_TAG_MAX_COUNT = 5;
export const POST_TAG_MAX_LENGTH = 24;

export const postCategorySchema = z.string().trim().min(1).max(80);

export function normalizeTag(value: string): string {
	return value.trim().replace(/\s+/g, ' ').toLocaleLowerCase('vi-VN');
}

export const postTagsSchema = z
	.array(z.string().trim().min(1).max(POST_TAG_MAX_LENGTH))
	.max(POST_TAG_MAX_COUNT)
	.transform((values) => [...new Set(values.map(normalizeTag))]);

export const postMutationSchema = z
	.object({
		title: z.string().trim().max(POST_TITLE_MAX_LENGTH),
		content: z.string().trim().max(POST_CONTENT_MAX_LENGTH),
		category: postCategorySchema,
		tags: postTagsSchema,
		communityId: z.string().trim().min(1).max(256).nullable(),
		thumbnail: cloudinaryAssetSchema.nullable(),
		images: z.array(cloudinaryAssetSchema).max(10),
		status: z.enum(['draft', 'published'])
	})
	.strict();

export const createPostSchema = postMutationSchema.extend({
	id: z.string().trim().min(1).max(1_500)
});

export type PostMutationInput = z.input<typeof postMutationSchema>;

export function validatePublishablePost(input: PostMutationInput): string[] {
	const errors: string[] = [];
	if (input.title.trim().length < 5) errors.push('Tiêu đề cần ít nhất 5 ký tự.');
	if (input.content.trim().length < 20) errors.push('Nội dung cần ít nhất 20 ký tự.');
	if (!input.category.trim()) errors.push('Danh mục không hợp lệ.');
	return errors;
}

export function generatePostExcerpt(content: string): string {
	const plain = content
		.replace(/[^\p{L}\p{N}\s]/gu, ' ')
		.replace(/\s+/g, ' ')
		.trim();
	return plain.length <= POST_EXCERPT_LENGTH
		? plain
		: `${plain.slice(0, POST_EXCERPT_LENGTH - 1).trimEnd()}…`;
}
