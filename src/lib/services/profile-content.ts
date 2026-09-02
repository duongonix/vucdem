import { getFirebaseAuth } from '$lib/firebase/auth';
export interface ContentPage {
	items: Record<string, unknown>[];
	nextCursor: string | null;
}
async function optionalHeaders(): Promise<Record<string, string>> {
	try {
		const u = getFirebaseAuth().currentUser;
		return u ? { authorization: `Bearer ${await u.getIdToken()}` } : {};
	} catch {
		return {};
	}
}
export async function getProfileContent(
	username: string,
	type: 'posts' | 'stories',
	cursor?: string
): Promise<ContentPage> {
	const q = new URLSearchParams({ type });
	if (cursor) q.set('cursor', cursor);
	const r = await fetch(`/api/users/${username}/content?${q}`, {
		headers: await optionalHeaders()
	});
	const b = await r.json().catch(() => ({}));
	if (!r.ok) throw new Error(b.message ?? 'Không thể tải nội dung.');
	return b;
}
export async function getBookmarks() {
	const u = getFirebaseAuth().currentUser;
	if (!u) throw new Error('Bạn cần đăng nhập.');
	const r = await fetch('/api/bookmarks', {
		headers: { authorization: `Bearer ${await u.getIdToken()}` }
	});
	const b = await r.json().catch(() => ({}));
	if (!r.ok) throw new Error(b.message ?? 'Không thể tải nội dung đã lưu.');
	return b.items as { targetType: 'post' | 'story'; content: Record<string, unknown> }[];
}
