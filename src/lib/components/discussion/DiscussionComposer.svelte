<script lang="ts">
	/* eslint-disable svelte/no-navigation-without-resolve -- login URL includes a dynamic redirect query */
	import { resolve } from '$app/paths';
	import { Send } from '@lucide/svelte';
	import { authStore } from '$lib/stores/auth.svelte';
	let { sending, onsend }: { sending: boolean; onsend: (content: string) => Promise<boolean> } =
		$props();
	let content = $state('');

	async function submit() {
		if (sending || !content.trim()) return;
		if (await onsend(content)) content = '';
	}
</script>

<footer class="border-t border-border bg-[#070707] p-3 sm:p-4">
	{#if authStore.status === 'authenticated'}
		<form
			class="flex min-w-0 items-end gap-2"
			onsubmit={(event) => {
				event.preventDefault();
				void submit();
			}}
		>
			<label for="discussion-message" class="sr-only">Tin nhắn gửi vào phòng chung</label>
			<textarea
				id="discussion-message"
				bind:value={content}
				rows="1"
				maxlength="1000"
				placeholder="Nói gì đó với những người trong bóng tối…"
				class="max-h-32 min-h-11 min-w-0 flex-1 resize-y border border-border bg-surface px-3 py-2.5 text-sm text-text outline-none placeholder:text-text-muted focus:border-red-dark"
				onkeydown={(event) => {
					if (event.key === 'Enter' && !event.shiftKey) {
						event.preventDefault();
						void submit();
					}
				}}></textarea>
			<button
				type="submit"
				disabled={sending || !content.trim()}
				class="grid size-11 shrink-0 place-items-center border border-border-red bg-red-muted/20 text-red transition hover:bg-red-muted/40 hover:text-red-bright disabled:cursor-not-allowed disabled:opacity-40"
				aria-label="Gửi tin nhắn"><Send size={18} /></button
			>
		</form>
		<div class="mt-2 flex justify-between text-[.65rem] text-text-muted">
			<span>Enter để gửi · Shift + Enter để xuống dòng</span><span>{content.length}/1000</span>
		</div>
	{:else}
		<div class="flex flex-wrap items-center justify-between gap-3 text-sm text-text-muted">
			<span>Đăng nhập để tham gia cuộc trò chuyện.</span>
			<a
				href={`${resolve('/auth/login')}?redirect=${encodeURIComponent('/discussion')}`}
				class="border border-border-red px-4 py-2 text-red hover:bg-red-muted/20">Đăng nhập</a
			>
		</div>
	{/if}
</footer>
