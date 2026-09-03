<script lang="ts">
	import { resolve } from '$app/paths';
	let { tags, category }: { tags: string[]; category?: { id: string; label: string } } = $props();
</script>

<div class="flex flex-wrap gap-2" aria-label="Thẻ bài viết">
	{#if category}<a
			href={resolve('/category/[slug]', { slug: category.id })}
			class="border border-border-red px-2.5 py-1 text-xs text-red hover:bg-red-muted/20"
			>{category.label}</a
		>{/if}
	{#each tags as tag (tag)}<a
			href={resolve('/tag/[slug]', { slug: tag })}
			class="border border-border-red px-2.5 py-1 text-xs text-red hover:bg-red-muted/20">#{tag}</a
		>{/each}
</div>
