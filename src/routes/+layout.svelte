<script lang="ts">
	import './layout.css';
	import favicon from '$lib/assets/logo.ico';
	import AuthBootstrap from '$lib/components/auth/AuthBootstrap.svelte';
	import AppShell from '$lib/components/layout/AppShell.svelte';
	import RealtimeToastWatcher from '$lib/components/toast/RealtimeToastWatcher.svelte';
	import ToastHost from '$lib/components/toast/ToastHost.svelte';

	let { children } = $props();
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
	<meta name="theme-color" content="#080808" />
</svelte:head>
<AuthBootstrap />
<RealtimeToastWatcher />
<ToastHost />
<a
	href="#main-content"
	class="sr-only z-toast bg-surface px-4 py-2 text-text focus:not-sr-only focus:fixed focus:top-2 focus:left-2"
>
	Bỏ qua đến nội dung chính
</a>
<AppShell>{@render children()}</AppShell>
