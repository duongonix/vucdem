import { getFirebaseAuth } from '$lib/firebase/auth';
import type { BookmarkTargetType } from '$lib/types';

export interface BookmarkState {
	bookmarked: boolean;
}
async function request(
	targetType: BookmarkTargetType,
	targetId: string,
	method: 'GET' | 'POST' | 'DELETE'
): Promise<BookmarkState> {
	const user = getFirebaseAuth().currentUser;
	if (!user) throw new Error('Bạn cần đăng nhập để lưu nội dung.');
	const response = await fetch(`/api/bookmarks/${targetType}/${encodeURIComponent(targetId)}`, {
		method,
		headers: { authorization: `Bearer ${await user.getIdToken()}` }
	});
	const body = (await response.json().catch(() => ({}))) as Partial<BookmarkState> & {
		message?: string;
	};
	if (!response.ok || typeof body.bookmarked !== 'boolean')
		throw new Error(body.message ?? 'Không thể cập nhật nội dung đã lưu.');
	return { bookmarked: body.bookmarked };
}
export const getBookmarkState = (type: BookmarkTargetType, id: string) => request(type, id, 'GET');
export const addBookmark = (type: BookmarkTargetType, id: string) => request(type, id, 'POST');
export const removeBookmark = (type: BookmarkTargetType, id: string) => request(type, id, 'DELETE');
