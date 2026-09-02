import { describe, expect, it } from 'vitest';
import { interactiveStoryContentSchema } from './interactive-story';

const player = { id: 'player', name: 'Bạn', avatar: null, role: 'player' as const };
const linh = { id: 'linh', name: 'Linh', avatar: null, role: 'character' as const };

describe('interactiveStoryContentSchema', () => {
	it('accepts a valid ordered conversation', () => {
		const result = interactiveStoryContentSchema.safeParse({
			conversationTitle: 'Ký túc xá 404',
			characters: [player, linh],
			events: [
				{ id: 'one', order: 0, type: 'message', senderId: 'linh', content: 'Đừng mở cửa.' },
				{
					id: 'two',
					order: 1,
					type: 'choice',
					prompt: 'Bạn trả lời?',
					options: [
						{ id: 'a', text: 'Tại sao?' },
						{ id: 'b', text: 'Được.' }
					]
				}
			]
		});
		expect(result.success).toBe(true);
	});

	it('requires exactly one player and valid character references', () => {
		const result = interactiveStoryContentSchema.safeParse({
			conversationTitle: '',
			characters: [linh],
			events: [{ id: 'one', order: 0, type: 'message', senderId: 'missing', content: 'Ai đó?' }]
		});
		expect(result.success).toBe(false);
	});

	it('requires between two and four non-empty choices', () => {
		const result = interactiveStoryContentSchema.safeParse({
			conversationTitle: '',
			characters: [player],
			events: [
				{ id: 'choice', order: 0, type: 'choice', prompt: '', options: [{ id: 'a', text: 'Một' }] }
			]
		});
		expect(result.success).toBe(false);
	});

	it('clamps authored waiting time through validation', () => {
		const result = interactiveStoryContentSchema.safeParse({
			conversationTitle: '',
			characters: [player],
			events: [{ id: 'delay', order: 0, type: 'delay', durationMs: 60_000 }]
		});
		expect(result.success).toBe(false);
	});
});
