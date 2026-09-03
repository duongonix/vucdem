<script lang="ts">
	import { resolve } from '$app/paths';
	import { page } from '$app/state';
	import { LoaderCircle, RotateCcw } from '@lucide/svelte';
	import PostCard from '$lib/components/post/PostCard.svelte';
	import StoryFeedCard from '$lib/components/story/StoryFeedCard.svelte';
	import HomeRulesBanner from './HomeRulesBanner.svelte';
	import { queryPosts, type PostQueryOptions } from '$lib/services/posts';
	import { queryStories } from '$lib/services/stories';
	import type { Post, Story } from '$lib/types';
	import { onMount } from 'svelte';
	type FeedMode = 'all' | 'posts' | 'stories';
	let { initialMode = 'all' }: { initialMode?: FeedMode } = $props();
	type FeedItem = { type: 'post'; value: Post } | { type: 'story'; value: Story };
	const filters: { label: string; mode: FeedMode }[] = [
		{ label: 'Tất cả', mode: 'all' },
		{ label: 'Thảo luận', mode: 'posts' },
		{ label: 'Truyện', mode: 'stories' }
	];
	let posts = $state<Post[]>([]);
	let stories = $state<Story[]>([]);
	let postCursor = $state<string | null>(null);
	let storyCursor = $state<string | null>(null);
	let loading = $state(true);
	let loadingMore = $state(false);
	let error = $state('');
	// svelte-ignore state_referenced_locally
	let mode = $state<FeedMode>(initialMode);
	let sort = $state<PostQueryOptions['sort']>('newest');
	let category = $state<string | null>(null);
	let requestId = 0;
	const items = $derived.by(() => {
		const combined: FeedItem[] = [
			...(mode !== 'stories' ? posts.map((value) => ({ type: 'post' as const, value })) : []),
			...(mode !== 'posts' ? stories.map((value) => ({ type: 'story' as const, value })) : [])
		];
		return combined.sort(
			(a, b) =>
				(b.value.publishedAt ?? b.value.createdAt).toMillis() -
				(a.value.publishedAt ?? a.value.createdAt).toMillis()
		);
	});
	const hasMore = $derived(
		(mode !== 'stories' && Boolean(postCursor)) || (mode !== 'posts' && Boolean(storyCursor))
	);
	async function load(reset = true) {
		if (reset) {
			requestId += 1;
			posts = [];
			stories = [];
			postCursor = null;
			storyCursor = null;
			loading = true;
		} else {
			if (!hasMore || loadingMore) return;
			loadingMore = true;
		}
		const current = requestId;
		error = '';
		try {
			const [postPage, storyPage] = await Promise.all([
				mode !== 'stories' && (reset || postCursor)
					? queryPosts({
							sort,
							category: category ?? undefined,
							cursor: reset ? undefined : (postCursor ?? undefined)
						})
					: null,
				mode !== 'posts' && (reset || storyCursor)
					? queryStories({ cursor: reset ? undefined : (storyCursor ?? undefined) })
					: null
			]);
			if (current !== requestId) return;
			if (postPage) {
				const ids = new Set(posts.map((post) => post.id));
				posts = reset
					? postPage.posts
					: [...posts, ...postPage.posts.filter((post) => !ids.has(post.id))];
				postCursor = postPage.nextCursor;
			}
			if (storyPage) {
				const ids = new Set(stories.map((story) => story.id));
				stories = reset
					? storyPage.stories
					: [...stories, ...storyPage.stories.filter((story) => !ids.has(story.id))];
				storyCursor = storyPage.nextCursor;
			}
		} catch (cause) {
			if (current === requestId)
				error = cause instanceof Error ? cause.message : 'Không thể tải bài viết.';
		} finally {
			if (current === requestId) {
				loading = false;
				loadingMore = false;
			}
		}
	}
	function changeFilter(next: FeedMode) {
		mode = next;
		category = null;
		if (mode !== 'posts') sort = 'newest';
		void load();
	}
	onMount(() => {
		const requested = page.url.searchParams.get('feed');
		mode = filters.find((filter) => filter.mode === requested)?.mode ?? initialMode;
		category = page.url.searchParams.get('category');
		if (category) mode = 'posts';
		const requestedSort = page.url.searchParams.get('sort');
		if (mode === 'posts' && ['newest', 'popular', 'viewed'].includes(requestedSort ?? ''))
			sort = requestedSort as PostQueryOptions['sort'];
		void load();
	});
</script>

<svelte:head
	><title>VỰC ĐÊM — Cộng đồng kể chuyện kinh dị</title><meta
		name="description"
		content="Khám phá chuyện kinh dị, bí ẩn và trải nghiệm tâm linh từ cộng đồng VỰC ĐÊM."
	/></svelte:head
>
<section aria-labelledby="feed-heading">
	<HomeRulesBanner />
	<div
		class="mb-4 flex flex-col gap-4 border-b border-border pb-4 lg:flex-row lg:items-center lg:justify-between"
	>
		<h1 id="feed-heading" class="sr-only">Bài viết mới trên VỰC ĐÊM</h1>
		<div class="flex gap-1 overflow-x-auto" aria-label="Lọc bài viết">
			{#each filters as filter (filter.label)}<button
					class:border-border-red={mode === filter.mode}
					class:text-red={mode === filter.mode}
					class="shrink-0 border border-transparent px-3 py-2 text-sm text-text-secondary hover:text-text"
					onclick={() => changeFilter(filter.mode)}>{filter.label}</button
				>{/each}
		</div>
		<label class="flex shrink-0 items-center gap-2 text-xs text-text-muted"
			>Sắp xếp: <select
				class="border border-border bg-surface px-3 py-2 text-sm text-text-secondary"
				bind:value={sort}
				onchange={() => load()}
				disabled={mode !== 'posts'}
				><option value="newest">Mới nhất</option><option value="popular">Phổ biến</option><option
					value="viewed">Xem nhiều</option
				></select
			></label
		>
	</div>
	{#if loading}<div class="grid gap-3" aria-label="Đang tải bài viết">
			{#each [0, 1, 2, 3] as skeleton (skeleton)}<div
					class="h-60 animate-pulse border border-border bg-surface"
				>
					<div class="m-6 h-3 w-32 bg-surface-2"></div>
					<div class="m-6 h-8 w-2/3 bg-surface-2"></div>
					<div class="m-6 h-16 bg-surface-2"></div>
				</div>{/each}
		</div>
	{:else}
		{#if items.length}<div class="grid gap-3">
				{#each items as item (`${item.type}:${item.value.id}`)}
					{#if item.type === 'post'}<PostCard post={item.value} />{:else}<StoryFeedCard
							story={item.value}
						/>{/if}
				{/each}
			</div>
		{:else if !error}<div class="border border-border bg-surface px-6 py-16 text-center">
				<p class="font-editorial text-2xl text-text">Chưa có bài viết nào trong mục này.</p>
				<a class="mt-3 inline-block text-sm text-red hover:text-red-bright" href={resolve('/write')}
					>Hãy kể câu chuyện đầu tiên</a
				>
			</div>{/if}
		{#if error}<div
				class="mt-4 flex items-center justify-between gap-4 border border-error/30 bg-error/5 p-4 text-sm text-error"
				role="alert"
			>
				<span>{error}</span><button
					class="flex items-center gap-2 border border-error/40 px-3 py-1.5"
					onclick={() => load(posts.length === 0)}><RotateCcw size={15} /> Thử lại</button
				>
			</div>{/if}
		{#if hasMore}<div class="mt-6 text-center">
				<button
					class="inline-flex min-w-40 items-center justify-center gap-2 border border-border-red bg-surface px-5 py-2.5 text-sm text-red hover:bg-surface-hover disabled:opacity-50"
					disabled={loadingMore}
					onclick={() => load(false)}
					>{#if loadingMore}<LoaderCircle class="animate-spin" size={17} />{/if}{loadingMore
						? 'Đang tải…'
						: 'Xem thêm'}</button
				>
			</div>{:else if items.length}<p
				class="mt-7 text-center text-xs tracking-widest text-text-muted uppercase"
			>
				Bạn đã đi đến tận cùng bóng tối
			</p>{/if}
	{/if}
</section>
