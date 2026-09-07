import type { FirestoreTimestamp } from './firestore';

export interface ReadingProgress {
	storyId: string;
	storySlug: string;
	storyTitle: string;
	chapterId: string;
	chapterNumber: number;
	chapterTitle: string;
	progressPercent: number;
	updatedAt: FirestoreTimestamp;
}

/** A compact progress record used by the private profile reading history. */
export type ReadingHistoryItem = ReadingProgress;

export interface ReaderPreferences {
	fontSize: number;
	lineHeight: number;
	width: number;
	theme: 'night' | 'blood' | 'paper';
}
