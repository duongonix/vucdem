<script lang="ts">
	/* eslint-disable svelte/no-navigation-without-resolve -- profile destination is auth-dependent */
	import { page } from '$app/state';
	import { resolve } from '$app/paths';
	import { Bell, House, MessageCircle, MessagesSquare, Settings, UserRound } from '@lucide/svelte';
	import { onMount } from 'svelte';
	import { authStore } from '$lib/stores/auth.svelte';
	import { listPostCategories } from '$lib/services/post-categories';
	import { watchConversations } from '$lib/services/messages';
	import type { PostCategoryDefinition } from '$lib/types';

	let topics = $state<PostCategoryDefinition[]>([]);
	let unreadMessages = $state(0);
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
			return;
		}
		return watchConversations(
			(value) => (unreadMessages = value.unreadCount),
			() => (unreadMessages = 0)
		);
	});
</script>

<aside class="space-y-8" aria-label="Khám phá nội dung">
	<section>
		<h2 class="mb-3 px-3 text-xs tracking-[0.14em] text-red uppercase">Khám phá</h2>
		<nav class="grid gap-1" aria-label="Điều hướng khám phá">
			{#each navigation as item (item.label)}
				{@const Icon = item.icon}
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
					{item.label}{item.path === '/messages' && unreadMessages > 0
						? ` (${unreadMessages > 99 ? '99+' : unreadMessages})`
						: ''}
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
