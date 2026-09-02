<script lang="ts">
	/* eslint-disable svelte/no-navigation-without-resolve -- auth-aware and profile links are runtime values */
	import { page } from '$app/state';
	import { resolve } from '$app/paths';
	import { House, PenLine, Search, UserRound } from '@lucide/svelte';
	import { authStore } from '$lib/stores/auth.svelte';

	const writeHref = $derived(
		authStore.status === 'authenticated'
			? resolve('/write')
			: `${resolve('/auth/login')}?redirect=${encodeURIComponent('/write')}`
	);
	const profilePath = $derived(`/u/${authStore.user?.username ?? ''}`);
	const profileHref = $derived(
		authStore.status === 'authenticated'
			? profilePath
			: `${resolve('/auth/login')}?redirect=${encodeURIComponent('/')}`
	);
	const active = $derived(
		page.url.pathname === '/'
			? 'home'
			: page.url.pathname.startsWith('/search')
				? 'search'
				: page.url.pathname.startsWith('/write')
					? 'write'
					: page.url.pathname.startsWith('/u/')
						? 'profile'
						: ''
	);
	const itemClass =
		'group relative flex min-w-0 flex-col items-center justify-center gap-1 px-1 pt-2 pb-[max(.45rem,env(safe-area-inset-bottom))] text-[.66rem] font-medium tracking-[.01em] transition-colors';
</script>

<nav
	class="mobile-nav fixed inset-x-0 bottom-0 z-sticky grid min-h-[4.5rem] grid-cols-4 border-t border-border-red bg-background/97 px-2 min-[900px]:hidden"
	aria-label="Điều hướng di động"
>
	<span
		class="pointer-events-none absolute inset-x-5 top-0 h-px bg-gradient-to-r from-transparent via-red-dark to-transparent"
		aria-hidden="true"
	></span>
	<a
		href={resolve('/')}
		aria-current={active === 'home' ? 'page' : undefined}
		class={`${itemClass} ${active === 'home' ? 'text-red-bright' : 'text-text-muted hover:text-text'}`}
	>
		<span class="nav-icon"
			><span class="gothic-seal" aria-hidden="true"></span><House
				class="size-[1.35rem]"
				strokeWidth={active === 'home' ? 2 : 1.7}
				aria-hidden="true"
			/></span
		><span class="truncate">Trang Chủ</span>
	</a>
	<a
		href={resolve('/search')}
		aria-current={active === 'search' ? 'page' : undefined}
		class={`${itemClass} ${active === 'search' ? 'text-red-bright' : 'text-text-muted hover:text-text'}`}
	>
		<span class="nav-icon"
			><span class="gothic-seal" aria-hidden="true"></span><Search
				class="size-[1.35rem]"
				strokeWidth={active === 'search' ? 2 : 1.7}
				aria-hidden="true"
			/></span
		><span class="truncate">Tìm Kiếm</span>
	</a>
	<a
		href={writeHref}
		aria-current={active === 'write' ? 'page' : undefined}
		class={`${itemClass} ${active === 'write' ? 'text-red-bright' : 'text-text-muted hover:text-text'}`}
	>
		<span class="nav-icon"
			><span class="gothic-seal" aria-hidden="true"></span><PenLine
				class="size-[1.35rem]"
				strokeWidth={active === 'write' ? 2 : 1.7}
				aria-hidden="true"
			/></span
		><span class="truncate">Đăng Bài</span>
	</a>
	<a
		href={profileHref}
		aria-current={active === 'profile' ? 'page' : undefined}
		class={`${itemClass} ${active === 'profile' ? 'text-red-bright' : 'text-text-muted hover:text-text'}`}
	>
		<span
			class="nav-icon overflow-hidden rounded-full"
			class:border-avatar={Boolean(authStore.user?.avatar)}
		>
			<span class="gothic-seal" aria-hidden="true"></span>
			{#if authStore.user?.avatar}<img
					src={authStore.user.avatar.url}
					alt=""
					class="size-[1.45rem] rounded-full object-cover grayscale-[20%]"
				/>{:else}<UserRound
					class="size-[1.35rem]"
					strokeWidth={active === 'profile' ? 2 : 1.7}
					aria-hidden="true"
				/>{/if}
		</span><span class="truncate">Trang Cá Nhân</span>
	</a>
</nav>

<style>
	.mobile-nav {
		box-shadow: 0 -10px 30px rgb(0 0 0 / 72%);
	}
	.nav-icon {
		position: relative;
		display: grid;
		width: 2.35rem;
		height: 2rem;
		place-items: center;
		isolation: isolate;
	}
	.nav-icon :global(svg),
	.nav-icon :global(img) {
		position: relative;
		z-index: 2;
		transition:
			transform 220ms ease,
			filter 220ms ease;
	}
	.gothic-seal {
		position: absolute;
		z-index: 1;
		width: 2rem;
		height: 2rem;
		border: 1px solid transparent;
		opacity: 0;
		transform: scale(0.45) rotate(-35deg);
		transition:
			opacity 180ms ease,
			transform 280ms cubic-bezier(0.2, 0.85, 0.25, 1.25),
			border-color 180ms ease;
	}
	.gothic-seal::before,
	.gothic-seal::after {
		content: '';
		position: absolute;
		inset: 0.18rem;
		border: 1px solid var(--color-red-dark);
		transform: rotate(45deg);
	}
	.gothic-seal::after {
		inset: 0.45rem;
		border-color: color-mix(in srgb, var(--color-red) 72%, transparent);
		transform: rotate(0deg);
	}
	a[aria-current='page'] .gothic-seal {
		border-color: color-mix(in srgb, var(--color-red-dark) 65%, transparent);
		opacity: 1;
		transform: scale(1) rotate(0deg);
		animation: seal-pulse 2.8s ease-in-out infinite;
	}
	a[aria-current='page'] .nav-icon :global(svg),
	a[aria-current='page'] .nav-icon :global(img) {
		transform: translateY(-1px) scale(1.06);
		filter: drop-shadow(0 0 5px rgb(216 35 35 / 65%));
	}
	.border-avatar {
		border: 1px solid var(--color-red-dark);
	}
	@keyframes seal-pulse {
		0%,
		100% {
			filter: drop-shadow(0 0 2px rgb(122 16 16 / 35%));
		}
		50% {
			filter: drop-shadow(0 0 7px rgb(216 35 35 / 48%));
		}
	}
	@media (prefers-reduced-motion: reduce) {
		.gothic-seal,
		.nav-icon :global(svg),
		.nav-icon :global(img) {
			transition: none;
		}
		a[aria-current='page'] .gothic-seal {
			animation: none;
		}
	}
</style>
