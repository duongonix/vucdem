<script lang="ts">
	import type { HTMLAttributes } from 'svelte/elements';
	import { cn } from '$lib/utils';

	let { class: className, children, ...restProps }: HTMLAttributes<HTMLDivElement> = $props();
</script>

<div data-slot="dialog-header" class={cn('space-y-2 pr-8', className)} {...restProps}>
	{@render children?.()}
</div>
