<script lang="ts">
	import { Dialog } from 'bits-ui';
	import { cn } from '$lib/utils';

	let { class: className, ...restProps }: Dialog.OverlayProps = $props();
</script>

<Dialog.Overlay
	data-slot="dialog-overlay"
	class={cn(
		'data-[state=closed]:animate-out data-[state=open]:animate-in fixed inset-0 z-overlay bg-black/80',
		className
	)}
	{...restProps}
/>
