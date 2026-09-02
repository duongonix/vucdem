<script lang="ts">
	import { Dialog } from 'bits-ui';
	import { cn } from '$lib/utils';

	let { class: className, ...restProps }: Dialog.DescriptionProps = $props();
</script>

<Dialog.Description
	data-slot="dialog-description"
	class={cn('text-sm leading-6 text-text-secondary', className)}
	{...restProps}
/>
