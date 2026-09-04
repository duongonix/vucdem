<script lang="ts">
	import type { Story } from '$lib/types';
	import { cloudinaryThumbnail } from '$lib/utils/post';
	import ContentCoverFallback from '$lib/components/content/ContentCoverFallback.svelte';
	let { story }: { story: Story } = $props();
</script>

<div class="aspect-[2/3] w-full overflow-hidden border border-border-red bg-surface-2">
	{#if story.cover}<img
			src={cloudinaryThumbnail(story.cover.url, 600)}
			alt={`Bìa truyện ${story.title}`}
			class="size-full object-cover grayscale-[18%]"
			loading="lazy"
			decoding="async"
		/>{:else}<ContentCoverFallback title={story.title} type="story" compact />{/if}
</div>
