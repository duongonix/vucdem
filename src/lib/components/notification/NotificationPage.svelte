<script lang="ts">
	import { onMount } from 'svelte';
	import { Bell, CheckCheck, LoaderCircle } from '@lucide/svelte';
	import {
		markAllNotificationsRead,
		markNotificationRead,
		notifyNotificationsChanged,
		watchNotifications
	} from '$lib/services/notifications';
	import type { Notification } from '$lib/types';
	let notifications = $state<Notification[]>([]);
	let loading = $state(true);
	let markingAll = $state(false);
	let errorMessage = $state('');
	let statusMessage = $state('');
	const hasUnread = $derived(notifications.some((notification) => !notification.isRead));
	const copy: Record<string, string> = {
		comment: 'đã bình luận về nội dung của bạn',
		reply: 'đã trả lời bình luận của bạn',
		follow: 'đã theo dõi bạn',
		upvote: 'đã thích bài viết của bạn',
		story_update: 'đã đăng chương truyện mới',
		mention: 'đã nhắc đến bạn',
		content_approved: 'đã phê duyệt nội dung của bạn',
		content_rejected: 'đã gửi phản hồi kiểm duyệt'
	};
	function notificationCopy(notification: Notification): string {
		if (notification.message) return notification.message;
		if (notification.type === 'follow' && notification.targetType === 'story')
			return 'đã theo dõi truyện của bạn';
		return copy[notification.type] ?? 'đã tương tác với bạn';
	}
	function href(n: Notification) {
		if (n.destination) return n.destination;
		if (n.targetType === 'post') return `/post/${n.targetId}`;
		if (n.targetType === 'story') return `/story/${n.targetId}`;
		if (n.targetType === 'user') return `/u/${n.targetId}`;
		return '/notifications';
	}
	onMount(() => {
		return watchNotifications(
			(value) => {
				notifications = value.notifications;
				loading = false;
				errorMessage = '';
			},
			{
				onError: (reason) => {
					errorMessage = reason instanceof Error ? reason.message : 'Không thể tải thông báo.';
					loading = false;
				}
			}
		);
	});
	async function open(n: Notification) {
		try {
			if (!n.isRead) {
				await markNotificationRead(n.id);
				n.isRead = true;
				notifyNotificationsChanged();
			}
			location.href = href(n);
		} catch (reason) {
			errorMessage =
				reason instanceof Error ? reason.message : 'Không thể cập nhật trạng thái thông báo.';
		}
	}
	async function all() {
		if (!hasUnread || markingAll) return;
		markingAll = true;
		statusMessage = '';
		try {
			await markAllNotificationsRead();
			notifications = notifications.map((n) => ({ ...n, isRead: true }));
			notifyNotificationsChanged();
			statusMessage = 'Đã xác nhận xem hết thông báo.';
		} catch (reason) {
			errorMessage =
				reason instanceof Error ? reason.message : 'Không thể cập nhật trạng thái thông báo.';
		} finally {
			markingAll = false;
		}
	}
</script>

<div class="mx-auto max-w-3xl py-6">
	<header class="mb-5 flex items-end justify-between border-b border-border pb-5">
		<div>
			<p class="text-xs tracking-[.2em] text-red uppercase">Dấu vết</p>
			<h1 class="font-editorial text-4xl text-text">Thông báo</h1>
		</div>
		{#if notifications.length}<button
				onclick={all}
				disabled={!hasUnread || markingAll}
				class="inline-flex min-h-9 items-center gap-2 border border-border-red px-3 text-sm text-red transition-colors hover:bg-red-muted/20 disabled:cursor-default disabled:border-border disabled:text-text-muted disabled:opacity-60"
				>{#if markingAll}<LoaderCircle class="size-4 animate-spin" />{:else}<CheckCheck
						class="size-4"
					/>{/if}
				{hasUnread ? 'Đã xem tất cả' : 'Đã xem hết'}</button
			>{/if}
	</header>
	{#if statusMessage}<p
			class="mb-4 border-l-2 border-success px-3 py-2 text-sm text-success"
			role="status"
		>
			{statusMessage}
		</p>{/if}
	{#if loading}<p class="flex items-center gap-2 text-text-muted">
			<LoaderCircle class="size-4 animate-spin" /> Đang tải…
		</p>
	{:else if errorMessage}<p role="alert" class="border border-error/40 p-5 text-error">
			{errorMessage}
		</p>
	{:else if notifications.length}<div class="border border-border bg-surface">
			{#each notifications as n (n.id)}<button
					onclick={() => open(n)}
					class={`flex w-full gap-4 border-b border-border p-4 text-left last:border-0 hover:bg-surface-hover ${!n.isRead ? 'bg-red-dark/10' : ''}`}
					><span class="mt-1 flex size-9 items-center justify-center border border-border"
						><Bell class="size-4 text-red" /></span
					><span class="min-w-0 flex-1 text-sm text-text-secondary"
						><strong class="text-text">{n.actorName}</strong>
						{notificationCopy(n)}<span class="mt-1 block text-xs text-text-muted"
							>{n.createdAt.toDate().toLocaleString('vi-VN')}</span
						></span
					>{#if !n.isRead}<span class="mt-3 size-2 bg-red" aria-label="Chưa đọc"
						></span>{/if}</button
				>{/each}
		</div>
	{:else}<p class="border border-dashed border-border p-12 text-center text-text-muted">
			Bóng tối vẫn im lặng. Chưa có thông báo mới.
		</p>{/if}
</div>
