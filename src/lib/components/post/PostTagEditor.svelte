<script lang="ts">
	import { Plus, X } from '@lucide/svelte';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { normalizeTag, POST_TAG_MAX_COUNT, POST_TAG_MAX_LENGTH } from '$lib/validation/post';

	let { tags = $bindable<string[]>([]) }: { tags?: string[] } = $props();
	let value = $state('');
	let errorMessage = $state('');

	function add() {
		const tag = normalizeTag(value);
		errorMessage = '';
		if (!tag) return;
		if (tag.length > POST_TAG_MAX_LENGTH) {
			errorMessage = `Mỗi thẻ tối đa ${POST_TAG_MAX_LENGTH} ký tự.`;
			return;
		}
		if (tags.includes(tag)) {
			errorMessage = 'Thẻ này đã tồn tại.';
			return;
		}
		if (tags.length >= POST_TAG_MAX_COUNT) {
			errorMessage = `Tối đa ${POST_TAG_MAX_COUNT} thẻ.`;
			return;
		}
		tags = [...tags, tag];
		value = '';
	}

	function keydown(event: KeyboardEvent) {
		if (event.key === 'Enter' || event.key === ',') {
			event.preventDefault();
			add();
		}
	}
</script>

<div>
	<div class="flex gap-2">
		<Input
			bind:value
			onkeydown={keydown}
			maxlength={POST_TAG_MAX_LENGTH}
			placeholder="bí ẩn, tâm linh…"
			aria-label="Thẻ"
		/>
		<Button type="button" size="icon" variant="outline" onclick={add} aria-label="Thêm thẻ"
			><Plus class="size-4" /></Button
		>
	</div>
	{#if tags.length}
		<div class="mt-3 flex flex-wrap gap-2">
			{#each tags as tag (tag)}
				<span
					class="inline-flex items-center gap-1 border border-border-red bg-red-muted/15 px-2 py-1 text-xs text-text-secondary"
					>#{tag}<button
						type="button"
						class="text-text-muted hover:text-red-bright"
						onclick={() => (tags = tags.filter((item) => item !== tag))}
						aria-label={`Xóa thẻ ${tag}`}><X class="size-3" /></button
					></span
				>
			{/each}
		</div>
	{/if}
	{#if errorMessage}<p role="alert" class="mt-2 text-xs text-error">{errorMessage}</p>{/if}
</div>
