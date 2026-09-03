import { error } from '@sveltejs/kit';
import { Timestamp } from 'firebase-admin/firestore';
import type { DiscussionMessage } from '$lib/types';

export const DISCUSSION_MESSAGE_MAX_LENGTH = 1_000;

export function validateDiscussionMessage(value: unknown): string {
	const content = typeof value === 'string' ? value.trim() : '';
	if (!content) error(400, 'Tin nhắn không được để trống.');
	if (content.length > DISCUSSION_MESSAGE_MAX_LENGTH)
		error(400, `Tin nhắn không được vượt quá ${DISCUSSION_MESSAGE_MAX_LENGTH} ký tự.`);
	return content;
}

export function serializeDiscussionMessage(
	document: FirebaseFirestore.DocumentSnapshot
): DiscussionMessage {
	const createdAt = document.get('createdAt');
	return {
		id: document.id,
		authorId: String(document.get('authorId') ?? ''),
		authorName: String(document.get('authorName') ?? 'Thành viên'),
		authorUsername: String(document.get('authorUsername') ?? ''),
		authorAvatarUrl: document.get('authorAvatarUrl') ?? null,
		authorVerified: document.get('authorVerified') === true,
		content: String(document.get('content') ?? ''),
		createdAt:
			createdAt instanceof Timestamp ? createdAt.toDate().toISOString() : new Date().toISOString()
	};
}
