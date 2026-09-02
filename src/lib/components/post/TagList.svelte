<script lang="ts">
	let { tags }: { tags: string[] } = $props();
</script>

<div class="flex flex-wrap gap-2" aria-label="Thẻ bài viết">
	{#each tags as tag (tag)}<span class="border border-border-red px-2.5 py-1 text-xs text-red"
			>{tag}</span
		>{/each}
</div>
