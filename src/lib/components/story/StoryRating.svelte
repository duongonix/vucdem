<script lang="ts">
	/* eslint-disable svelte/no-navigation-without-resolve -- login redirect preserves current dynamic URL */
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { Star } from '@lucide/svelte';
	import { getStoryRating, rateStory } from '$lib/services/story-ratings';
	import { authStore } from '$lib/stores/auth.svelte';
	let {
		storyId,
		initialAverage = 0,
		initialCount = 0
	}: { storyId: string; initialAverage?: number; initialCount?: number } = $props();
	let value = $state(0);
	let hoverValue = $state(0);
	let average = $state(0);
	let count = $state(0);
	let pending = $state(false);
	let errorMessage = $state('');
	let loadVersion = 0;

	$effect(() => {
		void storyId;
		void authStore.status;
		average = initialAverage;
		count = initialCount;
		const version = ++loadVersion;
		void getStoryRating(storyId)
			.then((state) => {
				if (version !== loadVersion) return;
				value = state.value;
				average = state.average;
				count = state.count;
			})
			.catch(() => undefined);
	});

	async function select(next: number) {
		if (authStore.status !== 'authenticated') {
			await goto(`${resolve('/auth/login')}?redirect=${encodeURIComponent(location.pathname)}`);
			return;
		}
		if (pending) return;
		const previous = value;
		value = next;
		pending = true;
		errorMessage = '';
		try {
			const state = await rateStory(storyId, next);
			value = state.value;
			average = state.average;
			count = state.count;
		} catch (reason) {
			value = previous;
			errorMessage = reason instanceof Error ? reason.message : 'Không thể cập nhật đánh giá.';
		} finally {
			pending = false;
		}
	}
</script>

<section class="mt-6 border-y border-border py-4" aria-label="Đánh giá truyện">
	<div class="flex flex-wrap items-center gap-x-4 gap-y-2">
		<div class="flex" role="group" aria-label="Chọn số sao" onmouseleave={() => (hoverValue = 0)}>
			{#each [1, 2, 3, 4, 5] as star (star)}
				<button
					type="button"
					class="grid size-8 place-items-center text-text-muted transition hover:text-red-bright focus-visible:outline-2 focus-visible:outline-red"
					class:text-red={star <= (hoverValue || value)}
					disabled={pending}
					onmouseenter={() => (hoverValue = star)}
					onfocus={() => (hoverValue = star)}
					onblur={() => (hoverValue = 0)}
					onclick={() => select(star)}
					aria-label={`Đánh giá ${star} sao`}
					aria-pressed={value === star}
				>
					<Star class="size-5" fill={star <= (hoverValue || value) ? 'currentColor' : 'none'} />
				</button>
			{/each}
		</div>
		<p class="text-sm text-text-secondary">
			<strong class="font-editorial text-xl text-text">{average.toFixed(1)}</strong>/5
			<span class="ml-2 text-text-muted">({count} lượt đánh giá)</span>
		</p>
	</div>
	{#if value}<p class="mt-1 text-xs text-red">Bạn đã đánh giá {value} sao.</p>{/if}
	{#if errorMessage}<p class="mt-2 text-xs text-error" role="alert">{errorMessage}</p>{/if}
</section>
