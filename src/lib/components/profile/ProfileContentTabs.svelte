<script lang="ts">
	/* eslint-disable svelte/no-navigation-without-resolve -- dynamic content links */
	import { LoaderCircle } from '@lucide/svelte';
	import { getBookmarks, getProfileContent } from '$lib/services/profile-content';
	import { authStore } from '$lib/stores/auth.svelte';
	let { username, ownerId }: { username: string; ownerId: string } = $props();
	let tab = $state<'posts' | 'stories' | 'bookmarks'>('posts');
	let items = $state<Record<string, unknown>[]>([]);
	let cursor = $state<string | null>(null);
	let loading = $state(false);
	let errorMessage = $state('');
	const isOwner = $derived(authStore.user?.id === ownerId);
	async function load(reset = true) {
		loading = true;
		errorMessage = '';
		try {
			if (tab === 'bookmarks') {
				items = (await getBookmarks()).map((x) => ({ ...x.content, targetType: x.targetType }));
				cursor = null;
			} else {
				const page = await getProfileContent(
					username,
					tab,
					reset ? undefined : (cursor ?? undefined)
				);
				items = reset ? page.items : [...items, ...page.items];
				cursor = page.nextCursor;
			}
		} catch (r) {
			errorMessage = r instanceof Error ? r.message : 'Không thể tải nội dung.';
		} finally {
			loading = false;
		}
	}
	function select(next: typeof tab) {
		tab = next;
		void load();
	}
	$effect(() => {
		void username;
		void load();
	});
	function href(item: Record<string, unknown>) {
		return item.targetType === 'story' || tab === 'stories'
			? `/story/${item.slug}`
			: `/post/${item.id}`;
	}
</script>

<section class="mt-6">
	<nav class="flex border-b border-border">
		<button class:active={tab === 'posts'} onclick={() => select('posts')}>Bài viết</button><button
			class:active={tab === 'stories'}
			onclick={() => select('stories')}>Truyện</button
		>{#if isOwner}<button class:active={tab === 'bookmarks'} onclick={() => select('bookmarks')}
				>Đã lưu</button
			>{/if}
	</nav>
	{#if loading && !items.length}<p class="state">
			<LoaderCircle class="size-4 animate-spin" /> Đang tải…
		</p>{:else if errorMessage}<p class="state text-error">
			{errorMessage}
		</p>{:else if items.length}<div class="grid gap-3 py-4">
			{#each items as item (String(item.id))}<a
					href={href(item)}
					class="border border-border bg-surface p-5 hover:border-red"
					><p class="text-xs tracking-wider text-red uppercase">
						{String(item.status ?? item.targetType ?? 'Nội dung')}
					</p>
					<h3 class="mt-1 font-editorial text-2xl text-text">{String(item.title)}</h3>
					<p class="mt-2 line-clamp-2 text-sm text-text-muted">
						{String(item.excerpt ?? item.description ?? '')}
					</p></a
				>{/each}
		</div>
		{#if cursor}<button
				onclick={() => load(false)}
				disabled={loading}
				class="mx-auto block border border-border px-5 py-2 text-sm text-text-secondary"
				>Xem thêm</button
			>{/if}{:else}<p class="state">Chưa có nội dung trong mục này.</p>{/if}
</section>

<style>
	nav button {
		min-height: 2.75rem;
		border-bottom: 2px solid transparent;
		padding: 0 1rem;
		color: var(--color-text-muted);
		font-size: 0.875rem;
	}
	nav button.active {
		border-color: var(--color-red);
		color: var(--color-text);
	}
	.state {
		display: flex;
		justify-content: center;
		gap: 0.5rem;
		border: 1px dashed var(--color-border);
		padding: 2.5rem;
		color: var(--color-text-muted);
		font-size: 0.875rem;
	}
</style>
