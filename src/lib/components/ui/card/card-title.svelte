<script lang="ts">
	import type { HTMLAttributes } from 'svelte/elements';
	import { cn } from '$lib/utils';

	let { class: className, children, ...restProps }: HTMLAttributes<HTMLHeadingElement> = $props();
</script>

<h3
	data-slot="card-title"
	class={cn('font-editorial text-2xl font-semibold', className)}
	{...restProps}
>
	{@render children?.()}
</h3>
