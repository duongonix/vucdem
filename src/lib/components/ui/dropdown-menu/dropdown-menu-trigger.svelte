<script lang="ts">
	import { DropdownMenu } from 'bits-ui';
	import { cn } from '$lib/utils';

	let { class: className, ...restProps }: DropdownMenu.TriggerProps = $props();
</script>

<DropdownMenu.Trigger
	data-slot="dropdown-menu-trigger"
	class={cn('outline-none focus-visible:ring-2 focus-visible:ring-red/50', className)}
	{...restProps}
/>
