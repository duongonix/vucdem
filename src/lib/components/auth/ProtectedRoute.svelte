<script lang="ts">
	/* eslint-disable svelte/no-navigation-without-resolve -- query preserves the runtime current path */
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import { resolve } from '$app/paths';
	import { LoaderCircle } from '@lucide/svelte';
	import { authStore } from '$lib/stores/auth.svelte';
	import type { Snippet } from 'svelte';
	import type { UserRole } from '$lib/types';

	let { children, roles }: { children: Snippet; roles?: UserRole[] } = $props();
	const permitted = $derived(
		authStore.status === 'authenticated' && (!roles || roles.includes(authStore.user!.role))
	);

	$effect(() => {
		if (authStore.initialized && authStore.status === 'unauthenticated') {
			const destination = `${page.url.pathname}${page.url.search}`;
			void goto(`${resolve('/auth/login')}?redirect=${encodeURIComponent(destination)}`);
		}
	});
</script>

{#if permitted}
	{@render children()}
{:else if authStore.status === 'authenticated'}
	<div class="flex min-h-64 items-center justify-center text-sm text-error" role="alert">
		Bạn không có quyền truy cập khu vực này.
	</div>
{:else}
	<div
		class="flex min-h-64 items-center justify-center gap-3 text-sm text-text-muted"
		role="status"
	>
		<LoaderCircle class="size-4 animate-spin" aria-hidden="true" /> Đang kiểm tra phiên đăng nhập…
	</div>
{/if}
