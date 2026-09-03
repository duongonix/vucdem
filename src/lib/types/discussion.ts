export interface DiscussionMessage {
	id: string;
	authorId: string;
	authorName: string;
	authorUsername: string;
	authorAvatarUrl: string | null;
	authorVerified: boolean;
	content: string;
	createdAt: string;
}
