import { writable } from 'svelte/store';

export interface AppToast {
	id: string;
	title: string;
	description: string;
	href?: string;
	kind: 'notification' | 'message';
}

export const toasts = writable<AppToast[]>([]);

export function dismissToast(id: string): void {
	toasts.update((items) => items.filter((item) => item.id !== id));
}

export function showToast(toast: Omit<AppToast, 'id'>): void {
	const id = crypto.randomUUID();
	toasts.update((items) => [...items.slice(-3), { ...toast, id }]);
	window.setTimeout(() => dismissToast(id), 6000);
}
