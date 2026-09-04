<script lang="ts">
	/* eslint-disable svelte/no-navigation-without-resolve -- profile destination is auth-dependent */
	import { page } from '$app/state';
	import { resolve } from '$app/paths';
	import {
		Bell,
		House,
		MessageCircle,
		MessagesSquare,
		Settings,
		Trophy,
		UserRound
	} from '@lucide/svelte';
	import { onMount } from 'svelte';
	import { authStore } from '$lib/stores/auth.svelte';
	import { listPostCategories } from '$lib/services/post-categories';
	import { watchConversations } from '$lib/services/messages';
	import { watchNotifications } from '$lib/services/notifications';
	import type { PostCategoryDefinition } from '$lib/types';
	let { showRankings = false }: { showRankings?: boolean } = $props();

	let topics = $state<PostCategoryDefinition[]>([]);
	let unreadMessages = $state(0);
	let unreadNotifications = $state(0);
	const profilePath = $derived(`/u/${authStore.user?.username ?? ''}`);
	const profileHref = $derived(
		authStore.status === 'authenticated'
			? profilePath
			: `${resolve('/auth/login')}?redirect=${encodeURIComponent('/')}`
	);
	const navigation = $derived([
		{ label: 'Trang Chủ', href: resolve('/'), path: '/', icon: House },
		{ label: 'Thông Báo', href: resolve('/notifications'), path: '/notifications', icon: Bell },
		{ label: 'Tin Nhắn', href: resolve('/messages'), path: '/messages', icon: MessagesSquare },
		{ label: 'Thảo Luận', href: resolve('/discussion'), path: '/discussion', icon: MessageCircle },
		...(showRankings
			? [
					{
						label: 'Bảng Xếp Hạng',
						href: resolve('/ranks'),
						path: '/ranks',
						icon: Trophy
					}
				]
			: []),
		{ label: 'Trang Cá Nhân', href: profileHref, path: '/u/', icon: UserRound },
		{ label: 'Cài Đặt', href: resolve('/settings'), path: '/settings', icon: Settings }
	]);
	const isActive = (path: string) =>
		path === '/' ? page.url.pathname === '/' : page.url.pathname.startsWith(path);

	onMount(() => {
		void listPostCategories()
			.then((value) => (topics = value))
			.catch(() => (topics = []));
	});
	$effect(() => {
		if (authStore.status !== 'authenticated') {
			unreadMessages = 0;
			unreadNotifications = 0;
			return;
		}
		const stopMessages = watchConversations(
			(value) => (unreadMessages = value.unreadCount),
			() => (unreadMessages = 0)
		);
		const stopNotifications = watchNotifications(
			(value) => (unreadNotifications = value.unreadCount),
			{ unread: true, onError: () => (unreadNotifications = 0) }
		);
		return () => {
			stopMessages();
			stopNotifications();
		};
	});
	function unreadFor(path: string): number {
		if (path === '/notifications') return unreadNotifications;
		if (path === '/messages') return unreadMessages;
		return 0;
	}
</script>

<aside class="space-y-8" aria-label="Khám phá nội dung">
	<section>
		<h2 class="mb-3 px-3 text-xs tracking-[0.14em] text-red uppercase">Khám phá</h2>
		<nav class="grid gap-1" aria-label="Điều hướng khám phá">
			{#each navigation as item (item.label)}
				{@const Icon = item.icon}
				{@const unread = unreadFor(item.path)}
				<a
					href={item.href}
					aria-current={isActive(item.path) ? 'page' : undefined}
					class={`flex min-h-11 items-center gap-3 border-l-2 px-3 text-sm transition-colors ${
						isActive(item.path)
							? 'border-red bg-red-muted/35 text-text'
							: 'border-transparent text-text-secondary hover:bg-surface-hover hover:text-text'
					}`}
				>
					<Icon class={`size-4 ${isActive(item.path) ? 'text-red' : ''}`} aria-hidden="true" />
					<span>{item.label}</span>
					{#if unread > 0}<span
							class="ml-auto inline-flex min-w-5 items-center justify-center rounded-full bg-red px-1.5 text-[.65rem] leading-5 font-semibold text-white shadow-[0_0_12px_rgb(216_35_35/0.22)]"
							aria-label={`${unread} mục chưa đọc`}>{unread > 99 ? '99+' : unread}</span
						>{/if}
				</a>
			{/each}
		</nav>
	</section>

	<section>
		<h2 class="mb-3 px-3 text-xs tracking-[0.14em] text-red uppercase">Chủ đề</h2>
		<ul class="divide-y divide-border border-y border-border text-sm text-text-secondary">
			{#each topics as topic (topic.id)}
				<li>
					<a
						class="flex min-h-10 items-center justify-between px-3 hover:bg-surface-hover hover:text-text"
						href={`/category/${encodeURIComponent(topic.id)}`}
						><span>{topic.name}</span><span class="size-1.5 bg-red-dark" aria-hidden="true"
						></span></a
					>
				</li>
			{/each}
		</ul>
	</section>
</aside>
