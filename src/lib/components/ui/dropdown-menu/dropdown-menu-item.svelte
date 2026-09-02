<script lang="ts">
	import { DropdownMenu } from 'bits-ui';
	import { cn } from '$lib/utils';

	let {
		class: className,
		inset = false,
		...restProps
	}: DropdownMenu.ItemProps & { inset?: boolean } = $props();
</script>

<DropdownMenu.Item
	data-slot="dropdown-menu-item"
	data-inset={inset || undefined}
	class={cn(
		'flex min-h-9 cursor-default items-center gap-2 px-2.5 py-2 text-text-secondary outline-none select-none hover:bg-surface-hover hover:text-text focus:bg-surface-hover focus:text-text data-[disabled]:pointer-events-none data-[disabled]:opacity-50 data-[inset]:pl-8 data-[variant=destructive]:text-red-bright data-[variant=destructive]:focus:bg-red-muted/40',
		className
	)}
	{...restProps}
/>
