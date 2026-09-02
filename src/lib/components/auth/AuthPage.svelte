<script lang="ts">
	import AuthPanel from './AuthPanel.svelte';
	let { mode }: { mode: 'login' | 'register' | 'onboarding' | 'reset' } = $props();
</script>

<div
	class="relative flex min-h-[calc(100vh-5rem)] items-center justify-center overflow-hidden px-4 py-12"
>
	<div
		class="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_20%,rgba(122,16,16,0.18),transparent_34rem)]"
	></div>
	<div class="relative z-10 w-full"><AuthPanel {mode} /></div>
</div>
