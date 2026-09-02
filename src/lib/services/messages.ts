import { getFirebaseAuth } from '$lib/firebase/auth';
import type { Conversation, DirectMessage, MessageParticipant } from '$lib/types';

async function authHeaders(json = false): Promise<Record<string, string>> {
	const user = getFirebaseAuth().currentUser;
	if (!user) throw new Error('Bạn cần đăng nhập.');
	return {
		authorization: `Bearer ${await user.getIdToken()}`,
		...(json ? { 'content-type': 'application/json' } : {})
	};
}
async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
	const response = await fetch(path, { ...init, headers: await authHeaders(Boolean(init.body)) });
	const body = (await response.json().catch(() => ({}))) as T & { message?: string };
	if (!response.ok) throw new Error(body.message ?? 'Không thể xử lý tin nhắn.');
	return body;
}
export async function getConversationsState(): Promise<{
	conversations: Conversation[];
	unreadCount: number;
}> {
	return request('/api/messages');
}
export async function listConversations(): Promise<Conversation[]> {
	return (await getConversationsState()).conversations;
}
export async function listMessages(conversationId: string): Promise<DirectMessage[]> {
	return (await request<{ messages: DirectMessage[] }>(`/api/messages/${conversationId}`)).messages;
}
export async function markConversationRead(conversationId: string): Promise<void> {
	await request(`/api/messages/${conversationId}`, {
		method: 'PATCH',
		body: JSON.stringify({ action: 'read' })
	});
	notifyMessagesChanged();
}
export async function sendMessage(
	conversationId: string,
	_senderId: string,
	content: string
): Promise<DirectMessage> {
	const trimmed = content.trim();
	if (!trimmed) throw new Error('Tin nhắn không được để trống.');
	const result = await request<{ message: DirectMessage }>(`/api/messages/${conversationId}`, {
		method: 'POST',
		body: JSON.stringify({ content: trimmed })
	});
	notifyMessagesChanged();
	return result.message;
}
export async function startConversation(participant: MessageParticipant): Promise<Conversation> {
	const result = await request<{ conversation: Conversation }>('/api/messages', {
		method: 'POST',
		body: JSON.stringify({ participantId: participant.id })
	});
	notifyMessagesChanged();
	return result.conversation;
}
export async function toggleConversationMuted(conversationId: string): Promise<Conversation> {
	return (
		await request<{ conversation: Conversation }>(`/api/messages/${conversationId}`, {
			method: 'PATCH',
			body: JSON.stringify({ action: 'mute' })
		})
	).conversation;
}
export async function removeConversation(conversationId: string): Promise<void> {
	await request(`/api/messages/${conversationId}`, { method: 'DELETE' });
	notifyMessagesChanged();
}
export const MESSAGES_CHANGED_EVENT = 'vucdem:messages-changed';
export function notifyMessagesChanged(): void {
	if (typeof window !== 'undefined') window.dispatchEvent(new Event(MESSAGES_CHANGED_EVENT));
}
function watch<T>(
	load: () => Promise<T>,
	callback: (value: T) => void,
	onError?: (reason: unknown) => void,
	intervalMs = 3000
): () => void {
	let stopped = false;
	let pending = false;
	const refresh = async () => {
		if (stopped || pending || document.hidden) return;
		pending = true;
		try {
			callback(await load());
		} catch (reason) {
			onError?.(reason);
		} finally {
			pending = false;
		}
	};
	const timer = window.setInterval(refresh, intervalMs);
	const changed = () => void refresh();
	window.addEventListener('focus', changed);
	window.addEventListener(MESSAGES_CHANGED_EVENT, changed);
	document.addEventListener('visibilitychange', changed);
	void refresh();
	return () => {
		stopped = true;
		window.clearInterval(timer);
		window.removeEventListener('focus', changed);
		window.removeEventListener(MESSAGES_CHANGED_EVENT, changed);
		document.removeEventListener('visibilitychange', changed);
	};
}
export function watchConversations(
	callback: (value: Awaited<ReturnType<typeof getConversationsState>>) => void,
	onError?: (reason: unknown) => void
): () => void {
	return watch(getConversationsState, callback, onError);
}
export function watchMessages(
	conversationId: string,
	callback: (messages: DirectMessage[]) => void,
	onError?: (reason: unknown) => void
): () => void {
	return watch(() => listMessages(conversationId), callback, onError, 2000);
}
