import type { AuthorSnapshot } from './author';
import type { FirestoreEntity, FirestoreTimestamp, TimestampedEntity } from './firestore';
import type { AudioAsset, CloudinaryAsset } from './media';

export type StoryStatus = 'draft' | 'ongoing' | 'completed' | 'hiatus' | 'hidden' | 'removed';
export type StoryFormat = 'serial' | 'short';
export type ChapterStatus = 'draft' | 'published' | 'hidden' | 'removed';
export type StoryContentFormat = 'text' | 'audio' | 'interactive' | 'mixed';
export type ChapterContentFormat = 'text' | 'audio' | 'interactive';

export interface Story extends FirestoreEntity, TimestampedEntity, AuthorSnapshot {
	title: string;
	slug: string;
	description: string;
	cover: CloudinaryAsset | null;
	tags: string[];
	format: StoryFormat;
	contentFormat: StoryContentFormat;
	status: StoryStatus;
	chapterCount: number;
	commentCount: number;
	viewCount: number;
	followerCount: number;
	ratingCount: number;
	ratingSum: number;
	ratingAverage: number;
	publishedAt: FirestoreTimestamp | null;
}

export interface Chapter extends FirestoreEntity, TimestampedEntity {
	storyId: string;
	chapterNumber: number;
	title: string;
	content: string;
	contentFormat: ChapterContentFormat;
	audio: AudioAsset | null;
	wordCount: number;
	viewCount: number;
	commentCount: number;
	status: ChapterStatus;
	publishedAt: FirestoreTimestamp | null;
}
