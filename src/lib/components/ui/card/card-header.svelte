<script lang="ts">
	import type { HTMLAttributes } from 'svelte/elements';
	import { cn } from '$lib/utils';

	let { class: className, children, ...restProps }: HTMLAttributes<HTMLDivElement> = $props();
</script>

<div data-slot="card-header" class={cn('space-y-1.5 p-5', className)} {...restProps}>
	{@render children?.()}
</div>
