import { getFirebaseAuth } from '$lib/firebase/auth';
import type { PostCategoryDefinition } from '$lib/types';
import { Timestamp } from 'firebase/firestore';

type Serialized = Omit<PostCategoryDefinition, 'createdAt' | 'updatedAt'> & {
	createdAt: number;
	updatedAt: number;
};
export type PostCategoryInput = Pick<
	PostCategoryDefinition,
	'name' | 'description' | 'order' | 'status'
>;

function revive(category: Serialized): PostCategoryDefinition {
	return {
		...category,
		createdAt: Timestamp.fromMillis(category.createdAt),
		updatedAt: Timestamp.fromMillis(category.updatedAt)
	};
}
async function adminHeaders() {
	const user = getFirebaseAuth().currentUser;
	if (!user) throw new Error('Bạn cần đăng nhập.');
	return { authorization: `Bearer ${await user.getIdToken()}`, 'content-type': 'application/json' };
}
async function parse(response: Response): Promise<unknown> {
	const body = await response.json().catch(() => ({}));
	if (!response.ok) throw new Error(body.message ?? 'Không thể xử lý danh mục.');
	return body;
}
export async function listPostCategories(): Promise<PostCategoryDefinition[]> {
	const response = await fetch('/api/post-categories');
	const body = (await parse(response)) as { categories: Serialized[] };
	return body.categories.map(revive);
}
export async function listAdminPostCategories(): Promise<PostCategoryDefinition[]> {
	const response = await fetch('/api/admin/post-categories', { headers: await adminHeaders() });
	const body = (await parse(response)) as { categories: Serialized[] };
	return body.categories.map(revive);
}
export async function createPostCategory(id: string, input: PostCategoryInput): Promise<void> {
	await parse(
		await fetch('/api/admin/post-categories', {
			method: 'POST',
			headers: await adminHeaders(),
			body: JSON.stringify({ id, ...input })
		})
	);
}
export async function updatePostCategory(id: string, input: PostCategoryInput): Promise<void> {
	await parse(
		await fetch(`/api/admin/post-categories/${encodeURIComponent(id)}`, {
			method: 'PATCH',
			headers: await adminHeaders(),
			body: JSON.stringify(input)
		})
	);
}
export async function deletePostCategory(id: string): Promise<void> {
	const response = await fetch(`/api/admin/post-categories/${encodeURIComponent(id)}`, {
		method: 'DELETE',
		headers: await adminHeaders()
	});
	if (!response.ok) await parse(response);
}
