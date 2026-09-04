<script lang="ts">
	/* eslint-disable svelte/no-navigation-without-resolve -- authenticated destinations are introduced by later phases */
	import { resolve } from '$app/paths';
	import { Bell, LogIn, LogOut, Plus } from '@lucide/svelte';
	import { Button } from '$lib/components/ui/button';
	import { logout } from '$lib/services/auth';
	import { authStore } from '$lib/stores/auth.svelte';
	import { watchNotifications } from '$lib/services/notifications';
	import Brand from './Brand.svelte';
	import DesktopNavigation from './DesktopNavigation.svelte';
	import HeaderSearch from './HeaderSearch.svelte';
	import MobileMenu from './MobileMenu.svelte';

	let loggingOut = $state(false);
	let unreadCount = $state(0);
	$effect(() => {
		if (authStore.status !== 'authenticated') {
			unreadCount = 0;
			return;
		}
		return watchNotifications((value) => (unreadCount = value.unreadCount), {
			unread: true,
			onError: () => (unreadCount = 0)
		});
	});

	async function handleLogout() {
		loggingOut = true;
		try {
			await logout();
		} finally {
			loggingOut = false;
		}
	}

	const notificationsHref = $derived(
		authStore.status === 'authenticated'
			? '/notifications'
			: `${resolve('/auth/login')}?redirect=/notifications`
	);
	const writeHref = $derived(
		authStore.status === 'authenticated' ? '/write' : `${resolve('/auth/login')}?redirect=/write`
	);
</script>

<header class="sticky top-0 z-sticky h-18 border-b border-border bg-background/95 sm:h-20">
	<div
		class="mx-auto flex h-full w-full max-w-[1600px] items-center gap-3 px-4 sm:px-6 lg:gap-6 lg:px-8"
	>
		<MobileMenu />
		<Brand />
		<DesktopNavigation />
		<div class="ml-auto flex min-w-0 items-center gap-1.5 sm:gap-2">
			<HeaderSearch />
			<!-- Runtime hrefs point to routes introduced by their later roadmap phases. -->
			<!-- eslint-disable-next-line svelte/no-navigation-without-resolve -->
			<a
				href={notificationsHref}
				class="relative inline-flex size-11 items-center justify-center border border-transparent text-text-secondary transition-colors hover:bg-surface-hover hover:text-text"
				aria-label="Thông báo"
			>
				<Bell class="size-5" aria-hidden="true" />
				{#if unreadCount > 0}<span
						class="absolute top-1 right-1 flex min-w-4 items-center justify-center bg-red px-1 text-[.6rem] leading-4 text-white"
						>{unreadCount > 99 ? '99+' : unreadCount}</span
					>{/if}
			</a>
			{#if authStore.status === 'authenticated'}
				<!-- eslint-disable-next-line svelte/no-navigation-without-resolve -->
				<a
					href={`/u/${authStore.user?.username ?? ''}`}
					class="hidden size-10 overflow-hidden rounded-full border border-border-red bg-surface-2 min-[720px]:inline-flex"
					aria-label={`Hồ sơ ${authStore.user?.displayName ?? ''}`}
				>
					{#if authStore.user?.avatar?.url}<img
							class="size-full object-cover grayscale-[25%]"
							src={authStore.user.avatar.url}
							alt=""
						/>{:else}<span class="m-auto font-editorial text-lg text-red"
							>{authStore.user?.displayName?.slice(0, 1).toUpperCase()}</span
						>{/if}
				</a>
				<Button
					variant="ghost"
					size="icon"
					aria-label="Đăng xuất"
					onclick={handleLogout}
					disabled={loggingOut}
					class="size-10"
				>
					<LogOut class="size-4" aria-hidden="true" />
				</Button>
			{:else}
				<a
					href={resolve('/auth/login')}
					class="hidden min-h-8 items-center gap-2 border border-transparent px-3 py-1.5 text-xs font-medium text-text-secondary hover:bg-surface-hover hover:text-text min-[720px]:inline-flex"
				>
					<LogIn class="size-4" aria-hidden="true" /> Đăng nhập
				</a>
			{/if}
			<!-- eslint-disable-next-line svelte/no-navigation-without-resolve -->
			<a
				href={writeHref}
				class="inline-flex size-10 shrink-0 items-center justify-center gap-2 rounded-full border border-red-dark bg-red-dark text-sm font-medium text-text hover:border-red hover:bg-red sm:min-h-11 sm:w-auto sm:px-5 sm:py-2"
				aria-label="Đăng bài"
			>
				<Plus class="size-4" aria-hidden="true" /> <span class="hidden sm:inline">Đăng</span>
			</a>
		</div>
	</div>
</header>
