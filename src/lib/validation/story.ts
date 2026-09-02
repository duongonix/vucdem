import { audioAssetSchema, cloudinaryAssetSchema } from '$lib/validation/media';
import { z } from 'zod';
import { CHAPTER_CONTENT_MAX_LENGTH } from '$lib/validation/chapter';
import { interactiveStoryContentSchema } from './interactive-story';
export const STORY_TITLE_MAX_LENGTH = 180;
export const STORY_DESCRIPTION_MAX_LENGTH = 2_000;
export const STORY_TAG_MAX_COUNT = 8;
export const STORY_TAG_MAX_LENGTH = 24;
const tags = z
	.array(z.string().trim().min(1).max(STORY_TAG_MAX_LENGTH))
	.max(STORY_TAG_MAX_COUNT)
	.transform((values) => [...new Set(values.map((value) => value.toLocaleLowerCase('vi-VN')))]);
export const storyMetadataSchema = z.object({
	title: z.string().trim().max(STORY_TITLE_MAX_LENGTH),
	description: z.string().trim().max(STORY_DESCRIPTION_MAX_LENGTH),
	cover: cloudinaryAssetSchema.nullable(),
	tags,
	status: z.enum(['draft', 'ongoing', 'completed', 'hiatus'])
});
const createStoryBase = storyMetadataSchema
	.pick({ title: true, description: true, cover: true, tags: true })
	.extend({ id: z.string().min(1).max(128) });
export const createStorySchema = z.union([
	createStoryBase.extend({
		format: z.literal('serial'),
		contentFormat: z.enum(['text', 'audio', 'interactive']).default('text')
	}),
	createStoryBase.extend({
		format: z.literal('short'),
		contentFormat: z.literal('text').default('text'),
		shortContent: z
			.string()
			.trim()
			.min(1, 'Truyện ngắn cần có nội dung.')
			.max(CHAPTER_CONTENT_MAX_LENGTH),
		shortAudio: z.null().optional()
	}),
	createStoryBase.extend({
		format: z.literal('short'),
		contentFormat: z.literal('audio'),
		shortContent: z.string().trim().max(CHAPTER_CONTENT_MAX_LENGTH).default(''),
		shortAudio: audioAssetSchema
	}),
	createStoryBase.extend({
		format: z.literal('short'),
		contentFormat: z.literal('interactive'),
		shortContent: z.literal('').default(''),
		shortAudio: z.null().default(null),
		interactive: interactiveStoryContentSchema
	})
]);
export type StoryMetadataInput = z.infer<typeof storyMetadataSchema>;
export type CreateStoryInput = z.infer<typeof createStorySchema>;
export function validatePublishableStory(
	input: Pick<StoryMetadataInput, 'title' | 'description' | 'cover'>,
	chapterCount: number
): string[] {
	const issues: string[] = [];
	if (input.title.length < 5) issues.push('Tiêu đề truyện cần ít nhất 5 ký tự.');
	if (input.description.length < 20) issues.push('Mô tả truyện cần ít nhất 20 ký tự.');
	if (!input.cover) issues.push('Truyện cần ảnh bìa trước khi xuất bản.');
	if (chapterCount < 1) issues.push('Truyện cần ít nhất một chương trước khi xuất bản.');
	return issues;
}
export function storySlug(title: string): string {
	const normalized = title
		.trim()
		.toLocaleLowerCase('vi-VN')
		.replaceAll('đ', 'd')
		.normalize('NFD')
		.replace(/[\u0300-\u036f]/g, '')
		.replace(/[^a-z0-9]+/g, '-')
		.replace(/^-+|-+$/g, '')
		.slice(0, 72)
		.replace(/-+$/g, '');
	return normalized || 'truyen-khong-ten';
}
