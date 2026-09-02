<script lang="ts">
	import type { HTMLInputAttributes } from 'svelte/elements';
	import { cn } from '$lib/utils';

	let { class: className, value = $bindable(), ...restProps }: HTMLInputAttributes = $props();
</script>

<input
	data-slot="input"
	class={cn(
		'h-10 w-full min-w-0 border border-border bg-surface-2 px-3 py-2 text-sm text-text transition-[border-color,background-color] outline-none placeholder:text-text-muted hover:border-zinc-700 focus-visible:border-red focus-visible:ring-2 focus-visible:ring-red/25 disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-error aria-invalid:ring-error/20',
		className
	)}
	bind:value
	{...restProps}
/>
