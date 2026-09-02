export type SpeechStatus = 'idle' | 'playing' | 'paused' | 'unsupported' | 'error';

export interface SpeechReaderState {
	status: SpeechStatus;
	voices: SpeechSynthesisVoice[];
	selectedVoiceName: string;
	rate: number;
	currentChunk: number;
	totalChunks: number;
	errorMessage: string;
	hasVietnameseVoice: boolean;
}

export interface SpeechReader {
	initialize(): void;
	play(): void;
	pause(): void;
	stop(): void;
	restart(): void;
	setRate(rate: number): void;
	setVoice(name: string): void;
	destroy(): void;
}
