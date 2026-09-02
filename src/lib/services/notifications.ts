import { getFirebaseAuth } from '$lib/firebase/auth';
import type { Notification } from '$lib/types';
import { Timestamp } from 'firebase/firestore';
type Serialized = Omit<Notification, 'createdAt' | 'readAt'> & {
	createdAt: number;
	readAt: number | null;
};
async function headers(json = false) {
	const user = getFirebaseAuth().currentUser;
	if (!user) throw new Error('Bạn cần đăng nhập.');
	return {
		authorization: `Bearer ${await user.getIdToken()}`,
		...(json ? { 'content-type': 'application/json' } : {})
	};
}
const revive = (n: Serialized): Notification => ({
	...n,
	createdAt: Timestamp.fromMillis(n.createdAt),
	readAt: n.readAt ? Timestamp.fromMillis(n.readAt) : null
});
export async function listNotifications(unread = false) {
	const r = await fetch(`/api/notifications${unread ? '?unread=true' : ''}`, {
		headers: await headers()
	});
	const b = await r.json().catch(() => ({}));
	if (!r.ok) throw new Error(b.message ?? 'Không thể tải thông báo.');
	return {
		notifications: (b.notifications as Serialized[]).map(revive),
		unreadCount: Number(b.unreadCount ?? 0)
	};
}
export async function markNotificationRead(id: string) {
	const response = await fetch(`/api/notifications/${id}`, {
		method: 'PATCH',
		headers: await headers()
	});
	if (!response.ok) {
		const body = (await response.json().catch(() => ({}))) as { message?: string };
		throw new Error(body.message ?? 'Không thể đánh dấu thông báo đã đọc.');
	}
}
export async function markAllNotificationsRead() {
	const response = await fetch('/api/notifications', {
		method: 'PATCH',
		headers: await headers(true),
		body: JSON.stringify({ action: 'read-all' })
	});
	if (!response.ok) {
		const body = (await response.json().catch(() => ({}))) as { message?: string };
		throw new Error(body.message ?? 'Không thể đánh dấu tất cả thông báo đã đọc.');
	}
}

export const NOTIFICATIONS_CHANGED_EVENT = 'vucdem:notifications-changed';

export function notifyNotificationsChanged(): void {
	if (typeof window !== 'undefined') window.dispatchEvent(new Event(NOTIFICATIONS_CHANGED_EVENT));
}

export function watchNotifications(
	callback: (value: Awaited<ReturnType<typeof listNotifications>>) => void,
	options: { unread?: boolean; intervalMs?: number; onError?: (reason: unknown) => void } = {}
): () => void {
	let stopped = false;
	let loading = false;
	const refresh = async () => {
		if (stopped || loading || (typeof document !== 'undefined' && document.hidden)) return;
		loading = true;
		try {
			callback(await listNotifications(options.unread));
		} catch (reason) {
			options.onError?.(reason);
		} finally {
			loading = false;
		}
	};
	const visible = () => {
		if (!document.hidden) void refresh();
	};
	const changed = () => void refresh();
	const timer = window.setInterval(refresh, options.intervalMs ?? 10_000);
	window.addEventListener('focus', changed);
	document.addEventListener('visibilitychange', visible);
	window.addEventListener(NOTIFICATIONS_CHANGED_EVENT, changed);
	void refresh();
	return () => {
		stopped = true;
		window.clearInterval(timer);
		window.removeEventListener('focus', changed);
		document.removeEventListener('visibilitychange', visible);
		window.removeEventListener(NOTIFICATIONS_CHANGED_EVENT, changed);
	};
}
