<script lang="ts">
	/* eslint-disable svelte/no-navigation-without-resolve -- dynamic story slugs */
	import { Crown, Eye, Medal } from '@lucide/svelte';
	import type { Story } from '$lib/types';
	import { compactNumber } from '$lib/utils/post';
	import RankingCover from './RankingCover.svelte';
	let { stories }: { stories: Story[] } = $props();
</script>

<div class="grid gap-4 md:grid-cols-3 md:items-end">
	{#each stories as story, index (story.id)}
		<a
			href={`/story/${story.slug}`}
			class={`group relative block border bg-surface p-3 transition hover:-translate-y-1 hover:border-red ${
				index === 0
					? 'border-red-dark md:order-2 md:p-4'
					: index === 1
						? 'border-border-red md:order-1'
						: 'border-border-red md:order-3'
			}`}
		>
			<div
				class={`absolute top-0 left-1/2 z-10 flex -translate-x-1/2 -translate-y-1/2 items-center gap-1 border px-3 py-1 text-xs font-semibold ${
					index === 0
						? 'border-red bg-red-dark text-white'
						: 'border-border-red bg-background text-red'
				}`}
			>
				{#if index === 0}<Crown size={14} />{:else}<Medal size={14} />{/if} TOP {index + 1}
			</div>
			<div class={index === 0 ? 'mt-1 md:-mt-8' : 'mt-1'}><RankingCover {story} /></div>
			<h2
				class={`mt-4 line-clamp-2 font-editorial font-semibold text-text group-hover:text-red-bright ${index === 0 ? 'text-2xl' : 'text-xl'}`}
			>
				{story.title}
			</h2>
			<p class="mt-1 truncate text-xs text-text-muted">bởi {story.authorName}</p>
			<p class="mt-3 flex items-center gap-1.5 text-sm text-red">
				<Eye size={15} />
				{compactNumber(story.viewCount)} lượt đọc
			</p>
		</a>
	{/each}
</div>
