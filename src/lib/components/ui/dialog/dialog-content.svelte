<script lang="ts">
	import { X } from '@lucide/svelte';
	import { Dialog } from 'bits-ui';
	import { cn } from '$lib/utils';
	import DialogOverlay from './dialog-overlay.svelte';

	let { class: className, children, ...restProps }: Dialog.ContentProps = $props();
</script>

<Dialog.Portal>
	<DialogOverlay />
	<Dialog.Content
		data-slot="dialog-content"
		class={cn(
			'fixed top-1/2 left-1/2 z-dialog grid w-[calc(100%-2rem)] max-w-lg -translate-x-1/2 -translate-y-1/2 gap-5 border border-border bg-surface p-5 text-text shadow-2xl shadow-black/60 outline-none sm:p-6',
			className
		)}
		{...restProps}
	>
		{@render children?.()}
		<Dialog.Close
			class="absolute top-3 right-3 grid size-11 place-items-center text-text-secondary transition-colors outline-none hover:bg-surface-hover hover:text-text focus-visible:ring-2 focus-visible:ring-red/50"
			aria-label="Đóng hộp thoại"
		>
			<X aria-hidden="true" class="size-4" />
		</Dialog.Close>
	</Dialog.Content>
</Dialog.Portal>
