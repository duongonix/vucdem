<script lang="ts">
	/* eslint-disable svelte/no-navigation-without-resolve -- runtime search and result links */
	import { page } from '$app/state';
	import { goto } from '$app/navigation';
	import {
		BookOpen,
		FileText,
		LoaderCircle,
		Search,
		SlidersHorizontal,
		Users
	} from '@lucide/svelte';
	import { listPostCategories } from '$lib/services/post-categories';
	import {
		search,
		type SearchContentType,
		type SearchOptions,
		type SearchResults,
		type SearchSort,
		type StorySearchFormat,
		type StorySearchStatus
	} from '$lib/services/search';
	import type { PostCategoryDefinition } from '$lib/types';
	import { onMount } from 'svelte';
	import VerifiedBadge from '$lib/components/profile/VerifiedBadge.svelte';
	let query = $state(page.url.searchParams.get('q') ?? '');
	let results = $state<SearchResults | null>(null);
	let loading = $state(false);
	let errorMessage = $state('');
	let categories = $state<PostCategoryDefinition[]>([]);
	let contentType = $state<SearchContentType>(
		page.url.searchParams.get('type') === 'posts'
			? 'posts'
			: page.url.searchParams.get('type') === 'stories'
				? 'stories'
				: 'all'
	);
	let category = $state(page.url.searchParams.get('category') ?? '');
	let tag = $state(page.url.searchParams.get('tag') ?? '');
	let storyStatus = $state<StorySearchStatus>(
		(['ongoing', 'completed', 'hiatus'] as const).includes(
			page.url.searchParams.get('storyStatus') as 'ongoing' | 'completed' | 'hiatus'
		)
			? (page.url.searchParams.get('storyStatus') as StorySearchStatus)
			: 'all'
	);
	let storyFormat = $state<StorySearchFormat>(
		page.url.searchParams.get('storyFormat') === 'short'
			? 'short'
			: page.url.searchParams.get('storyFormat') === 'serial'
				? 'serial'
				: 'all'
	);
	let sort = $state<SearchSort>(
		(['newest', 'viewed', 'rating'] as const).includes(
			page.url.searchParams.get('sort') as 'newest' | 'viewed' | 'rating'
		)
			? (page.url.searchParams.get('sort') as SearchSort)
			: 'relevance'
	);

	function options(): SearchOptions {
		return { contentType, category, tag, storyStatus, storyFormat, sort };
	}

	function searchUrl(q: string) {
		const params = [`q=${encodeURIComponent(q)}`];
		if (contentType !== 'all') params.push(`type=${encodeURIComponent(contentType)}`);
		if (category) params.push(`category=${encodeURIComponent(category)}`);
		if (tag) params.push(`tag=${encodeURIComponent(tag)}`);
		if (storyStatus !== 'all') params.push(`storyStatus=${encodeURIComponent(storyStatus)}`);
		if (storyFormat !== 'all') params.push(`storyFormat=${encodeURIComponent(storyFormat)}`);
		if (sort !== 'relevance') params.push(`sort=${encodeURIComponent(sort)}`);
		return `/search?${params.join('&')}`;
	}
	async function run() {
		const q = query.trim();
		if (q.length < 2) {
			results = null;
			return;
		}
		loading = true;
		errorMessage = '';
		try {
			results = await search(q, options());
			await goto(searchUrl(q), { replaceState: true });
		} catch (r) {
			errorMessage = r instanceof Error ? r.message : 'Không thể tìm kiếm.';
		} finally {
			loading = false;
		}
	}
	onMount(() => {
		void listPostCategories()
			.then((value) => (categories = value.filter((item) => item.status === 'active')))
			.catch(() => (categories = []));
		if (query) void run();
	});
</script>

<div class="mx-auto max-w-5xl py-6">
	<header class="border-b border-border pb-6">
		<p class="text-xs tracking-[.2em] text-red uppercase">Khám phá</p>
		<h1 class="font-editorial text-4xl text-text">Tìm trong bóng tối</h1>
		<form
			class="mt-5"
			onsubmit={(e) => {
				e.preventDefault();
				void run();
			}}
		>
			<div class="relative">
				<input
					bind:value={query}
					class="h-12 w-full border border-border bg-surface pr-12 pl-4 text-text outline-none focus:border-red"
					placeholder="Tìm người dùng, bài viết hoặc truyện…"
				/><button
					class="absolute top-0 right-0 flex size-12 items-center justify-center text-text-muted hover:text-red"
					aria-label="Tìm kiếm"><Search class="size-5" /></button
				>
			</div>
			<fieldset class="search-filters">
				<legend><SlidersHorizontal class="size-3.5" /> Lọc kết quả</legend>
				<label
					>Loại nội dung<select bind:value={contentType}>
						<option value="all">Tất cả nội dung</option><option value="posts">Bài viết</option
						><option value="stories">Truyện</option>
					</select></label
				><label
					>Danh mục bài viết<select bind:value={category} disabled={contentType === 'stories'}>
						<option value="">Tất cả danh mục</option>{#each categories as item (item.id)}<option
								value={item.id}>{item.name}</option
							>{/each}</select
					></label
				><label
					>Định dạng truyện<select bind:value={storyFormat} disabled={contentType === 'posts'}>
						<option value="all">Mọi định dạng</option><option value="serial">Truyện dài</option
						><option value="short">Truyện ngắn</option>
					</select></label
				><label
					>Trạng thái truyện<select bind:value={storyStatus} disabled={contentType === 'posts'}>
						<option value="all">Mọi trạng thái</option><option value="ongoing">Đang ra</option
						><option value="completed">Hoàn thành</option><option value="hiatus">Tạm ngưng</option>
					</select></label
				><label>Tag chính xác<input bind:value={tag} maxlength="50" placeholder="#bimat" /></label
				><label
					>Sắp xếp<select bind:value={sort}>
						<option value="relevance">Liên quan nhất</option><option value="newest">Mới nhất</option
						><option value="viewed">Lượt xem cao</option><option value="rating">Đánh giá cao</option
						>
					</select></label
				>
			</fieldset>
		</form>
	</header>
	{#if loading}<p class="mt-10 flex justify-center gap-2 text-text-muted">
			<LoaderCircle class="size-4 animate-spin" /> Đang tìm…
		</p>{:else if errorMessage}<p class="mt-6 border border-error/40 p-4 text-error">
			{errorMessage}
		</p>{:else if results}
		{#if results.users.length || results.posts.length || results.stories.length}
			<div class="mt-8 space-y-10">
				<section aria-labelledby="search-users">
					<h2 id="search-users" class="section-title">
						<Users class="size-4" /> Người dùng <span>{results.users.length}</span>
					</h2>
					<div class="mt-3 grid gap-2 sm:grid-cols-2">
						{#each results.users as user (user.id)}<a
								href={`/u/${user.username}`}
								class="flex items-center gap-3 border border-border bg-surface p-4 hover:border-red"
								><span class="flex size-10 items-center justify-center bg-surface-2"
									>{#if user.avatar}<img
											src={user.avatar.url}
											alt=""
											loading="lazy"
											decoding="async"
											class="size-full object-cover"
										/>{:else}<Users class="size-4" />{/if}</span
								><span
									><strong class="flex items-center gap-1 text-text"
										>{user.displayName}{#if user.verify}<VerifiedBadge size="sm" />{/if}</strong
									><small class="text-text-muted">@{user.username}</small></span
								></a
							>{/each}
						{#if !results.users.length}<p class="empty sm:col-span-2">
								Không tìm thấy người dùng phù hợp.
							</p>{/if}
					</div>
				</section>
				<section aria-labelledby="search-posts">
					<h2 id="search-posts" class="section-title">
						<FileText class="size-4" /> Bài viết <span>{results.posts.length}</span>
					</h2>
					<div class="mt-3 grid gap-2">
						{#each results.posts as post (post.id)}<a
								href={`/post/${post.id}`}
								class="block border border-border bg-surface p-4 hover:border-red"
								><small class="text-red uppercase">Bài viết</small><strong
									class="mt-1 block font-editorial text-xl text-text">{post.title}</strong
								>
								<p class="mt-1 line-clamp-2 text-sm text-text-muted">{post.excerpt}</p>
								{#if post.tags?.length}<p class="mt-2 text-xs text-red-muted">
										{post.tags
											.slice(0, 3)
											.map((value) => `#${value}`)
											.join(' · ')}
									</p>{/if}</a
							>{/each}
						{#if !results.posts.length}<p class="empty">Không tìm thấy bài viết phù hợp.</p>{/if}
					</div>
				</section>
				<section aria-labelledby="search-stories">
					<h2 id="search-stories" class="section-title">
						<BookOpen class="size-4" /> Truyện <span>{results.stories.length}</span>
					</h2>
					<div class="mt-3 grid gap-2">
						{#each results.stories as story (story.id)}<a
								href={`/story/${story.slug}`}
								class="block border border-border bg-surface p-4 hover:border-red"
								><small class="text-red uppercase">Truyện</small><strong
									class="mt-1 block font-editorial text-xl text-text">{story.title}</strong
								>
								<p class="mt-1 line-clamp-2 text-sm text-text-muted">{story.description}</p>
								<p class="mt-2 text-xs text-text-muted">
									{story.format === 'short' ? 'Truyện ngắn' : 'Truyện dài'}
									{#if story.ratingAverage}
										· {story.ratingAverage.toFixed(1)} / 5{/if}
								</p>
								{#if story.tags?.length}<p class="mt-1 text-xs text-red-muted">
										{story.tags
											.slice(0, 3)
											.map((value) => `#${value}`)
											.join(' · ')}
									</p>{/if}</a
							>{/each}
						{#if !results.stories.length}<p class="empty">Không tìm thấy truyện phù hợp.</p>{/if}
					</div>
				</section>
			</div>
		{:else}<p class="empty mt-8">Không tìm thấy kết quả cho “{query.trim()}”.</p>{/if}
	{:else}<p class="empty mt-8">Nhập ít nhất 2 ký tự để bắt đầu.</p>{/if}
</div>

<style>
	.empty {
		border: 1px dashed var(--color-border);
		padding: 2rem;
		text-align: center;
		color: var(--color-text-muted);
		font-size: 0.875rem;
	}
	.section-title {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		border-bottom: 1px solid var(--color-border-red);
		padding-bottom: 0.65rem;
		font-family: var(--font-editorial);
		font-size: 1.35rem;
		color: var(--color-text);
	}
	.section-title span {
		font-family: var(--font-sans);
		font-size: 0.75rem;
		color: var(--color-red);
	}
	.search-filters {
		display: grid;
		grid-template-columns: repeat(3, minmax(0, 1fr));
		gap: 0.75rem;
		margin-top: 0.75rem;
		border: 1px solid var(--color-border-red);
		background: var(--color-surface-2);
		padding: 1rem;
	}
	.search-filters legend {
		display: flex;
		align-items: center;
		gap: 0.4rem;
		padding: 0 0.3rem;
		font-size: 0.72rem;
		letter-spacing: 0.1em;
		color: var(--color-red);
		text-transform: uppercase;
	}
	.search-filters label {
		display: grid;
		gap: 0.35rem;
		min-width: 0;
		font-size: 0.75rem;
		color: var(--color-text-muted);
	}
	.search-filters select,
	.search-filters input {
		width: 100%;
		min-width: 0;
		border: 1px solid var(--color-border);
		background: var(--color-background);
		padding: 0.58rem 0.65rem;
		color: var(--color-text-secondary);
		font-size: 0.82rem;
		outline: none;
	}
	.search-filters select:focus,
	.search-filters input:focus {
		border-color: var(--color-red);
	}
	.search-filters select:disabled {
		cursor: not-allowed;
		opacity: 0.48;
	}
	@media (max-width: 720px) {
		.search-filters {
			grid-template-columns: repeat(2, minmax(0, 1fr));
		}
	}
	@media (max-width: 440px) {
		.search-filters {
			grid-template-columns: 1fr;
		}
	}
</style>
