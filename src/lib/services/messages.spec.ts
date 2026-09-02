import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('$lib/firebase/auth', () => ({
	getFirebaseAuth: () => ({ currentUser: { getIdToken: async () => 'test-token' } })
}));

import { sendMessage, startConversation } from './messages';

describe('messages API service', () => {
	beforeEach(() => vi.restoreAllMocks());

	it('rejects empty messages before making a request', async () => {
		const fetchSpy = vi.spyOn(globalThis, 'fetch');
		await expect(sendMessage('conversation-id', 'test-user', '   ')).rejects.toThrow(
			'Tin nhắn không được để trống.'
		);
		expect(fetchSpy).not.toHaveBeenCalled();
	});

	it('sends trimmed text with an authenticated request', async () => {
		const message = {
			id: 'message-id',
			conversationId: 'conversation-id',
			senderId: 'test-user',
			content: 'Một lời thì thầm',
			createdAt: new Date().toISOString(),
			status: 'delivered' as const
		};
		const fetchSpy = vi
			.spyOn(globalThis, 'fetch')
			.mockResolvedValue(new Response(JSON.stringify({ message }), { status: 200 }));
		await expect(
			sendMessage('conversation-id', 'test-user', '  Một lời thì thầm  ')
		).resolves.toEqual(message);
		expect(fetchSpy).toHaveBeenCalledWith(
			'/api/messages/conversation-id',
			expect.objectContaining({
				method: 'POST',
				body: JSON.stringify({ content: 'Một lời thì thầm' })
			})
		);
	});

	it('starts a direct conversation with the selected real user id', async () => {
		const participant = {
			id: 'other-user',
			username: 'other',
			displayName: 'Other',
			avatarUrl: null,
			online: false
		};
		const conversation = {
			id: 'conversation-id',
			participant,
			lastMessage: '',
			lastMessageAt: new Date().toISOString(),
			unreadCount: 0,
			muted: false
		};
		const fetchSpy = vi
			.spyOn(globalThis, 'fetch')
			.mockResolvedValue(new Response(JSON.stringify({ conversation }), { status: 200 }));
		await expect(startConversation(participant)).resolves.toEqual(conversation);
		expect(fetchSpy).toHaveBeenCalledWith(
			'/api/messages',
			expect.objectContaining({ body: JSON.stringify({ participantId: 'other-user' }) })
		);
	});
});
