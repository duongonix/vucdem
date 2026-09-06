import { z } from 'zod';
import { audioAssetSchema } from './media';
import { interactiveStoryContentSchema } from './interactive-story';
import { assertSafeMarkdown, MARKDOWN_UNSUPPORTED_MESSAGE } from '$lib/markdown/safe-markdown';

export const CHAPTER_TITLE_MAX_LENGTH = 180;
export const CHAPTER_CONTENT_MAX_LENGTH = 200_000;

const base = z.object({
	id: z.string().trim().min(1).max(128).optional(),
	title: z.string().trim().min(1, 'Chương cần có tiêu đề.').max(CHAPTER_TITLE_MAX_LENGTH),
	status: z.enum(['draft', 'published'])
});
export const chapterInputSchema = z.discriminatedUnion('contentFormat', [
	base.extend({
		contentFormat: z.literal('text'),
		content: z
			.string()
			.trim()
			.min(1, 'Chương cần có nội dung.')
			.max(CHAPTER_CONTENT_MAX_LENGTH)
			.refine((value) => !assertSafeMarkdown(value), MARKDOWN_UNSUPPORTED_MESSAGE),
		audio: z.null().default(null)
	}),
	base.extend({
		contentFormat: z.literal('audio'),
		content: z.string().trim().max(CHAPTER_CONTENT_MAX_LENGTH).default(''),
		audio: audioAssetSchema
	}),
	base.extend({
		contentFormat: z.literal('interactive'),
		content: z.literal('').default(''),
		audio: z.null().default(null),
		interactive: interactiveStoryContentSchema
	})
]);

export function countWords(content: string): number {
	return content.trim() ? content.trim().split(/\s+/u).length : 0;
}

export type ChapterInput = z.infer<typeof chapterInputSchema>;
