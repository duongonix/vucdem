import { getFirebaseAuth } from '$lib/firebase/auth';
import type { Report, ReportStatus, ReportTargetType, UserRole, UserStatus } from '$lib/types';
async function headers(json = false) {
	const user = getFirebaseAuth().currentUser;
	if (!user) throw new Error('Bạn cần đăng nhập.');
	return {
		authorization: `Bearer ${await user.getIdToken()}`,
		...(json ? { 'content-type': 'application/json' } : {})
	};
}
export async function listReports(status: ReportStatus = 'open'): Promise<Report[]> {
	const r = await fetch(`/api/reports?status=${status}`, { headers: await headers() });
	const b = await r.json().catch(() => ({}));
	if (!r.ok) throw new Error(b.message ?? 'Không thể tải báo cáo.');
	return b.reports;
}
export async function reviewReport(id: string, status: Exclude<ReportStatus, 'open'>) {
	const r = await fetch(`/api/reports/${id}`, {
		method: 'PATCH',
		headers: await headers(true),
		body: JSON.stringify({ status })
	});
	if (!r.ok)
		throw new Error((await r.json().catch(() => ({}))).message ?? 'Không thể cập nhật báo cáo.');
}
export async function moderateContent(
	targetType: ReportTargetType,
	targetId: string,
	action: 'hide' | 'restore' | 'remove'
) {
	const r = await fetch('/api/moderation/content', {
		method: 'PATCH',
		headers: await headers(true),
		body: JSON.stringify({ targetType, targetId, action })
	});
	if (!r.ok)
		throw new Error((await r.json().catch(() => ({}))).message ?? 'Không thể kiểm duyệt nội dung.');
}
export async function listAdminResources(type: string) {
	const r = await fetch(`/api/admin/resources/${type}`, { headers: await headers() });
	const b = await r.json().catch(() => ({}));
	if (!r.ok) throw new Error(b.message ?? 'Không thể tải dữ liệu quản trị.');
	return b.items as Record<string, unknown>[];
}
export async function updateAdminUser(
	id: string,
	input: { role?: UserRole; status?: UserStatus; verify?: boolean }
) {
	const r = await fetch(`/api/admin/users/${id}`, {
		method: 'PATCH',
		headers: await headers(true),
		body: JSON.stringify(input)
	});
	if (!r.ok)
		throw new Error((await r.json().catch(() => ({}))).message ?? 'Không thể cập nhật người dùng.');
}
export async function updateAdminResourceStatus(type: string, id: string, status: string) {
	const r = await fetch(`/api/admin/resources/${type}/${id}`, {
		method: 'PATCH',
		headers: await headers(true),
		body: JSON.stringify({ status })
	});
	if (!r.ok)
		throw new Error((await r.json().catch(() => ({}))).message ?? 'Không thể cập nhật nội dung.');
}

export async function updateAdminResourcePin(
	type: 'posts' | 'stories',
	id: string,
	pinned: boolean
) {
	const r = await fetch(`/api/admin/resources/${type}/${id}`, {
		method: 'PATCH',
		headers: await headers(true),
		body: JSON.stringify({ action: 'pin', pinned })
	});
	if (!r.ok)
		throw new Error((await r.json().catch(() => ({}))).message ?? 'Không thể ghim nội dung.');
}
