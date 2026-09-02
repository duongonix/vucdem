<script lang="ts">
	/* eslint-disable svelte/no-navigation-without-resolve -- profile username is a runtime value */
	import { ArrowLeft, BellOff, MoreVertical, Search, Trash2, UserRound, X } from '@lucide/svelte';
	import type { Conversation, DirectMessage } from '$lib/types';
	import MessageAvatar from './MessageAvatar.svelte';
	import MessageList from './MessageList.svelte';
	import MessageComposer from './MessageComposer.svelte';
	let {
		conversation,
		messages,
		currentUserId,
		onback,
		onsend,
		onmute,
		ondelete
	}: {
		conversation: Conversation | null;
		messages: DirectMessage[];
		currentUserId: string;
		onback: () => void;
		onsend: (content: string) => Promise<void>;
		onmute: () => void;
		ondelete: () => void;
	} = $props();
	let menuOpen = $state(false);
	let searchOpen = $state(false);
	let messageQuery = $state('');
	const visibleMessages = $derived(
		messageQuery.trim()
			? messages.filter((message) =>
					message.content
						.toLocaleLowerCase('vi-VN')
						.includes(messageQuery.trim().toLocaleLowerCase('vi-VN'))
				)
			: messages
	);
</script>

<section
	class="flex h-full min-h-0 min-w-0 flex-col bg-background/92"
	aria-label="Nội dung trò chuyện"
>
	{#if conversation}<header
			class="relative flex min-h-[4.75rem] items-center gap-3 border-b border-border-red bg-surface/96 px-3 sm:px-5"
		>
			<button
				class="grid size-11 shrink-0 place-items-center text-text-muted hover:text-red md:hidden"
				onclick={onback}
				aria-label="Quay lại danh sách trò chuyện"><ArrowLeft class="size-5" /></button
			>
			<MessageAvatar
				name={conversation.participant.displayName}
				url={conversation.participant.avatarUrl}
				online={conversation.participant.online}
			/>
			<div class="min-w-0 flex-1">
				<h1 class="truncate font-editorial text-xl font-semibold text-text">
					{conversation.participant.displayName}
				</h1>
				<p class="text-xs text-text-muted">
					{conversation.participant.online
						? 'Đang hoạt động'
						: `@${conversation.participant.username}`}
				</p>
			</div>
			<button
				class="grid size-11 place-items-center text-text-muted hover:text-red"
				onclick={() => (searchOpen = !searchOpen)}
				aria-label="Tìm trong cuộc trò chuyện"><Search class="size-5" /></button
			>
			<button
				class="grid size-11 place-items-center text-text-muted hover:text-red"
				onclick={() => (menuOpen = !menuOpen)}
				aria-label="Tùy chọn cuộc trò chuyện"><MoreVertical class="size-5" /></button
			>
			{#if menuOpen}<div
					class="absolute top-[calc(100%-6px)] right-4 z-dropdown w-52 border border-border-red bg-surface py-1 shadow-2xl"
				>
					<a
						class="flex min-h-10 items-center gap-3 px-3 text-sm text-text-secondary hover:bg-surface-hover hover:text-text"
						href={`/u/${conversation.participant.username}`}
						><UserRound class="size-4" /> Xem hồ sơ</a
					>
					<button
						class="flex min-h-10 w-full items-center gap-3 px-3 text-sm text-text-secondary hover:bg-surface-hover hover:text-text"
						onclick={() => {
							onmute();
							menuOpen = false;
						}}
						><BellOff class="size-4" />
						{conversation.muted ? 'Bật thông báo' : 'Tắt thông báo'}</button
					>
					<button
						class="flex min-h-10 w-full items-center gap-3 px-3 text-sm text-error hover:bg-error/10"
						onclick={() => {
							if (confirm('Ẩn cuộc trò chuyện này khỏi danh sách của bạn?')) ondelete();
						}}><Trash2 class="size-4" /> Xóa cuộc trò chuyện</button
					>
				</div>{/if}
		</header>
		{#if searchOpen}<div
				class="flex items-center gap-2 border-b border-border bg-surface px-4 py-2"
			>
				<Search class="size-4 text-text-muted" /><input
					bind:value={messageQuery}
					class="h-9 min-w-0 flex-1 bg-transparent text-sm text-text outline-none"
					placeholder="Tìm nội dung tin nhắn…"
					aria-label="Tìm nội dung tin nhắn"
				/><button
					class="grid size-9 place-items-center text-text-muted"
					onclick={() => {
						searchOpen = false;
						messageQuery = '';
					}}
					aria-label="Đóng tìm kiếm"><X class="size-4" /></button
				>
			</div>{/if}
		<MessageList
			messages={visibleMessages}
			participant={conversation.participant}
			{currentUserId}
		/>
		<MessageComposer {onsend} />
	{:else}<div class="grid h-full place-items-center p-8 text-center">
			<div>
				<span class="mx-auto grid size-16 place-items-center border border-border-red text-red-dark"
					><MoreVertical class="size-7 rotate-90" /></span
				>
				<h1 class="mt-5 font-editorial text-3xl text-text">Tin nhắn</h1>
				<p class="mt-2 text-sm text-text-muted">Chọn một cuộc trò chuyện để bước vào màn đêm.</p>
			</div>
		</div>{/if}
</section>
