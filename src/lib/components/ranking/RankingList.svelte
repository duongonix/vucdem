<script lang="ts">
	/* eslint-disable svelte/no-navigation-without-resolve -- dynamic story slugs */
	import { Eye } from '@lucide/svelte';
	import type { Story } from '$lib/types';
	import { compactNumber } from '$lib/utils/post';
	import RankingCover from './RankingCover.svelte';
	let { stories }: { stories: Story[] } = $props();
</script>

<div class="mt-7 border-y border-border">
	{#each stories as story, index (story.id)}
		<a
			href={`/story/${story.slug}`}
			class="group grid min-w-0 grid-cols-[2rem_3.5rem_minmax(0,1fr)] items-center gap-3 border-b border-border py-3 last:border-0 hover:bg-surface-hover sm:grid-cols-[3rem_4rem_minmax(0,1fr)_auto] sm:px-3"
		>
			<span class="font-editorial text-xl text-red-muted">{String(index + 4).padStart(2, '0')}</span
			>
			<div class="w-14"><RankingCover {story} /></div>
			<div class="min-w-0">
				<h3 class="truncate font-editorial text-lg text-text group-hover:text-red">
					{story.title}
				</h3>
				<p class="truncate text-xs text-text-muted">{story.authorName}</p>
				<p class="mt-1 flex items-center gap-1 text-xs text-red sm:hidden">
					<Eye size={13} />
					{compactNumber(story.viewCount)}
				</p>
			</div>
			<p class="hidden items-center gap-2 text-sm text-text-secondary sm:flex">
				<Eye size={15} class="text-red" />
				{compactNumber(story.viewCount)} lượt đọc
			</p>
		</a>
	{/each}
</div>
