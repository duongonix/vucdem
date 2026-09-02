<script lang="ts">
	import { DropdownMenu } from 'bits-ui';
	import { cn } from '$lib/utils';

	let { class: className, ...restProps }: DropdownMenu.SeparatorProps = $props();
</script>

<DropdownMenu.Separator
	data-slot="dropdown-menu-separator"
	class={cn('-mx-1.5 my-1 h-px bg-border', className)}
	{...restProps}
/>
