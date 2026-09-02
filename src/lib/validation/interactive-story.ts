import { z } from 'zod';
import { audioAssetSchema, cloudinaryAssetSchema } from './media';
export const INTERACTIVE_EVENT_MAX_COUNT = 450;
export const INTERACTIVE_DURATION_MAX_MS = 10_000;
const id = z.string().trim().min(1).max(128);
const base = { id, order: z.number().int().min(0).max(INTERACTIVE_EVENT_MAX_COUNT) };
const event = z.discriminatedUnion('type', [
	z.object({
		...base,
		type: z.literal('message'),
		senderId: id,
		content: z.string().trim().min(1).max(2_000)
	}),
	z.object({
		...base,
		type: z.literal('choice'),
		prompt: z.string().trim().max(240).default('Bạn sẽ trả lời thế nào?'),
		options: z
			.array(z.object({ id, text: z.string().trim().min(1).max(300) }))
			.min(2)
			.max(4)
	}),
	z.object({ ...base, type: z.literal('system'), content: z.string().trim().min(1).max(1_000) }),
	z.object({
		...base,
		type: z.literal('typing'),
		characterId: id,
		durationMs: z.number().int().min(250).max(INTERACTIVE_DURATION_MAX_MS)
	}),
	z.object({
		...base,
		type: z.literal('delay'),
		durationMs: z.number().int().min(250).max(INTERACTIVE_DURATION_MAX_MS)
	}),
	z.object({
		...base,
		type: z.literal('image'),
		senderId: id,
		image: cloudinaryAssetSchema,
		caption: z.string().trim().max(500).default('')
	}),
	z.object({ ...base, type: z.literal('audio'), senderId: id, audio: audioAssetSchema })
]);
export const interactiveStoryContentSchema = z
	.object({
		conversationType: z.enum(['direct', 'group']).default('direct'),
		conversationTitle: z.string().trim().max(100).default(''),
		conversationCharacterId: id.nullable().default(null),
		characters: z
			.array(
				z.object({
					id,
					name: z.string().trim().min(1).max(48),
					avatar: cloudinaryAssetSchema.nullable(),
					role: z.enum(['player', 'character'])
				})
			)
			.min(1)
			.max(24),
		events: z
			.array(event)
			.min(1, 'Kịch bản cần ít nhất một sự kiện.')
			.max(INTERACTIVE_EVENT_MAX_COUNT)
	})
	.superRefine((content, context) => {
		if (content.characters.filter((item) => item.role === 'player').length !== 1)
			context.addIssue({
				code: 'custom',
				path: ['characters'],
				message: 'Kịch bản cần đúng một nhân vật người đọc.'
			});
		const characterIds = new Set(content.characters.map((item) => item.id));
		if (
			content.conversationType === 'direct' &&
			content.conversationCharacterId &&
			!characterIds.has(content.conversationCharacterId)
		)
			context.addIssue({
				code: 'custom',
				path: ['conversationCharacterId'],
				message: 'Nhân vật trên header không tồn tại.'
			});
		if (content.conversationType === 'group' && !content.conversationTitle)
			context.addIssue({
				code: 'custom',
				path: ['conversationTitle'],
				message: 'Nhóm trò chuyện cần có tên.'
			});
		const eventIds = new Set<string>();
		for (const [index, item] of content.events.entries()) {
			if (eventIds.has(item.id))
				context.addIssue({
					code: 'custom',
					path: ['events', index, 'id'],
					message: 'ID sự kiện bị trùng.'
				});
			eventIds.add(item.id);
			const senderId =
				'senderId' in item ? item.senderId : item.type === 'typing' ? item.characterId : null;
			if (senderId && !characterIds.has(senderId))
				context.addIssue({
					code: 'custom',
					path: ['events', index],
					message: 'Sự kiện tham chiếu nhân vật không tồn tại.'
				});
		}
	});
export type InteractiveStoryContentInput = z.infer<typeof interactiveStoryContentSchema>;
