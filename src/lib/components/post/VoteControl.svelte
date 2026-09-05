<script lang="ts">
	import { resolve } from '$app/paths';
	import { Heart } from '@lucide/svelte';
	import { authStore } from '$lib/stores/auth.svelte';
	import { getPostVote, setPostVote } from '$lib/services/votes';
	import type { VoteValue } from '$lib/types';
	import { compactNumber } from '$lib/utils/post';
	let {
		postId,
		initialScore,
		orientation = 'horizontal',
		compact = false
	}: {
		postId: string;
		initialScore: number;
		orientation?: 'vertical' | 'horizontal';
		compact?: boolean;
	} = $props();
	let score = $derived(initialScore);
	let value = $state<VoteValue | 0>(0);
	let busy = $state(false);
	let message = $state('');
	$effect(() => {
		if (authStore.initialized && authStore.firebaseUser)
			void getPostVote(postId)
				.then((state) => {
					value = state.value;
					score = state.score;
				})
				.catch(() => {});
	});
	async function toggleHeart() {
		if (!authStore.firebaseUser) {
			location.href =
				resolve('/auth/login') +
				`?redirect=${encodeURIComponent(location.pathname + location.search)}`;
			return;
		}
		if (busy) return;
		const previous = { value, score };
		const target = value === 1 ? 0 : 1;
		value = target;
		score += target - previous.value;
		busy = true;
		message = '';
		try {
			const state = await setPostVote(postId, target);
			value = state.value;
			score = state.score;
		} catch (error) {
			value = previous.value;
			score = previous.score;
			message = error instanceof Error ? error.message : 'Không thể bình chọn.';
		} finally {
			busy = false;
		}
	}
</script>

<div
	class:flex-col={orientation === 'vertical'}
	class:flex-row={orientation === 'horizontal'}
	class:gap-0.5={orientation === 'horizontal'}
	class:compact
	class="heart-control flex items-center"
	aria-label="Lượt thả tim bài viết"
>
	<button
		class:text-red={value === 1}
		class:compact
		class="heart-button group grid place-items-center text-text-muted transition disabled:opacity-50"
		disabled={busy}
		aria-label={value === 1 ? 'Bỏ tim bài viết' : 'Thả tim bài viết'}
		aria-pressed={value === 1}
		onclick={toggleHeart}
		><Heart
			size={18}
			strokeWidth={1.7}
			fill={value === 1 ? 'currentColor' : 'none'}
			class="transition-transform duration-200 group-active:scale-90"
			aria-hidden="true"
		/></button
	>
	<span class="engagement-count font-medium" class:active-count={value === 1}
		>{compactNumber(score)}</span
	>
</div>
{#if message}<p class="mt-1 text-xs text-error" role="status">{message}</p>{/if}

<style>
	.heart-button {
		min-width: 1.75rem;
		height: 2.5rem;
		padding: 0.5rem 0.125rem;
	}
	.heart-button.compact {
		height: 2.5rem;
	}
	.heart-button:hover {
		color: var(--color-red-bright);
	}
	.heart-button:focus-visible {
		outline: 1px solid var(--color-red);
		outline-offset: 1px;
	}
	.engagement-count {
		min-width: 1.25rem;
		font-size: 0.8125rem;
		color: var(--color-text-secondary);
	}
	.heart-control.compact .engagement-count {
		font-size: 0.8125rem;
	}
	.active-count {
		color: var(--color-red-bright);
	}
	@media (max-width: 639px) {
		.heart-button,
		.heart-button.compact {
			height: 2.75rem;
		}
	}
	@media (prefers-reduced-motion: reduce) {
		.heart-button,
		.heart-button :global(svg) {
			transition: none;
		}
	}
</style>
