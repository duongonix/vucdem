import { getFirebaseAuth } from '$lib/firebase/auth';
export interface FollowState {
	following: boolean;
	notificationsEnabled: boolean;
	followersCount: number;
}
async function request(
	username: string,
	method: 'GET' | 'POST' | 'DELETE' | 'PATCH',
	notificationsEnabled?: boolean
): Promise<FollowState> {
	const user = getFirebaseAuth().currentUser;
	if (!user) throw new Error('Bạn cần đăng nhập để theo dõi tác giả.');
	const response = await fetch(`/api/users/${encodeURIComponent(username)}/follow`, {
		method,
		headers: {
			authorization: `Bearer ${await user.getIdToken()}`,
			...(method === 'PATCH' ? { 'content-type': 'application/json' } : {})
		},
		...(method === 'PATCH' ? { body: JSON.stringify({ notificationsEnabled }) } : {})
	});
	const body = (await response.json().catch(() => ({}))) as Partial<FollowState> & {
		message?: string;
	};
	if (
		!response.ok ||
		typeof body.following !== 'boolean' ||
		typeof body.notificationsEnabled !== 'boolean' ||
		typeof body.followersCount !== 'number'
	)
		throw new Error(body.message ?? 'Không thể cập nhật theo dõi.');
	return {
		following: body.following,
		notificationsEnabled: body.notificationsEnabled,
		followersCount: body.followersCount
	};
}
export const getFollowState = (username: string) => request(username, 'GET');
export const followUser = (username: string) => request(username, 'POST');
export const unfollowUser = (username: string) => request(username, 'DELETE');
export const setFollowNotifications = (username: string, enabled: boolean) =>
	request(username, 'PATCH', enabled);
