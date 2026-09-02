import { getFirebaseAuth } from '$lib/firebase/auth';
async function request(id: string, method = 'GET') {
	const user = getFirebaseAuth().currentUser;
	const response = await fetch(`/api/stories/${id}/follow`, {
		method,
		headers: user ? { authorization: `Bearer ${await user.getIdToken()}` } : {}
	});
	const body = await response.json().catch(() => ({}));
	if (!response.ok) throw new Error(body.message ?? 'Không thể theo dõi truyện.');
	return Boolean(body.following);
}
export const getStoryFollow = (id: string) => request(id);
export const followStory = (id: string) => request(id, 'POST');
export const unfollowStory = (id: string) => request(id, 'DELETE');
