import { getFirebaseAuth } from '$lib/firebase/auth';
import { Timestamp } from 'firebase/firestore';
import type { ReaderPreferences, ReadingProgress } from '$lib/types';

const PREFERENCES_KEY = 'vucdem:reader-preferences';
export const DEFAULT_READER_PREFERENCES: ReaderPreferences = {
	fontSize: 19,
	lineHeight: 1.85,
	width: 720,
	theme: 'night'
};

async function headers(json = false): Promise<HeadersInit> {
	const user = getFirebaseAuth().currentUser;
	const result: Record<string, string> = {};
	if (user) result.authorization = `Bearer ${await user.getIdToken()}`;
	if (json) result['content-type'] = 'application/json';
	return result;
}

export async function getReadingProgress(storyId: string): Promise<ReadingProgress | null> {
	if (!getFirebaseAuth().currentUser) return null;
	const response = await fetch(`/api/reading-progress/${encodeURIComponent(storyId)}`, {
		headers: await headers()
	});
	if (response.status === 404) return null;
	const body = await response.json().catch(() => ({}));
	if (!response.ok) throw new Error(body.message ?? 'Không thể tải tiến độ đọc.');
	return { ...body.progress, updatedAt: Timestamp.fromMillis(body.progress.updatedAt) };
}

export async function saveReadingProgress(
	input: Omit<ReadingProgress, 'updatedAt'>
): Promise<void> {
	if (!getFirebaseAuth().currentUser) return;
	const response = await fetch(`/api/reading-progress/${encodeURIComponent(input.storyId)}`, {
		method: 'PUT',
		headers: await headers(true),
		body: JSON.stringify(input)
	});
	if (!response.ok) {
		const body = await response.json().catch(() => ({}));
		throw new Error(body.message ?? 'Không thể lưu tiến độ đọc.');
	}
}

export function loadReaderPreferences(): ReaderPreferences {
	if (typeof localStorage === 'undefined') return DEFAULT_READER_PREFERENCES;
	try {
		const value = JSON.parse(
			localStorage.getItem(PREFERENCES_KEY) ?? '{}'
		) as Partial<ReaderPreferences>;
		return {
			fontSize: Math.min(24, Math.max(16, Number(value.fontSize) || 19)),
			lineHeight: Math.min(2.1, Math.max(1.5, Number(value.lineHeight) || 1.85)),
			width: Math.min(820, Math.max(600, Number(value.width) || 720)),
			theme: ['night', 'blood', 'paper'].includes(value.theme ?? '')
				? (value.theme as ReaderPreferences['theme'])
				: 'night'
		};
	} catch {
		return DEFAULT_READER_PREFERENCES;
	}
}

export function storeReaderPreferences(value: ReaderPreferences): void {
	localStorage.setItem(PREFERENCES_KEY, JSON.stringify(value));
}
