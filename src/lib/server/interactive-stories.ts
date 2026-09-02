import type { InteractiveStoryContentInput } from '$lib/validation/interactive-story';
import type { DocumentReference, Transaction } from 'firebase-admin/firestore';
import { FieldValue } from 'firebase-admin/firestore';
import { error } from '@sveltejs/kit';
import {
	assertCloudinaryAssetMetadata,
	assertCloudinaryAudioMetadata
} from './media-authorization';

export function assertInteractiveMedia(
	storyId: string,
	chapterId: string,
	content: InteractiveStoryContentInput
) {
	const prefix = `vucdem/stories/${storyId}/chapters/${chapterId}/interactive/`;
	const avatarPrefix = `vucdem/stories/${storyId}/characters/`;
	for (const character of content.characters) {
		if (!character.avatar) continue;
		if (
			!character.avatar.publicId.startsWith(avatarPrefix) ||
			!/\/character-\d+\/avatar$/.test(character.avatar.publicId)
		)
			error(400, 'Avatar nhân vật không thuộc đúng truyện.');
		assertCloudinaryAssetMetadata(character.avatar, character.avatar.publicId);
	}
	for (const event of content.events) {
		if (event.type !== 'image' && event.type !== 'audio') continue;
		const asset = event.type === 'image' ? event.image : event.audio;
		if (!asset.publicId.startsWith(prefix) || !/\/event-\d+\/(?:image|audio)$/.test(asset.publicId))
			error(400, 'Media nhập vai không thuộc đúng chương truyện.');
		if (event.type === 'image') assertCloudinaryAssetMetadata(event.image, event.image.publicId);
		else assertCloudinaryAudioMetadata(event.audio, event.audio.publicId);
	}
}

export function writeInteractiveContent(
	transaction: Transaction,
	storyRef: DocumentReference,
	chapterRef: DocumentReference,
	content: InteractiveStoryContentInput,
	existingEventIds: string[] = []
) {
	const characterCollection = storyRef.collection('characters');
	const eventCollection = chapterRef.collection('interactiveEvents');
	const nextEventIds = new Set(content.events.map((item) => item.id));
	for (const eventId of existingEventIds)
		if (!nextEventIds.has(eventId)) transaction.delete(eventCollection.doc(eventId));
	for (const character of content.characters)
		transaction.set(characterCollection.doc(character.id), {
			...character,
			updatedAt: FieldValue.serverTimestamp()
		});
	for (const [order, item] of content.events.entries())
		transaction.set(eventCollection.doc(item.id), { ...item, order });
}

export async function readInteractiveContent(
	storyRef: DocumentReference,
	chapterRef: DocumentReference
) {
	const [characters, events, chapter] = await Promise.all([
		storyRef.collection('characters').get(),
		chapterRef.collection('interactiveEvents').orderBy('order', 'asc').get(),
		chapterRef.get()
	]);
	return {
		conversationType: chapter.get('conversationType') === 'group' ? 'group' : 'direct',
		conversationTitle: String(chapter.get('conversationTitle') ?? ''),
		conversationCharacterId:
			typeof chapter.get('conversationCharacterId') === 'string'
				? chapter.get('conversationCharacterId')
				: null,
		characters: characters.docs.map((item) => ({ id: item.id, ...item.data() })),
		events: events.docs.map((item) => ({ id: item.id, ...item.data() }))
	};
}
