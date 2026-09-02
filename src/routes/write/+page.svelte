<script lang="ts">
	/* eslint-disable svelte/no-navigation-without-resolve -- query-param mode links */
	import { page } from '$app/state';
	import { FileText, Sparkles } from '@lucide/svelte';
	import WritePostEditor from '$lib/components/post/WritePostEditor.svelte';
	import CreateStoryEditor from '$lib/components/story/CreateStoryEditor.svelte';
	const storyMode = $derived(page.url.searchParams.get('mode') === 'story');
</script>

<svelte:head><title>{storyMode ? 'Tạo truyện' : 'Viết bài'} — VỰC ĐÊM</title></svelte:head>
<nav
	class="mx-auto mt-5 flex max-w-6xl border border-border bg-surface p-1"
	aria-label="Loại nội dung"
>
	<a href="/write" class:active={!storyMode} class="mode"><FileText class="size-4" /> Bài viết</a><a
		href="/write?mode=story"
		class:active={storyMode}
		class="mode"><Sparkles class="size-4" /> Truyện</a
	>
</nav>
{#if storyMode}<CreateStoryEditor />{:else}<WritePostEditor />{/if}

<style>
	.mode {
		display: flex;
		min-height: 2.5rem;
		flex: 1;
		align-items: center;
		justify-content: center;
		gap: 0.5rem;
		color: var(--color-text-muted);
		font-size: 0.875rem;
	}
	.mode.active {
		background: var(--color-red-dark);
		color: var(--color-text);
	}
</style>
