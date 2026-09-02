<script lang="ts">
	import { X } from '@lucide/svelte';
	import { STORY_TAG_MAX_COUNT, STORY_TAG_MAX_LENGTH } from '$lib/validation/story';
	let { tags = $bindable<string[]>([]) }: { tags?: string[] } = $props();
	let value = $state('');
	function add() {
		const tag = value.trim().toLocaleLowerCase('vi-VN');
		if (
			tag &&
			tag.length <= STORY_TAG_MAX_LENGTH &&
			tags.length < STORY_TAG_MAX_COUNT &&
			!tags.includes(tag)
		)
			tags = [...tags, tag];
		value = '';
	}
</script>

<div class="space-y-2">
	<div class="flex gap-2">
		<input
			bind:value
			onkeydown={(e) => {
				if (e.key === 'Enter' || e.key === ',') {
					e.preventDefault();
					add();
				}
			}}
			maxlength={STORY_TAG_MAX_LENGTH}
			class="h-10 min-w-0 flex-1 border border-border bg-surface-2 px-3 text-sm text-text outline-none focus:border-red"
			placeholder="Thêm thẻ…"
		/><button
			type="button"
			class="border border-border px-3 text-sm text-text-secondary hover:border-red"
			onclick={add}>Thêm</button
		>
	</div>
	<div class="flex flex-wrap gap-2">
		{#each tags as tag (tag)}<button
				type="button"
				class="inline-flex items-center gap-1 border border-border px-2 py-1 text-xs text-text-secondary hover:border-red"
				onclick={() => (tags = tags.filter((item) => item !== tag))}
				>#{tag}<X class="size-3" /></button
			>{/each}
	</div>
	<p class="text-xs text-text-muted">{tags.length}/{STORY_TAG_MAX_COUNT} thẻ</p>
</div>
