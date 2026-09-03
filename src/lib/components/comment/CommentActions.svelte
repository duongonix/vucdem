<script lang="ts">
	import { resolve } from '$app/paths';
	import { Heart, MessageCircleReply } from '@lucide/svelte';
	import { getCommentVote, setCommentVote } from '$lib/services/votes';
	import { authStore } from '$lib/stores/auth.svelte';
	import type { VoteValue } from '$lib/types';
	let {
		commentId,
		initialScore,
		onreply,
		canReply = true
	}: {
		commentId: string;
		initialScore: number;
		onreply: () => void;
		canReply?: boolean;
	} = $props();
	let score = $derived(initialScore);
	let value = $state<VoteValue | 0>(0);
	let pending = $state(false);
	$effect(() => {
		void authStore.initialized;
		getCommentVote(commentId)
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
		if (pending) return;
		pending = true;
		try {
			const state = await setCommentVote(commentId, value === 1 ? 0 : 1);
			value = state.value;
			score = state.score;
		} finally {
			pending = false;
		}
	}
</script>

<div class="mt-4 flex flex-wrap items-center gap-5 text-xs tracking-wide text-text-muted">
	<button
		class:text-red={value === 1}
		class="inline-flex min-h-9 items-center gap-2 hover:text-red"
		disabled={pending}
		onclick={toggleHeart}
		aria-label={value === 1 ? 'Bỏ tim bình luận' : 'Thả tim bình luận'}
		aria-pressed={value === 1}
		><Heart size={16} fill={value === 1 ? 'currentColor' : 'none'} />
		<span>{score}</span></button
	>
	{#if canReply}<button
			class="inline-flex min-h-9 items-center gap-2 uppercase hover:text-red"
			onclick={onreply}><MessageCircleReply size={15} /> Trả lời</button
		>{/if}
</div>
