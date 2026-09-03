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
		orientation = 'vertical'
	}: { postId: string; initialScore: number; orientation?: 'vertical' | 'horizontal' } = $props();
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
	class="flex"
	aria-label="Lượt thả tim bài viết"
>
	<button
		class:text-red={value === 1}
		class="group place-items-center text-text-muted transition hover:scale-105 hover:text-red disabled:opacity-50"
		disabled={busy}
		aria-label={value === 1 ? 'Bỏ tim bài viết' : 'Thả tim bài viết'}
		aria-pressed={value === 1}
		onclick={toggleHeart}
		><Heart
			size={15}
			strokeWidth={1.8}
			fill={value === 1 ? 'currentColor' : 'none'}
			class={`transition-transform ${value === 1 ? 'scale-100' : ''}`}
		/></button
	>
	<span class="min-w-7 text-center text-xs font-medium text-text"
		>{compactNumber(score)}</span
	>
</div>
{#if message}<p class="mt-1 text-xs text-error" role="status">{message}</p>{/if}
