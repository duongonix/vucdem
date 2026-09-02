<script lang="ts">
	let {
		icon,
		title,
		description,
		interactive = false,
		onclick,
		children
	}: {
		icon: import('svelte').Component;
		title: string;
		description: string;
		interactive?: boolean;
		onclick?: () => void;
		children?: import('svelte').Snippet;
	} = $props();
	const rowClass =
		'group flex min-h-[72px] w-full items-center gap-4 border-b border-border px-5 py-3 text-left last:border-b-0 sm:px-6';
</script>

{#snippet content()}{@const Icon = icon}<span
		class="grid size-11 shrink-0 place-items-center rounded-full border border-border-red bg-background text-red transition-colors group-hover:border-red-dark"
		aria-hidden="true"><Icon size={21} strokeWidth={1.7} /></span
	><span class="min-w-0 flex-1"
		><strong class="block text-[.95rem] font-normal text-text">{title}</strong><span
			class="block text-sm leading-5 text-text-muted">{description}</span
		></span
	>{#if children}<span class="shrink-0">{@render children()}</span>{/if}{/snippet}
{#if interactive}<button type="button" {onclick} class={rowClass}>{@render content()}</button
	>{:else}<div class={rowClass}>{@render content()}</div>{/if}
