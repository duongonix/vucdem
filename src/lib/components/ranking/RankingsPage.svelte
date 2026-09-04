<script lang="ts">
	import { BookOpen, LoaderCircle, Trophy } from '@lucide/svelte';
	import { onMount } from 'svelte';
	import type { Story } from '$lib/types';
	import type { StoryFormat } from '$lib/types/story';
	import { getStoryRankings } from '$lib/services/rankings';
	import RankingPodium from './RankingPodium.svelte';
	import RankingList from './RankingList.svelte';

	let active = $state<StoryFormat>('short');
	let short = $state<Story[]>([]);
	let serial = $state<Story[]>([]);
	let loading = $state(true);
	let errorMessage = $state('');
	const stories = $derived(active === 'short' ? short : serial);

	onMount(async () => {
		try {
			({ short, serial } = await getStoryRankings());
		} catch (reason) {
			errorMessage = reason instanceof Error ? reason.message : 'Không thể tải bảng xếp hạng.';
		} finally {
			loading = false;
		}
	});
</script>

<svelte:head><title>Bảng xếp hạng truyện — VỰC ĐÊM</title></svelte:head>

<section class="mx-auto max-w-5xl min-w-0 py-2" aria-labelledby="ranks-title">
	<header
		class="relative overflow-hidden border-b border-border-red px-4 py-8 text-center sm:py-10"
	>
		<Trophy class="mx-auto size-8 text-red" />
		<p class="mt-3 text-xs tracking-[.28em] text-red uppercase">Danh vọng trong bóng tối</p>
		<h1 id="ranks-title" class="mt-2 font-editorial text-4xl font-semibold text-text sm:text-6xl">
			Bảng xếp hạng
		</h1>
		<p class="mx-auto mt-3 max-w-xl text-sm leading-6 text-text-muted">
			Mười câu chuyện được đọc nhiều nhất, nơi những lời kể không chịu chìm vào quên lãng.
		</p>
	</header>

	<div class="mt-6 grid grid-cols-2 border border-border" role="tablist" aria-label="Loại truyện">
		{#each [{ value: 'short', label: 'Truyện ngắn' }, { value: 'serial', label: 'Truyện dài' }] as tab (tab.value)}
			<button
				type="button"
				role="tab"
				aria-selected={active === tab.value}
				onclick={() => (active = tab.value as StoryFormat)}
				class={`flex min-h-12 items-center justify-center gap-2 border-r border-border text-sm last:border-r-0 sm:text-base ${active === tab.value ? 'bg-red-dark/35 text-red' : 'text-text-secondary hover:bg-surface-hover hover:text-text'}`}
			>
				<BookOpen size={16} />
				{tab.label}
			</button>
		{/each}
	</div>

	<div class="mt-10" role="tabpanel">
		{#if loading}<div class="flex min-h-64 items-center justify-center gap-2 text-text-muted">
				<LoaderCircle class="size-5 animate-spin" /> Đang tìm những câu chuyện vang danh…
			</div>{:else if errorMessage}<div class="border border-error/40 p-8 text-center text-error">
				{errorMessage}
			</div>{:else if stories.length}<RankingPodium stories={stories.slice(0, 3)} />
			<RankingList stories={stories.slice(3, 10)} />{:else}<div
				class="border border-dashed border-border p-12 text-center text-text-muted"
			>
				Chưa có truyện nào bước lên bảng danh vọng này.
			</div>{/if}
	</div>
</section>
