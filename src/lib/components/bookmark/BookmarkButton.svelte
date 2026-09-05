<script lang="ts">
	import { resolve } from '$app/paths';
	import { Bookmark, LoaderCircle } from '@lucide/svelte';
	import { addBookmark, getBookmarkState, removeBookmark } from '$lib/services/bookmarks';
	import { authStore } from '$lib/stores/auth.svelte';
	import type { BookmarkTargetType } from '$lib/types';
	let {
		targetType,
		targetId,
		showLabel = false,
		minimal = false
	}: {
		targetType: BookmarkTargetType;
		targetId: string;
		showLabel?: boolean;
		minimal?: boolean;
	} = $props();
	let bookmarked = $state(false);
	let busy = $state(false);
	let error = $state('');
	$effect(() => {
		if (authStore.initialized && authStore.firebaseUser)
			void getBookmarkState(targetType, targetId)
				.then((state) => (bookmarked = state.bookmarked))
				.catch(() => {});
	});
	async function toggle() {
		if (!authStore.firebaseUser) {
			location.href = `${resolve('/auth/login')}?redirect=${encodeURIComponent(location.pathname + location.search)}`;
			return;
		}
		if (busy) return;
		const previous = bookmarked;
		bookmarked = !bookmarked;
		busy = true;
		error = '';
		try {
			const state = bookmarked
				? await addBookmark(targetType, targetId)
				: await removeBookmark(targetType, targetId);
			bookmarked = state.bookmarked;
		} catch (cause) {
			bookmarked = previous;
			error = cause instanceof Error ? cause.message : 'Không thể lưu nội dung.';
		} finally {
			busy = false;
		}
	}
</script>

<span class="relative inline-flex"
	><button
		class:text-red={bookmarked}
		class:minimal
		class="inline-flex items-center gap-2 border border-black p-1 pr-2 pl-2 text-text-muted hover:text-yellow-500 disabled:opacity-50"
		disabled={busy}
		aria-label={bookmarked ? 'Bỏ lưu nội dung' : 'Lưu nội dung'}
		aria-pressed={bookmarked}
		title={bookmarked ? 'Bỏ lưu' : 'Lưu nội dung'}
		onclick={toggle}
		>{#if busy}<LoaderCircle class="animate-spin" size={16} />{:else}<Bookmark
				size={18}
				fill={bookmarked ? 'currentColor' : 'none'}
				aria-hidden="true"
			/>{/if}{#if showLabel}{bookmarked ? 'Đã lưu' : 'Lưu'}{/if}</button
	>{#if error}<span
			class="absolute top-full right-0 z-dropdown mt-1 w-52 border border-error/30 bg-surface p-2 text-xs text-error"
			role="status">{error}</span
		>{/if}</span
>

<style>
	button.minimal {
		min-width: 2.5rem;
		height: 2.5rem;
		justify-content: center;
		border-color: transparent;
		padding: 0.5rem;
	}
	button.minimal:hover {
		color: var(--color-red-bright);
	}
	button.minimal:focus-visible {
		outline: 1px solid var(--color-red-dark);
		outline-offset: 2px;
	}
	@media (max-width: 639px) {
		button.minimal {
			min-width: 2.75rem;
			height: 2.75rem;
		}
	}
</style>
