import type { InteractiveStoryContent, InteractiveStoryEvent } from '$lib/types';
import { createInteractiveId } from '$lib/types/interactive-story';
import type {
	InteractiveJsonIssue,
	InteractiveJsonParseResult,
	InteractiveJsonSummary,
	InteractiveStoryJsonV1
} from './types';
import { interactiveStoryJsonV1Schema } from './schema';

interface ImportContext {
	storyId: string;
	chapterId: string;
	fallbackTitle?: string;
}

function issue(path: (PropertyKey | undefined)[], message: string): InteractiveJsonIssue {
	return { path: path.filter((part) => part !== undefined).join('.'), message };
}

function managedMediaError(
	value: { url: string; publicId?: string },
	path: string,
	prefix: string
): InteractiveJsonIssue | null {
	if (!value.publicId)
		return {
			path,
			message: 'Media nhập từ JSON phải là asset Cloudinary đã tải lên bởi chính truyện này.'
		};
	if (!value.publicId.startsWith(prefix))
		return { path, message: 'Media không thuộc đúng truyện hoặc chương hiện tại.' };
	if (!/^https:\/\/res\.cloudinary\.com\//i.test(value.url))
		return { path: `${path}.url`, message: 'Media được quản lý phải dùng URL Cloudinary HTTPS.' };
	return null;
}

function semanticErrors(json: InteractiveStoryJsonV1, context: ImportContext) {
	const errors: InteractiveJsonIssue[] = [];
	const characterIds = new Set<string>();
	for (const [index, character] of json.characters.entries()) {
		if (characterIds.has(character.id))
			errors.push({
				path: `characters.${index}.id`,
				message: `ID nhân vật bị trùng: “${character.id}”.`
			});
		characterIds.add(character.id);
		if (character.avatar) {
			const mediaError = managedMediaError(
				character.avatar,
				`characters.${index}.avatar`,
				`vucdem/stories/${context.storyId}/characters/`
			);
			if (mediaError) errors.push(mediaError);
		}
	}
	const players = json.characters.filter((character) => character.role === 'player').length;
	if (players !== 1)
		errors.push({
			path: 'characters',
			message: players === 0 ? 'Kịch bản cần đúng một Player.' : 'Kịch bản chỉ được có một Player.'
		});
	const eventIds = new Set<string>();
	for (const [index, event] of json.events.entries()) {
		if (event.id) {
			if (eventIds.has(event.id))
				errors.push({ path: `events.${index}.id`, message: `ID sự kiện bị trùng: “${event.id}”.` });
			eventIds.add(event.id);
		}
		const character =
			event.type === 'typing' ? event.character : 'sender' in event ? event.sender : null;
		if (character && !characterIds.has(character))
			errors.push({
				path: `events.${index}.${event.type === 'typing' ? 'character' : 'sender'}`,
				message: `Không tìm thấy nhân vật “${character}”.`
			});
		if (event.type === 'image') {
			const mediaError = managedMediaError(
				event.image,
				`events.${index}.image`,
				`vucdem/stories/${context.storyId}/chapters/${context.chapterId}/interactive/`
			);
			if (mediaError) errors.push(mediaError);
		}
		if (event.type === 'audio') {
			const mediaError = managedMediaError(
				event.audio,
				`events.${index}.audio`,
				`vucdem/stories/${context.storyId}/chapters/${context.chapterId}/interactive/`
			);
			if (mediaError) errors.push(mediaError);
		}
	}
	return errors;
}

function normalize(json: InteractiveStoryJsonV1, fallbackTitle = ''): InteractiveStoryContent {
	const conversationTitle = json.conversation?.title?.trim() ?? '';
	const firstContact =
		json.characters.find((character) => character.role === 'character')?.id ?? null;
	const events: InteractiveStoryEvent[] = json.events.map((event, order) => {
		const id = event.id ?? createInteractiveId('event');
		switch (event.type) {
			case 'message':
				return { id, order, type: event.type, senderId: event.sender, content: event.text };
			case 'choice':
				return {
					id,
					order,
					type: event.type,
					prompt: event.prompt ?? 'Bạn sẽ trả lời thế nào?',
					options: event.options.map((text) => ({ id: createInteractiveId('option'), text }))
				};
			case 'system':
				return { id, order, type: event.type, content: event.text };
			case 'typing':
				return {
					id,
					order,
					type: event.type,
					characterId: event.character,
					durationMs: event.duration
				};
			case 'delay':
				return { id, order, type: event.type, durationMs: event.duration };
			case 'image':
				return {
					id,
					order,
					type: event.type,
					senderId: event.sender,
					image: { url: event.image.url, publicId: event.image.publicId! },
					caption: event.caption ?? ''
				};
			case 'audio':
				return {
					id,
					order,
					type: event.type,
					senderId: event.sender,
					audio: {
						url: event.audio.url,
						publicId: event.audio.publicId!,
						duration: event.audio.duration ?? null,
						format: null,
						bytes: null
					}
				};
		}
	});
	return {
		conversationType: conversationTitle ? 'group' : 'direct',
		conversationTitle: conversationTitle || fallbackTitle,
		conversationCharacterId: conversationTitle ? null : firstContact,
		characters: json.characters.map((character) => ({
			id: character.id,
			name: character.name,
			role: character.role,
			avatar: character.avatar
				? { url: character.avatar.url, publicId: character.avatar.publicId! }
				: null
		})),
		events
	};
}

function summary(json: InteractiveStoryJsonV1): InteractiveJsonSummary {
	const counts: InteractiveJsonSummary['counts'] = {};
	for (const event of json.events) counts[event.type] = (counts[event.type] ?? 0) + 1;
	return { characters: json.characters.length, events: json.events.length, counts };
}

export function parseInteractiveJson(
	raw: string,
	context: ImportContext
): InteractiveJsonParseResult {
	let unknownValue: unknown;
	try {
		unknownValue = JSON.parse(raw);
	} catch (cause) {
		return {
			success: false,
			errors: [
				{
					path: '',
					message: `JSON không hợp lệ.${cause instanceof SyntaxError ? ` ${cause.message}` : ''}`
				}
			]
		};
	}
	if (!unknownValue || typeof unknownValue !== 'object' || !('version' in unknownValue))
		return {
			success: false,
			errors: [{ path: 'version', message: 'JSON V1 bắt buộc phải có version: 1.' }]
		};
	if ('version' in unknownValue && (unknownValue as { version?: unknown }).version !== 1)
		return {
			success: false,
			errors: [
				{
					path: 'version',
					message: 'Phiên bản JSON này chưa được hỗ trợ. Hiện chỉ hỗ trợ version 1.'
				}
			]
		};
	const rawEvents = (unknownValue as { events?: unknown }).events;
	if (Array.isArray(rawEvents)) {
		const supported = new Set(['message', 'choice', 'system', 'typing', 'delay', 'image', 'audio']);
		const unknownEvents = rawEvents.flatMap((event, index) => {
			if (!event || typeof event !== 'object') return [];
			const type = (event as { type?: unknown }).type;
			return typeof type === 'string' && !supported.has(type)
				? [{ path: `events.${index}.type`, message: `Loại sự kiện “${type}” chưa được hỗ trợ.` }]
				: [];
		});
		if (unknownEvents.length) return { success: false, errors: unknownEvents };
	}
	const parsed = interactiveStoryJsonV1Schema.safeParse(unknownValue);
	if (!parsed.success)
		return {
			success: false,
			errors: parsed.error.issues.map((value) => issue(value.path, value.message))
		};
	const errors = semanticErrors(parsed.data, context);
	if (errors.length) return { success: false, errors };
	const warnings = parsed.data.events.flatMap((event, index) =>
		(event.type === 'typing' || event.type === 'delay') && event.duration >= 8_000
			? [
					{
						path: `events.${index}.duration`,
						message: 'Thời gian chờ dài có thể làm trải nghiệm đọc chậm.'
					}
				]
			: []
	);
	return {
		success: true,
		json: parsed.data,
		content: normalize(parsed.data, context.fallbackTitle),
		warnings,
		summary: summary(parsed.data)
	};
}

export function serializeInteractiveJson(content: InteractiveStoryContent): InteractiveStoryJsonV1 {
	return {
		version: 1,
		...(content.conversationType === 'group' && content.conversationTitle
			? { conversation: { title: content.conversationTitle } }
			: {}),
		characters: content.characters.map((character) => ({
			id: character.id,
			name: character.name,
			role: character.role,
			...(character.avatar ? { avatar: character.avatar } : {})
		})),
		events: [...content.events]
			.sort((left, right) => left.order - right.order)
			.map((event) => {
				switch (event.type) {
					case 'message':
						return { id: event.id, type: event.type, sender: event.senderId, text: event.content };
					case 'choice':
						return {
							id: event.id,
							type: event.type,
							...(event.prompt ? { prompt: event.prompt } : {}),
							options: event.options.map((option) => option.text)
						};
					case 'system':
						return { id: event.id, type: event.type, text: event.content };
					case 'typing':
						return {
							id: event.id,
							type: event.type,
							character: event.characterId,
							duration: event.durationMs
						};
					case 'delay':
						return { id: event.id, type: event.type, duration: event.durationMs };
					case 'image':
						return {
							id: event.id,
							type: event.type,
							sender: event.senderId,
							image: event.image,
							...(event.caption ? { caption: event.caption } : {})
						};
					case 'audio':
						return {
							id: event.id,
							type: event.type,
							sender: event.senderId,
							audio: {
								url: event.audio.url,
								publicId: event.audio.publicId,
								...(event.audio.duration !== null ? { duration: event.audio.duration } : {})
							}
						};
				}
			})
	};
}

export function interactiveJsonText(content: InteractiveStoryContent): string {
	return JSON.stringify(serializeInteractiveJson(content), null, 2);
}
