import { describe, expect, it } from 'vitest';
import type { InteractiveStoryContent } from '$lib/types';
import { interactiveJsonText, parseInteractiveJson, serializeInteractiveJson } from './converter';

const context = { storyId: 'story-1', chapterId: 'chapter-1', fallbackTitle: 'Đêm thứ nhất' };
const valid = {
	version: 1,
	characters: [
		{ id: 'player', name: 'Bạn', role: 'player' },
		{ id: 'linh', name: 'Linh', role: 'character' }
	],
	events: [
		{ type: 'message', sender: 'linh', text: 'Đừng mở cửa.' },
		{ type: 'typing', character: 'linh', duration: 2_000 },
		{ type: 'choice', options: ['Ai đấy?', 'Tôi sẽ gọi cảnh sát.'] }
	]
};

describe('interactive JSON V1', () => {
	it('parses and normalizes a valid portable document', () => {
		const result = parseInteractiveJson(JSON.stringify(valid), context);
		expect(result.success).toBe(true);
		if (!result.success) return;
		expect(result.content.events.map((event) => event.type)).toEqual([
			'message',
			'typing',
			'choice'
		]);
		expect(result.summary).toMatchObject({ characters: 2, events: 3 });
	});

	it.each([
		['invalid syntax', '{"version":'],
		['unsupported version', JSON.stringify({ ...valid, version: 2 })],
		['missing player', JSON.stringify({ ...valid, characters: [valid.characters[1]] })],
		[
			'multiple players',
			JSON.stringify({
				...valid,
				characters: [...valid.characters, { id: 'player-2', name: 'Tôi', role: 'player' }]
			})
		],
		[
			'duplicate character id',
			JSON.stringify({
				...valid,
				characters: [...valid.characters, { id: 'linh', name: 'Khác', role: 'character' }]
			})
		],
		[
			'unknown sender',
			JSON.stringify({ ...valid, events: [{ type: 'message', sender: 'ghost', text: '...' }] })
		],
		[
			'empty message',
			JSON.stringify({ ...valid, events: [{ type: 'message', sender: 'linh', text: ' ' }] })
		],
		[
			'too few choices',
			JSON.stringify({ ...valid, events: [{ type: 'choice', options: ['Một'] }] })
		],
		[
			'too many choices',
			JSON.stringify({ ...valid, events: [{ type: 'choice', options: ['1', '2', '3', '4', '5'] }] })
		],
		['invalid duration', JSON.stringify({ ...valid, events: [{ type: 'delay', duration: 0 }] })],
		[
			'duplicate event id',
			JSON.stringify({
				...valid,
				events: [
					{ id: 'same', type: 'message', sender: 'linh', text: 'Một' },
					{ id: 'same', type: 'message', sender: 'linh', text: 'Hai' }
				]
			})
		],
		['unknown event', JSON.stringify({ ...valid, events: [{ type: 'call', text: 'Alo' }] })],
		[
			'unsafe image URL',
			JSON.stringify({
				...valid,
				events: [{ type: 'image', sender: 'linh', image: { url: 'javascript:alert(1)' } }]
			})
		],
		[
			'unsafe audio URL',
			JSON.stringify({
				...valid,
				events: [{ type: 'audio', sender: 'linh', audio: { url: 'file:///voice.mp3' } }]
			})
		]
	])('rejects %s', (_name, raw) => {
		expect(parseInteractiveJson(raw, context).success).toBe(false);
	});

	it('accepts managed image and audio assets owned by the current chapter', () => {
		const prefix = 'vucdem/stories/story-1/chapters/chapter-1/interactive';
		const result = parseInteractiveJson(
			JSON.stringify({
				...valid,
				events: [
					{
						type: 'image',
						sender: 'linh',
						image: {
							url: 'https://res.cloudinary.com/demo/image/upload/a.jpg',
							publicId: `${prefix}/event-1/image`
						}
					},
					{
						type: 'audio',
						sender: 'linh',
						audio: {
							url: 'https://res.cloudinary.com/demo/video/upload/a.mp3',
							publicId: `${prefix}/event-2/audio`,
							duration: 8.4
						}
					}
				]
			}),
			context
		);
		expect(result.success).toBe(true);
	});

	it('rejects an otherwise valid external asset without trusted ownership metadata', () => {
		const result = parseInteractiveJson(
			JSON.stringify({
				...valid,
				events: [{ type: 'image', sender: 'linh', image: { url: 'https://example.com/a.jpg' } }]
			}),
			context
		);
		expect(result.success).toBe(false);
	});

	it('rejects a timeline larger than the domain persistence limit', () => {
		const events = Array.from({ length: 451 }, (_, index) => ({
			type: 'message',
			sender: 'linh',
			text: `Tin nhắn ${index}`
		}));
		expect(parseInteractiveJson(JSON.stringify({ ...valid, events }), context).success).toBe(false);
	});

	it('round-trips all event types without trusted Story metadata', () => {
		const content: InteractiveStoryContent = {
			conversationType: 'group',
			conversationTitle: 'Phòng 404',
			conversationCharacterId: null,
			characters: [
				{ id: 'player', name: 'Bạn', role: 'player', avatar: null },
				{ id: 'linh', name: 'Linh', role: 'character', avatar: null }
			],
			events: [
				{ id: 'm1', order: 0, type: 'message', senderId: 'linh', content: 'Mày ở đâu?' },
				{ id: 's1', order: 1, type: 'system', content: '03:33' },
				{ id: 't1', order: 2, type: 'typing', characterId: 'linh', durationMs: 2_000 },
				{ id: 'd1', order: 3, type: 'delay', durationMs: 1_000 },
				{
					id: 'c1',
					order: 4,
					type: 'choice',
					prompt: 'Trả lời?',
					options: [
						{ id: 'a', text: 'Có' },
						{ id: 'b', text: 'Không' }
					]
				}
			]
		};
		const exported = serializeInteractiveJson(content);
		expect(exported).not.toHaveProperty('authorId');
		const imported = parseInteractiveJson(interactiveJsonText(content), context);
		expect(imported.success).toBe(true);
		if (!imported.success) return;
		expect(imported.content.events.map(({ type }) => type)).toEqual(
			content.events.map(({ type }) => type)
		);
		expect(imported.content.characters.map(({ id, name, role }) => ({ id, name, role }))).toEqual(
			content.characters.map(({ id, name, role }) => ({ id, name, role }))
		);
	});
});
