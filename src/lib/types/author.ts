export interface AuthorSnapshot {
	authorId: string;
	authorName: string;
	authorUsername: string;
	authorAvatarUrl: string | null;
	authorVerified?: boolean;
}
