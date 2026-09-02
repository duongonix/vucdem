<script lang="ts">
	import { Tabs } from 'bits-ui';
	import { cn } from '$lib/utils';

	let { class: className, ...restProps }: Tabs.TriggerProps = $props();
</script>

<Tabs.Trigger
	data-slot="tabs-trigger"
	class={cn(
		'relative -mb-px h-11 shrink-0 border-b-2 border-transparent px-1 text-sm text-text-secondary transition-colors outline-none hover:text-text focus-visible:ring-2 focus-visible:ring-red/40 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:border-red data-[state=active]:text-red-bright',
		className
	)}
	{...restProps}
/>
