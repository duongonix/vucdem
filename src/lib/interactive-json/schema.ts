import { z } from 'zod';
import {
	INTERACTIVE_DURATION_MAX_MS,
	INTERACTIVE_EVENT_MAX_COUNT
} from '$lib/validation/interactive-story';

export const INTERACTIVE_JSON_MAX_BYTES = 2 * 1024 * 1024;
export const INTERACTIVE_JSON_MAX_CHARACTERS = 24;

const referenceId = z
	.string()
	.trim()
	.min(1, 'ID không được để trống.')
	.max(64, 'ID không được vượt quá 64 ký tự.')
	.regex(/^[A-Za-z0-9_-]+$/, 'ID chỉ được chứa chữ cái, số, dấu gạch ngang và gạch dưới.');
const optionalEventId = referenceId.optional();
const httpsUrl = z
	.string()
	.url('URL không hợp lệ.')
	.refine((value) => new URL(value).protocol === 'https:', 'Media chỉ hỗ trợ URL HTTPS.');
const media = z
	.object({
		url: httpsUrl,
		publicId: z.string().trim().startsWith('vucdem/').max(512).optional(),
		duration: z.number().finite().nonnegative().optional()
	})
	.passthrough();

const event = z.discriminatedUnion('type', [
	z.object({
		id: optionalEventId,
		type: z.literal('message'),
		sender: referenceId,
		text: z.string().trim().min(1, 'Tin nhắn không được để trống.').max(2_000)
	}),
	z.object({
		id: optionalEventId,
		type: z.literal('choice'),
		prompt: z.string().trim().max(240).optional(),
		options: z
			.array(z.string().trim().min(1, 'Lựa chọn không được để trống.').max(300))
			.min(2, 'Lựa chọn cần từ 2 đến 4 phương án.')
			.max(4, 'Lựa chọn cần từ 2 đến 4 phương án.')
	}),
	z.object({
		id: optionalEventId,
		type: z.literal('system'),
		text: z.string().trim().min(1, 'Nội dung system không được để trống.').max(1_000)
	}),
	z.object({
		id: optionalEventId,
		type: z.literal('typing'),
		character: referenceId,
		duration: z.number().int().min(250).max(INTERACTIVE_DURATION_MAX_MS)
	}),
	z.object({
		id: optionalEventId,
		type: z.literal('delay'),
		duration: z.number().int().min(250).max(INTERACTIVE_DURATION_MAX_MS)
	}),
	z.object({
		id: optionalEventId,
		type: z.literal('image'),
		sender: referenceId,
		image: media,
		caption: z.string().trim().max(500).optional()
	}),
	z.object({
		id: optionalEventId,
		type: z.literal('audio'),
		sender: referenceId,
		audio: media
	})
]);

export const interactiveStoryJsonV1Schema = z
	.object({
		version: z.literal(1),
		conversation: z
			.object({ title: z.string().trim().max(100).optional() })
			.passthrough()
			.optional(),
		characters: z
			.array(
				z
					.object({
						id: referenceId,
						name: z.string().trim().min(1, 'Tên nhân vật không được để trống.').max(48),
						role: z.enum(['player', 'character']),
						avatar: media.nullable().optional()
					})
					.passthrough()
			)
			.min(1, 'Cần ít nhất một nhân vật.')
			.max(INTERACTIVE_JSON_MAX_CHARACTERS),
		events: z
			.array(event)
			.min(1, 'Kịch bản cần ít nhất một sự kiện.')
			.max(INTERACTIVE_EVENT_MAX_COUNT)
	})
	.passthrough();
