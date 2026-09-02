<script lang="ts">
	import { Tabs } from 'bits-ui';
	import { cn } from '$lib/utils';

	let { class: className, ...restProps }: Tabs.ListProps = $props();
</script>

<Tabs.List
	data-slot="tabs-list"
	class={cn('flex min-w-0 items-end gap-6 overflow-x-auto border-b border-border', className)}
	{...restProps}
/>
