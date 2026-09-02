<script lang="ts">
	import { DropdownMenu } from 'bits-ui';
	import { cn } from '$lib/utils';

	let { class: className, sideOffset = 6, ...restProps }: DropdownMenu.ContentProps = $props();
</script>

<DropdownMenu.Portal>
	<DropdownMenu.Content
		data-slot="dropdown-menu-content"
		{sideOffset}
		class={cn(
			'data-[state=closed]:animate-out data-[state=open]:animate-in z-dropdown min-w-44 border border-border bg-surface-2 p-1.5 text-sm text-text shadow-xl shadow-black/50 outline-none',
			className
		)}
		{...restProps}
	/>
</DropdownMenu.Portal>
