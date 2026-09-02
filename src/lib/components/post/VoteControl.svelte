<script lang="ts">
	import { resolve } from '$app/paths';
	import { ArrowBigDown, ArrowBigUp } from '@lucide/svelte';
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
	async function vote(next: VoteValue) {
		if (!authStore.firebaseUser) {
			location.href =
				resolve('/auth/login') +
				`?redirect=${encodeURIComponent(location.pathname + location.search)}`;
			return;
		}
		if (busy) return;
		const previous = { value, score };
		const target = value === next ? 0 : next;
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
	class="flex items-center justify-center gap-1"
	aria-label="Bình chọn bài viết"
>
	<button
		class:text-red={value === 1}
		class="p-1 text-text-muted hover:text-red disabled:opacity-50"
		disabled={busy}
		aria-label="Bình chọn lên"
		aria-pressed={value === 1}
		onclick={() => vote(1)}
		><ArrowBigUp size={22} fill={value === 1 ? 'currentColor' : 'none'} /></button
	>
	<strong class="min-w-10 text-center font-editorial text-lg font-medium text-text"
		>{compactNumber(score)}</strong
	>
	<button
		class:text-red={value === -1}
		class="p-1 text-text-muted hover:text-red disabled:opacity-50"
		disabled={busy}
		aria-label="Bình chọn xuống"
		aria-pressed={value === -1}
		onclick={() => vote(-1)}
		><ArrowBigDown size={22} fill={value === -1 ? 'currentColor' : 'none'} /></button
	>
</div>
{#if message}<p class="mt-1 text-center text-xs text-error" role="status">{message}</p>{/if}
