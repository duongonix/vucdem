<script lang="ts">
	import { Paperclip, Send } from '@lucide/svelte';
	let { onsend }: { onsend: (content: string) => Promise<void> } = $props();
	let content = $state('');
	let sending = $state(false);
	let errorMessage = $state('');
	async function submit() {
		if (!content.trim() || sending) return;
		sending = true;
		errorMessage = '';
		try {
			await onsend(content.trim());
			content = '';
		} catch {
			errorMessage = 'Không thể gửi tin nhắn.';
		} finally {
			sending = false;
		}
	}
	function keydown(event: KeyboardEvent) {
		if (event.key === 'Enter' && !event.shiftKey) {
			event.preventDefault();
			void submit();
		}
	}
</script>

<footer class="border-t border-border-red bg-surface/98 p-3 sm:p-4">
	{#if errorMessage}<p class="mb-2 text-xs text-error" role="alert">{errorMessage}</p>{/if}
	<div class="flex gap-2">
		<button
			class="grid size-11 shrink-0 place-items-center bg-red-muted/35 text-text-muted opacity-45"
			disabled
			title="Tệp đính kèm sẽ được hỗ trợ sau"
			aria-label="Đính kèm tệp — chưa khả dụng"><Paperclip class="size-5" /></button
		>
		<label class="min-w-0 flex-1"
			><span class="sr-only">Nhập tin nhắn</span><textarea
				bind:value={content}
				onkeydown={keydown}
				rows="1"
				maxlength="4000"
				class="max-h-30 min-h-10 w-full resize-none border border-border bg-background px-3 py-2.5 text-sm leading-6 text-text outline-none placeholder:text-text-muted focus:border-red-dark"
				placeholder="Nhập tin nhắn…"></textarea></label
		>
		<button
			class="grid size-11 shrink-0 place-items-center border border-border-red bg-red-muted/35 text-red hover:bg-red-dark hover:text-white disabled:opacity-35"
			disabled={!content.trim() || sending}
			onclick={submit}
			aria-label="Gửi tin nhắn"><Send class="size-5" /></button
		>
	</div>
</footer>
