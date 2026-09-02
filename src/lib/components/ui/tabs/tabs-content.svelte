<script lang="ts">
	import { Tabs } from 'bits-ui';
	import { cn } from '$lib/utils';

	let { class: className, ...restProps }: Tabs.ContentProps = $props();
</script>

<Tabs.Content
	data-slot="tabs-content"
	class={cn('py-5 outline-none focus-visible:ring-2 focus-visible:ring-red/40', className)}
	{...restProps}
/>
