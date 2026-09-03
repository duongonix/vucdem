<script lang="ts">
	import { LoaderCircle, Search } from '@lucide/svelte';
	import { getTagSuggestions, type TagSuggestion } from '$lib/services/tags';
	let {
		query,
		selected,
		onselect
	}: { query: string; selected: string[]; onselect: (tag: string) => void } = $props();
	let suggestions = $state<TagSuggestion[]>([]);
	let loading = $state(false);
	let failed = $state(false);
	const visible = $derived(suggestions.filter((tag) => !selected.includes(tag.name)));

	$effect(() => {
		const value = query.trim();
		if (!value) {
			suggestions = [];
			loading = false;
			return;
		}
		const controller = new AbortController();
		const timer = window.setTimeout(async () => {
			loading = true;
			failed = false;
			try {
				suggestions = await getTagSuggestions(value, controller.signal);
			} catch (cause) {
				if ((cause as { name?: string })?.name !== 'AbortError') {
					suggestions = [];
					failed = true;
				}
			} finally {
				if (!controller.signal.aborted) loading = false;
			}
		}, 250);
		return () => {
			window.clearTimeout(timer);
			controller.abort();
		};
	});
</script>

{#if query.trim()}
	<div
		class="absolute top-[calc(100%+.35rem)] right-0 left-0 z-dropdown border border-border-red bg-[#080808] shadow-[0_18px_45px_rgb(0_0_0/70%)]"
		role="listbox"
		aria-label="Tag tương tự"
	>
		{#if loading}
			<p class="flex items-center gap-2 px-3 py-3 text-xs text-text-muted">
				<LoaderCircle class="size-3.5 animate-spin" /> Đang tìm tag…
			</p>
		{:else if visible.length}
			{#each visible as tag (tag.id)}
				<button
					type="button"
					role="option"
					aria-selected="false"
					class="flex w-full items-center justify-between gap-3 border-b border-border px-3 py-2.5 text-left last:border-b-0 hover:bg-surface-hover focus:bg-surface-hover focus:outline-none"
					onclick={() => onselect(tag.name)}
				>
					<span class="flex min-w-0 items-center gap-2 text-sm text-text"
						><Search size={13} class="shrink-0 text-red" /><span class="truncate">#{tag.name}</span
						></span
					>
					<span class="shrink-0 text-[.65rem] text-text-muted">{tag.count} nội dung</span>
				</button>
			{/each}
		{:else}
			<p class="px-3 py-3 text-xs text-text-muted">
				{failed ? 'Không thể tải gợi ý.' : 'Chưa có tag tương tự.'}
			</p>
		{/if}
	</div>
{/if}
