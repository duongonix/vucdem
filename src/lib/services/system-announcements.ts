import { getFirebaseAuth } from '$lib/firebase/auth';

export interface SystemAnnouncementInput {
	title: string;
	message: string;
	destination?: string;
}

export async function sendSystemAnnouncement(input: SystemAnnouncementInput): Promise<number> {
	const user = getFirebaseAuth().currentUser;
	if (!user) throw new Error('Bạn cần đăng nhập.');
	const response = await fetch('/api/admin/announcements', {
		method: 'POST',
		headers: {
			authorization: `Bearer ${await user.getIdToken()}`,
			'content-type': 'application/json'
		},
		body: JSON.stringify(input)
	});
	const body = (await response.json().catch(() => ({}))) as {
		message?: string;
		recipientCount?: number;
	};
	if (!response.ok) throw new Error(body.message ?? 'Không thể gửi thông báo hệ thống.');
	return Number(body.recipientCount ?? 0);
}
