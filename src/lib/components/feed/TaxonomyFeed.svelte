<script lang="ts">
	import { LoaderCircle, RotateCcw, Tags } from '@lucide/svelte';
	import { untrack } from 'svelte';
	import PostCard from '$lib/components/post/PostCard.svelte';
	import StoryFeedCard from '$lib/components/story/StoryFeedCard.svelte';
	import { queryPosts } from '$lib/services/posts';
	import { queryStories } from '$lib/services/stories';
	import type { Post, Story } from '$lib/types';
	import { postCategoryLabel } from '$lib/utils/post';

	let { kind, value }: { kind: 'category' | 'tag'; value: string } = $props();
	let posts = $state<Post[]>([]);
	let stories = $state<Story[]>([]);
	let postCursor = $state<string | null>(null);
	let storyCursor = $state<string | null>(null);
	let loading = $state(true);
	let loadingMore = $state(false);
	let message = $state('');
	let requestId = 0;
	const title = $derived(kind === 'category' ? postCategoryLabel(value) : `#${value}`);
	const items = $derived.by(() =>
		[
			...posts.map((entry) => ({ type: 'post' as const, value: entry })),
			...stories.map((entry) => ({ type: 'story' as const, value: entry }))
		].sort(
			(a, b) =>
				(b.value.publishedAt ?? b.value.createdAt).toMillis() -
				(a.value.publishedAt ?? a.value.createdAt).toMillis()
		)
	);
	const hasMore = $derived(Boolean(postCursor) || (kind === 'tag' && Boolean(storyCursor)));

	async function load(reset = true) {
		if (!value || (!reset && (!hasMore || loadingMore))) return;
		if (reset) {
			requestId += 1;
			posts = [];
			stories = [];
			postCursor = null;
			storyCursor = null;
			loading = true;
		} else loadingMore = true;
		const currentRequest = requestId;
		message = '';
		try {
			const [postPage, storyPage] = await Promise.all([
				queryPosts({
					category: kind === 'category' ? value : undefined,
					tag: kind === 'tag' ? value : undefined,
					cursor: reset ? undefined : (postCursor ?? undefined)
				}),
				kind === 'tag'
					? queryStories({ tag: value, cursor: reset ? undefined : (storyCursor ?? undefined) })
					: null
			]);
			if (currentRequest !== requestId) return;
			const postIds = new Set(posts.map((post) => post.id));
			posts = reset
				? postPage.posts
				: [...posts, ...postPage.posts.filter((post) => !postIds.has(post.id))];
			postCursor = postPage.nextCursor;
			if (storyPage) {
				const storyIds = new Set(stories.map((story) => story.id));
				stories = reset
					? storyPage.stories
					: [...stories, ...storyPage.stories.filter((story) => !storyIds.has(story.id))];
				storyCursor = storyPage.nextCursor;
			}
		} catch (cause) {
			if (currentRequest === requestId)
				message = cause instanceof Error ? cause.message : 'Không thể tải nội dung.';
		} finally {
			if (currentRequest === requestId) {
				loading = false;
				loadingMore = false;
			}
		}
	}

	$effect(() => {
		void `${kind}:${value}`;
		untrack(() => void load());
	});
</script>

<svelte:head>
	<title>{title} — VỰC ĐÊM</title>
	<meta
		name="description"
		content={kind === 'category'
			? `Các bài viết thuộc chủ đề ${title} trên VỰC ĐÊM.`
			: `Bài viết và truyện mang tag ${title} trên VỰC ĐÊM.`}
	/>
</svelte:head>

<section aria-labelledby="taxonomy-title" class="min-w-0">
	<header class="mb-5 border-b border-border pb-5">
		<p class="flex items-center gap-2 text-xs tracking-[.18em] text-red uppercase">
			<Tags size={15} />
			{kind === 'category' ? 'Chủ đề' : 'Tag'}
		</p>
		<h1 id="taxonomy-title" class="mt-2 font-editorial text-3xl text-text sm:text-4xl">{title}</h1>
		<p class="mt-2 text-sm text-text-muted">
			{kind === 'category'
				? 'Những bài viết mới nhất trong chủ đề này.'
				: 'Những bài viết và truyện cùng mang dấu ấn này.'}
		</p>
	</header>

	{#if loading}
		<div class="grid gap-3" aria-label="Đang tải nội dung">
			{#each [1, 2, 3] as item (item)}<div
					class="h-60 animate-pulse border border-border bg-surface"
				></div>{/each}
		</div>
	{:else if items.length}
		<div class="grid gap-3">
			{#each items as item (`${item.type}:${item.value.id}`)}
				{#if item.type === 'post'}<PostCard post={item.value} />{:else}<StoryFeedCard
						story={item.value}
					/>{/if}
			{/each}
		</div>
	{:else if !message}
		<div class="border border-border bg-surface px-5 py-16 text-center">
			<p class="font-editorial text-2xl text-text">Chưa có nội dung nào.</p>
			<p class="mt-2 text-sm text-text-muted">Bóng tối ở nơi này vẫn chưa được đánh thức.</p>
		</div>
	{/if}

	{#if message}
		<div
			class="mt-4 flex items-center justify-between gap-4 border border-error/30 bg-error/5 p-4 text-sm text-error"
			role="alert"
		>
			<span>{message}</span><button
				class="inline-flex items-center gap-2 border border-error/40 px-3 py-1.5"
				onclick={() => load(items.length === 0)}><RotateCcw size={15} /> Thử lại</button
			>
		</div>
	{/if}

	{#if hasMore}
		<div class="mt-6 text-center">
			<button
				class="inline-flex min-w-40 items-center justify-center gap-2 border border-border-red bg-surface px-5 py-2.5 text-sm text-red hover:bg-surface-hover disabled:opacity-50"
				disabled={loadingMore}
				onclick={() => load(false)}
				>{#if loadingMore}<LoaderCircle class="animate-spin" size={17} />{/if}{loadingMore
					? 'Đang tải…'
					: 'Xem thêm'}</button
			>
		</div>
	{/if}
</section>
