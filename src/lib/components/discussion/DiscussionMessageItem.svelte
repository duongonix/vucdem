<script lang="ts">
	import { resolve } from '$app/paths';
	import VerifiedBadge from '$lib/components/profile/VerifiedBadge.svelte';
	import type { DiscussionMessage } from '$lib/types';
	let { message, own = false }: { message: DiscussionMessage; own?: boolean } = $props();
	const sentAt = $derived(new Date(message.createdAt));
</script>

<article class:own class="message-row flex min-w-0 items-start gap-3 px-4 py-3 sm:px-5">
	<a
		href={resolve('/u/[username]', { username: message.authorUsername })}
		class="grid size-9 shrink-0 place-items-center overflow-hidden rounded-full border border-border-red bg-surface-2 font-editorial text-red"
		tabindex="-1"
	>
		{#if message.authorAvatarUrl}<img
				src={message.authorAvatarUrl}
				alt=""
				class="size-full object-cover"
			/>{:else}{message.authorName.slice(0, 1).toLocaleUpperCase('vi-VN')}{/if}
	</a>
	<div class="min-w-0 flex-1">
		<div class="flex flex-wrap items-center gap-x-2 gap-y-0.5">
			<a
				href={resolve('/u/[username]', { username: message.authorUsername })}
				class="font-editorial text-base font-semibold text-red hover:text-red-bright"
				>{message.authorName}</a
			>
			{#if message.authorVerified}<VerifiedBadge size="sm" />{/if}
			<span class="text-[.68rem] text-text-muted">@{message.authorUsername}</span>
			<time datetime={message.createdAt} class="text-[.68rem] text-text-muted">
				{sentAt.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
			</time>
		</div>
		<p class="mt-1 text-sm leading-6 break-words whitespace-pre-wrap text-text-secondary">
			{message.content}
		</p>
	</div>
</article>

<style>
	.message-row {
		border-bottom: 1px solid color-mix(in srgb, var(--border) 60%, transparent);
	}
	.message-row:hover,
	.message-row.own {
		background: linear-gradient(90deg, rgb(77 18 18 / 10%), transparent 72%);
	}
</style>
