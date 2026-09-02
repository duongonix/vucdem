import { getFirebaseAuth } from '$lib/firebase/auth';
import type { CreateReportInput } from '$lib/validation/report';
async function headers() {
	const user = getFirebaseAuth().currentUser;
	if (!user) throw new Error('Bạn cần đăng nhập để báo cáo.');
	return { authorization: `Bearer ${await user.getIdToken()}`, 'content-type': 'application/json' };
}
export async function createReport(input: CreateReportInput) {
	const r = await fetch('/api/reports', {
		method: 'POST',
		headers: await headers(),
		body: JSON.stringify(input)
	});
	const b = await r.json().catch(() => ({}));
	if (!r.ok) throw new Error(b.message ?? 'Không thể gửi báo cáo.');
	return b.report;
}
