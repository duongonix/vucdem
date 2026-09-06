import type { InteractiveStoryContent } from '$lib/types';

export interface InteractiveJsonMedia {
	url: string;
	publicId?: string;
	duration?: number;
}

export interface InteractiveJsonCharacter {
	id: string;
	name: string;
	role: 'player' | 'character';
	avatar?: InteractiveJsonMedia | null;
}

export type InteractiveJsonEvent =
	| { id?: string; type: 'message'; sender: string; text: string }
	| { id?: string; type: 'choice'; prompt?: string; options: string[] }
	| { id?: string; type: 'system'; text: string }
	| { id?: string; type: 'typing'; character: string; duration: number }
	| { id?: string; type: 'delay'; duration: number }
	| {
			id?: string;
			type: 'image';
			sender: string;
			image: InteractiveJsonMedia;
			caption?: string;
	  }
	| { id?: string; type: 'audio'; sender: string; audio: InteractiveJsonMedia };

export interface InteractiveStoryJsonV1 {
	version: 1;
	conversation?: { title?: string };
	characters: InteractiveJsonCharacter[];
	events: InteractiveJsonEvent[];
}

export interface InteractiveJsonIssue {
	path: string;
	message: string;
}

export interface InteractiveJsonSummary {
	characters: number;
	events: number;
	counts: Partial<Record<InteractiveJsonEvent['type'], number>>;
}

export type InteractiveJsonParseResult =
	| {
			success: true;
			json: InteractiveStoryJsonV1;
			content: InteractiveStoryContent;
			warnings: InteractiveJsonIssue[];
			summary: InteractiveJsonSummary;
	  }
	| { success: false; errors: InteractiveJsonIssue[] };
