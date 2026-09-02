import { getFirebaseAuth } from '$lib/firebase/auth';
import type { Comment, CommentTargetType } from '$lib/types';
import { Timestamp } from 'firebase/firestore';
interface SerializedComment extends Omit<Comment, 'createdAt' | 'updatedAt'> {
	createdAt: number;
	updatedAt: number;
}
export interface CommentPage {
	comments: Comment[];
	nextCursor: string | null;
}
function revive(comment: SerializedComment): Comment {
	return {
		...comment,
		createdAt: Timestamp.fromMillis(comment.createdAt),
		updatedAt: Timestamp.fromMillis(comment.updatedAt)
	};
}
async function authHeaders() {
	const user = getFirebaseAuth().currentUser;
	if (!user) throw new Error('Bạn cần đăng nhập để bình luận.');
	return { authorization: `Bearer ${await user.getIdToken()}`, 'content-type': 'application/json' };
}
async function parse(response: Response): Promise<Comment> {
	const body = (await response.json().catch(() => ({}))) as {
		comment?: SerializedComment;
		message?: string;
	};
	if (!response.ok || !body.comment) throw new Error(body.message ?? 'Không thể xử lý bình luận.');
	return revive(body.comment);
}
export async function queryComments(
	targetType: CommentTargetType,
	targetId: string,
	cursor?: string
): Promise<CommentPage> {
	const query = new URLSearchParams({ targetType, targetId });
	if (cursor) query.set('cursor', cursor);
	const response = await fetch(`/api/comments?${query}`);
	const body = (await response.json().catch(() => ({}))) as {
		comments?: SerializedComment[];
		nextCursor?: string | null;
		message?: string;
	};
	if (!response.ok || !body.comments) throw new Error(body.message ?? 'Không thể tải bình luận.');
	return { comments: body.comments.map(revive), nextCursor: body.nextCursor ?? null };
}
export async function createComment(
	targetType: CommentTargetType,
	targetId: string,
	content: string,
	parentId: string | null,
	isSpoiler = false
): Promise<Comment> {
	return parse(
		await fetch('/api/comments', {
			method: 'POST',
			headers: await authHeaders(),
			body: JSON.stringify({ targetType, targetId, content, parentId, isSpoiler })
		})
	);
}
export async function editComment(id: string, content: string): Promise<Comment> {
	return parse(
		await fetch(`/api/comments/${encodeURIComponent(id)}`, {
			method: 'PATCH',
			headers: await authHeaders(),
			body: JSON.stringify({ content })
		})
	);
}
export async function removeComment(id: string): Promise<Comment> {
	return parse(
		await fetch(`/api/comments/${encodeURIComponent(id)}`, {
			method: 'DELETE',
			headers: await authHeaders()
		})
	);
}
