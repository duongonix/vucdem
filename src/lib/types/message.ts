export type MessageStatus = 'sent' | 'delivered' | 'read';
export interface MessageParticipant {
	id: string;
	username: string;
	displayName: string;
	avatarUrl: string | null;
	online: boolean;
}
export interface Conversation {
	id: string;
	participant: MessageParticipant;
	lastMessage: string;
	lastMessageAt: string;
	unreadCount: number;
	muted: boolean;
}
export interface DirectMessage {
	id: string;
	conversationId: string;
	senderId: string;
	content: string;
	createdAt: string;
	status: MessageStatus;
}
