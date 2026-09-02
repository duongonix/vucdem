<script lang="ts">
	import type { HTMLAttributes } from 'svelte/elements';
	import { cn } from '$lib/utils';

	let { class: className, children, ...restProps }: HTMLAttributes<HTMLParagraphElement> = $props();
</script>

<p
	data-slot="card-description"
	class={cn('text-sm leading-6 text-text-secondary', className)}
	{...restProps}
>
	{@render children?.()}
</p>
