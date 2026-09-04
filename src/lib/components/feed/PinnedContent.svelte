<script lang="ts">
	import { Pin, RotateCcw } from '@lucide/svelte';
	import PostCard from '$lib/components/post/PostCard.svelte';
	import StoryFeedCard from '$lib/components/story/StoryFeedCard.svelte';
	import { getPinnedContent } from '$lib/services/pinned-content';
	import type { Post, Story } from '$lib/types';
	import { onMount } from 'svelte';

	let posts = $state<Post[]>([]);
	let stories = $state<Story[]>([]);
	let active = $state<'stories' | 'posts'>('stories');
	let loading = $state(true);
	let error = $state('');

	async function load() {
		loading = true;
		error = '';
		try {
			({ posts, stories } = await getPinnedContent());
			if (!stories.length && posts.length) active = 'posts';
		} catch (cause) {
			error = cause instanceof Error ? cause.message : 'Không thể tải nội dung được ghim.';
		} finally {
			loading = false;
		}
	}

	onMount(load);
</script>

{#if loading || error || posts.length || stories.length}
	<section
		class="featured mb-6 border border-border-red bg-surface"
		aria-labelledby="featured-heading"
	>
		<header
			class="flex flex-col gap-3 border-b border-border px-4 py-4 sm:flex-row sm:items-end sm:justify-between sm:px-5"
		>
			<div>
				<p class="flex items-center gap-2 text-[.68rem] tracking-[.2em] text-red uppercase">
					<Pin class="size-3.5" /> Được tuyển chọn bởi Vực Đêm
				</p>
				<h2 id="featured-heading" class="mt-1 font-editorial text-2xl text-text">
					Nội dung nổi bật
				</h2>
			</div>
			<div
				class="flex border border-border bg-background p-1"
				role="tablist"
				aria-label="Loại nội dung được ghim"
			>
				<button
					class:active={active === 'stories'}
					role="tab"
					aria-selected={active === 'stories'}
					onclick={() => (active = 'stories')}>Story <span>{stories.length}</span></button
				>
				<button
					class:active={active === 'posts'}
					role="tab"
					aria-selected={active === 'posts'}
					onclick={() => (active = 'posts')}>Feed <span>{posts.length}</span></button
				>
			</div>
		</header>
		{#if loading}
			<div class="grid gap-3 p-3" aria-label="Đang tải nội dung nổi bật">
				<div class="h-44 animate-pulse border border-border bg-surface-2"></div>
			</div>
		{:else if error}
			<div class="flex items-center justify-between gap-3 p-5 text-sm text-error" role="alert">
				<span>{error}</span><button
					class="inline-flex items-center gap-2 border border-error/40 px-3 py-2"
					onclick={load}><RotateCcw class="size-4" /> Thử lại</button
				>
			</div>
		{:else}
			<div class="grid gap-3 p-3 sm:p-4">
				{#if active === 'stories'}
					{#each stories as story (story.id)}<StoryFeedCard {story} />{:else}<p class="empty">
							Chưa có truyện nào được ghim.
						</p>{/each}
				{:else}
					{#each posts as post (post.id)}<PostCard {post} />{:else}<p class="empty">
							Chưa có bài viết nào được ghim.
						</p>{/each}
				{/if}
			</div>
		{/if}
	</section>
{/if}

<style>
	.featured {
		background:
			radial-gradient(circle at 100% 0, rgba(122, 16, 16, 0.16), transparent 28rem),
			var(--color-surface);
	}
	[role='tab'] {
		min-width: 6rem;
		padding: 0.5rem 0.85rem;
		color: var(--color-text-muted);
		font-size: 0.75rem;
		letter-spacing: 0.08em;
		text-transform: uppercase;
	}
	[role='tab'] span {
		margin-left: 0.25rem;
		color: var(--color-text-muted);
	}
	[role='tab'].active {
		background: var(--color-red-muted);
		color: var(--color-red-bright);
		box-shadow: inset 0 -1px var(--color-red);
	}
	.empty {
		padding: 2.5rem 1rem;
		text-align: center;
		color: var(--color-text-muted);
	}
</style>
