<script lang="ts">
	import { resolve } from '$app/paths';
	import { EyeOff, Image, LoaderCircle, Send, Smile } from '@lucide/svelte';
	import { authStore } from '$lib/stores/auth.svelte';
	import { COMMENT_MAX_LENGTH } from '$lib/validation/comment';
	let {
		placeholder = 'Chia sẻ suy nghĩ của bạn…',
		compact = false,
		onsubmit
	}: {
		placeholder?: string;
		compact?: boolean;
		onsubmit: (content: string, isSpoiler: boolean) => Promise<void>;
	} = $props();
	let content = $state('');
	let pending = $state(false);
	let error = $state('');
	let isSpoiler = $state(false);
	async function submit() {
		if (!authStore.firebaseUser) {
			location.href =
				resolve('/auth/login') +
				`?redirect=${encodeURIComponent(location.pathname + location.search)}`;
			return;
		}
		const value = content.trim();
		if (!value || pending) return;
		pending = true;
		error = '';
		try {
			await onsubmit(value, isSpoiler);
			content = '';
			isSpoiler = false;
		} catch (cause) {
			error = cause instanceof Error ? cause.message : 'Không thể gửi bình luận.';
		} finally {
			pending = false;
		}
	}
</script>

<div class={`flex min-w-0 items-start ${compact ? 'gap-0 sm:gap-3' : 'gap-3 sm:gap-4'}`}>
	<div class={`mt-1 shrink-0 ${compact ? 'hidden sm:block' : ''}`}>
		{#if authStore.user?.avatar?.url}<img
				class="size-9 rounded-full border border-border-red object-cover sm:size-12"
				src={authStore.user.avatar.url}
				alt=""
			/>{:else}<span
				class="grid size-9 place-items-center rounded-full border border-border-red bg-surface-2 font-editorial text-lg text-red sm:size-12"
				>{authStore.user?.displayName?.slice(0, 1).toUpperCase() ?? 'V'}</span
			>{/if}
	</div>
	<div
		class="min-w-0 flex-1 border border-border bg-surface/80 transition-colors focus-within:border-border-red"
	>
		<label class="sr-only" for={compact ? 'reply-content' : 'comment-content'}>{placeholder}</label>
		<textarea
			id={compact ? 'reply-content' : 'comment-content'}
			bind:value={content}
			maxlength={COMMENT_MAX_LENGTH}
			rows={compact ? 2 : 3}
			class="w-full resize-y bg-transparent px-4 py-3 text-sm leading-6 text-text outline-none placeholder:text-text-muted sm:text-base"
			{placeholder}></textarea>
		<div
			class="flex min-h-12 min-w-0 flex-wrap items-center justify-between gap-1 border-t border-border px-2 sm:gap-3 sm:px-3"
		>
			<div class="flex min-w-0 items-center gap-0.5 text-text-muted sm:gap-1">
				{#if !compact}<button
						class="grid size-9 place-items-center opacity-60"
						disabled
						aria-label="Biểu tượng cảm xúc — chưa hỗ trợ"><Smile size={18} /></button
					><button
						class="grid size-9 place-items-center opacity-60"
						disabled
						aria-label="Ảnh — chưa hỗ trợ"><Image size={18} /></button
					>{/if}
				<button
					type="button"
					class="inline-flex min-h-9 shrink-0 items-center gap-1.5 px-1.5 text-xs transition-colors sm:px-2"
					class:text-red={isSpoiler}
					class:text-text-muted={!isSpoiler}
					aria-pressed={isSpoiler}
					onclick={() => (isSpoiler = !isSpoiler)}
					><EyeOff size={16} /><span class={compact ? 'hidden min-[380px]:inline' : ''}
						>Spoiler</span
					></button
				>
				<span class="hidden text-[0.68rem] sm:inline">{content.length}/{COMMENT_MAX_LENGTH}</span>
			</div>
			<button
				class="inline-flex min-h-9 shrink-0 items-center gap-1.5 border border-border-red bg-red-muted/20 px-3 text-xs tracking-wide text-red uppercase hover:border-red hover:text-red-bright disabled:opacity-40 sm:gap-2 sm:px-4"
				disabled={pending || !content.trim()}
				onclick={submit}
				>{#if pending}<LoaderCircle class="animate-spin" size={14} />{:else}<Send size={14} />{/if}
				{compact ? 'Gửi' : 'Gửi bình luận'}</button
			>
		</div>
		{#if error}<p class="border-t border-border px-3 py-2 text-xs text-error" role="alert">
				{error}
			</p>{/if}
	</div>
</div>
