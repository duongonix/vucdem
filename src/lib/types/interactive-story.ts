import type { AudioAsset, CloudinaryAsset } from './media';

export type InteractiveCharacterRole = 'player' | 'character';
export interface InteractiveCharacter {
	id: string;
	name: string;
	avatar: CloudinaryAsset | null;
	role: InteractiveCharacterRole;
}
interface InteractiveEventBase {
	id: string;
	order: number;
}
export interface InteractiveMessageEvent extends InteractiveEventBase {
	type: 'message';
	senderId: string;
	content: string;
}
export interface InteractiveChoiceEvent extends InteractiveEventBase {
	type: 'choice';
	prompt: string;
	options: { id: string; text: string }[];
}
export interface InteractiveSystemEvent extends InteractiveEventBase {
	type: 'system';
	content: string;
}
export interface InteractiveTypingEvent extends InteractiveEventBase {
	type: 'typing';
	characterId: string;
	durationMs: number;
}
export interface InteractiveDelayEvent extends InteractiveEventBase {
	type: 'delay';
	durationMs: number;
}
export interface InteractiveImageEvent extends InteractiveEventBase {
	type: 'image';
	senderId: string;
	image: CloudinaryAsset;
	caption: string;
}
export interface InteractiveAudioEvent extends InteractiveEventBase {
	type: 'audio';
	senderId: string;
	audio: AudioAsset;
}
export type InteractiveStoryEvent =
	| InteractiveMessageEvent
	| InteractiveChoiceEvent
	| InteractiveSystemEvent
	| InteractiveTypingEvent
	| InteractiveDelayEvent
	| InteractiveImageEvent
	| InteractiveAudioEvent;
export interface InteractiveStoryContent {
	conversationType: 'direct' | 'group';
	conversationTitle: string;
	conversationCharacterId: string | null;
	characters: InteractiveCharacter[];
	events: InteractiveStoryEvent[];
}

export function createInteractiveId(prefix: string): string {
	return `${prefix}_${crypto.randomUUID()}`;
}
export function createEmptyInteractiveContent(): InteractiveStoryContent {
	return {
		conversationType: 'direct',
		conversationTitle: '',
		conversationCharacterId: null,
		characters: [
			{ id: createInteractiveId('character'), name: 'Bạn', avatar: null, role: 'player' }
		],
		events: []
	};
}
