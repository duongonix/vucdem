<script lang="ts">
	/* eslint-disable svelte/no-navigation-without-resolve -- runtime search and result links */
	import { page } from '$app/state';
	import { goto } from '$app/navigation';
	import { BookOpen, FileText, LoaderCircle, Search, Users } from '@lucide/svelte';
	import { search, type SearchResults } from '$lib/services/search';
	import { onMount } from 'svelte';
	import VerifiedBadge from '$lib/components/profile/VerifiedBadge.svelte';
	let query = $state(page.url.searchParams.get('q') ?? '');
	let results = $state<SearchResults | null>(null);
	let loading = $state(false);
	let errorMessage = $state('');
	async function run() {
		const q = query.trim();
		if (q.length < 2) {
			results = null;
			return;
		}
		loading = true;
		errorMessage = '';
		try {
			results = await search(q);
			await goto(`/search?q=${encodeURIComponent(q)}`, { replaceState: true });
		} catch (r) {
			errorMessage = r instanceof Error ? r.message : 'Không thể tìm kiếm.';
		} finally {
			loading = false;
		}
	}
	onMount(() => {
		if (query) void run();
	});
</script>

<div class="mx-auto max-w-5xl py-6">
	<header class="border-b border-border pb-6">
		<p class="text-xs tracking-[.2em] text-red uppercase">Khám phá</p>
		<h1 class="font-editorial text-4xl text-text">Tìm trong bóng tối</h1>
		<form
			class="relative mt-5"
			onsubmit={(e) => {
				e.preventDefault();
				void run();
			}}
		>
			<input
				bind:value={query}
				class="h-12 w-full border border-border bg-surface pr-12 pl-4 text-text outline-none focus:border-red"
				placeholder="Tìm người dùng, bài viết hoặc truyện…"
			/><button
				class="absolute top-0 right-0 flex size-12 items-center justify-center text-text-muted"
				aria-label="Tìm kiếm"><Search class="size-5" /></button
			>
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
								<p class="mt-1 line-clamp-2 text-sm text-text-muted">{post.excerpt}</p></a
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
								<p class="mt-1 line-clamp-2 text-sm text-text-muted">{story.description}</p></a
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
</style>
