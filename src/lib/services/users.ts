import { getFirebaseAuth } from '$lib/firebase/auth';
import type { PublicUserProfile } from '$lib/types';
import type { ProfileUpdateInput } from '$lib/validation/auth';

interface ProfileResponse {
	profile?: PublicUserProfile;
	message?: string;
}

async function parse(response: Response): Promise<PublicUserProfile> {
	const body = (await response.json().catch(() => ({}))) as ProfileResponse;
	if (!response.ok || !body.profile) throw new Error(body.message ?? 'Không thể tải hồ sơ.');
	return body.profile;
}

export async function getPublicProfile(username: string): Promise<PublicUserProfile> {
	return parse(await fetch(`/api/users/${encodeURIComponent(username)}`));
}

export async function updateProfile(
	username: string,
	input: ProfileUpdateInput
): Promise<PublicUserProfile> {
	const user = getFirebaseAuth().currentUser;
	if (!user) throw new Error('Bạn cần đăng nhập để sửa hồ sơ.');
	return parse(
		await fetch(`/api/users/${encodeURIComponent(username)}`, {
			method: 'PATCH',
			headers: {
				'content-type': 'application/json',
				authorization: `Bearer ${await user.getIdToken()}`
			},
			body: JSON.stringify(input)
		})
	);
}
