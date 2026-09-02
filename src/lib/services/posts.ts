import { getFirebaseAuth } from '$lib/firebase/auth';
import { getFirestoreDb } from '$lib/firebase/firestore';
import type { Post, PostCategory } from '$lib/types';
import type { PostMutationInput } from '$lib/validation/post';
import { collection, doc, Timestamp } from 'firebase/firestore';

interface SerializedPost extends Omit<Post, 'createdAt' | 'updatedAt' | 'publishedAt'> {
	createdAt: number;
	updatedAt: number;
	publishedAt: number | null;
}

interface PostResponse {
	post?: SerializedPost;
	message?: string;
}

export interface PostPage {
	posts: Post[];
	nextCursor: string | null;
}

export interface PostQueryOptions {
	sort?: 'newest' | 'popular' | 'viewed';
	category?: PostCategory;
	communityId?: string;
	authorId?: string;
	cursor?: string;
}

function revive(value: SerializedPost): Post {
	return {
		...value,
		createdAt: Timestamp.fromMillis(value.createdAt),
		updatedAt: Timestamp.fromMillis(value.updatedAt),
		publishedAt: value.publishedAt === null ? null : Timestamp.fromMillis(value.publishedAt)
	};
}

async function authHeaders(): Promise<Record<string, string>> {
	const user = getFirebaseAuth().currentUser;
	if (!user) throw new Error('Bạn cần đăng nhập để quản lý bài viết.');
	return { authorization: `Bearer ${await user.getIdToken()}`, 'content-type': 'application/json' };
}

async function parsePost(response: Response): Promise<Post> {
	const body = (await response.json().catch(() => ({}))) as PostResponse;
	if (!response.ok || !body.post) throw new Error(body.message ?? 'Không thể xử lý bài viết.');
	return revive(body.post);
}

export function createPostId(): string {
	return doc(collection(getFirestoreDb(), 'posts')).id;
}

export async function saveNewPost(id: string, input: PostMutationInput): Promise<Post> {
	return parsePost(
		await fetch('/api/posts', {
			method: 'POST',
			headers: await authHeaders(),
			body: JSON.stringify({ id, ...input })
		})
	);
}

export async function updatePost(id: string, input: PostMutationInput): Promise<Post> {
	return parsePost(
		await fetch(`/api/posts/${encodeURIComponent(id)}`, {
			method: 'PATCH',
			headers: await authHeaders(),
			body: JSON.stringify(input)
		})
	);
}

export async function removePost(id: string): Promise<Post> {
	return parsePost(
		await fetch(`/api/posts/${encodeURIComponent(id)}`, {
			method: 'PATCH',
			headers: await authHeaders(),
			body: JSON.stringify({ action: 'remove' })
		})
	);
}

export async function getPost(id: string): Promise<Post> {
	const user = getFirebaseAuth().currentUser;
	const headers: HeadersInit = user ? { authorization: `Bearer ${await user.getIdToken()}` } : {};
	return parsePost(await fetch(`/api/posts/${encodeURIComponent(id)}`, { headers }));
}

export async function queryPosts(options: PostQueryOptions = {}): Promise<PostPage> {
	const query = new URLSearchParams();
	for (const [key, value] of Object.entries(options)) if (value) query.set(key, value);
	const response = await fetch(`/api/posts?${query}`);
	const body = (await response.json().catch(() => ({}))) as {
		posts?: SerializedPost[];
		nextCursor?: string | null;
		message?: string;
	};
	if (!response.ok || !body.posts)
		throw new Error(
			body.message && body.message !== 'Internal Error' ? body.message : 'Không thể tải bài viết.'
		);
	return { posts: body.posts.map(revive), nextCursor: body.nextCursor ?? null };
}
