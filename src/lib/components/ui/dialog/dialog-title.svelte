<script lang="ts">
	import { Dialog } from 'bits-ui';
	import { cn } from '$lib/utils';

	let { class: className, ...restProps }: Dialog.TitleProps = $props();
</script>

<Dialog.Title
	data-slot="dialog-title"
	class={cn('font-editorial text-2xl font-semibold tracking-wide text-text', className)}
	{...restProps}
/>
