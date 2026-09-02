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

export interface ReaderPreferences {
	fontSize: number;
	lineHeight: number;
	width: number;
	theme: 'night' | 'blood' | 'paper';
}
