import { getFirebaseAuth } from '$lib/firebase/auth';
import type { VoteValue } from '$lib/types';

export interface PostVoteState {
	value: VoteValue | 0;
	score: number;
}

async function headers(): Promise<Record<string, string>> {
	const user = getFirebaseAuth().currentUser;
	if (!user) throw new Error('Bạn cần đăng nhập để bình chọn.');
	return { authorization: `Bearer ${await user.getIdToken()}`, 'content-type': 'application/json' };
}

async function parse(response: Response): Promise<PostVoteState> {
	const body = (await response.json().catch(() => ({}))) as Partial<PostVoteState> & {
		message?: string;
	};
	if (!response.ok || typeof body.score !== 'number' || ![-1, 0, 1].includes(body.value ?? 2))
		throw new Error(body.message ?? 'Không thể cập nhật bình chọn.');
	return { value: body.value as VoteValue | 0, score: body.score };
}

export async function getPostVote(postId: string): Promise<PostVoteState> {
	const user = getFirebaseAuth().currentUser;
	const auth: HeadersInit = user ? { authorization: `Bearer ${await user.getIdToken()}` } : {};
	return parse(await fetch(`/api/posts/${encodeURIComponent(postId)}/vote`, { headers: auth }));
}

export async function setPostVote(postId: string, value: VoteValue | 0): Promise<PostVoteState> {
	return parse(
		await fetch(`/api/posts/${encodeURIComponent(postId)}/vote`, {
			method: 'POST',
			headers: await headers(),
			body: JSON.stringify({ value })
		})
	);
}

export async function getCommentVote(commentId: string): Promise<PostVoteState> {
	const user = getFirebaseAuth().currentUser;
	const auth: HeadersInit = user ? { authorization: `Bearer ${await user.getIdToken()}` } : {};
	return parse(
		await fetch(`/api/comments/${encodeURIComponent(commentId)}/vote`, { headers: auth })
	);
}

export async function setCommentVote(
	commentId: string,
	value: VoteValue | 0
): Promise<PostVoteState> {
	return parse(
		await fetch(`/api/comments/${encodeURIComponent(commentId)}/vote`, {
			method: 'POST',
			headers: await headers(),
			body: JSON.stringify({ value })
		})
	);
}
