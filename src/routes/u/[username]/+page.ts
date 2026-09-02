import { error } from '@sveltejs/kit';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ fetch, params }) => {
	const response = await fetch(`/api/users/${encodeURIComponent(params.username)}`);
	const body = (await response.json().catch(() => ({}))) as { profile?: unknown; message?: string };
	if (response.status === 404) error(404, 'Không tìm thấy người dùng.');
	if (!response.ok || !body.profile) error(response.status, body.message ?? 'Không thể tải hồ sơ.');
	return { profile: body.profile };
};
