<script lang="ts">
	import { BellOff, Plus, Search } from '@lucide/svelte';
	import type { Conversation } from '$lib/types';
	import MessageAvatar from './MessageAvatar.svelte';
	let {
		conversations,
		selectedId = null,
		onselect,
		onnew
	}: {
		conversations: Conversation[];
		selectedId?: string | null;
		onselect: (conversation: Conversation) => void;
		onnew: () => void;
	} = $props();
	let query = $state('');
	let filter = $state<'all' | 'unread'>('all');
	const filtered = $derived(
		conversations.filter(
			(item) =>
				(filter === 'all' || item.unreadCount > 0) &&
				`${item.participant.displayName} ${item.participant.username} ${item.lastMessage}`
					.toLocaleLowerCase('vi-VN')
					.includes(query.trim().toLocaleLowerCase('vi-VN'))
		)
	);
	const formatTime = (value: string) =>
		new Intl.DateTimeFormat('vi-VN', { hour: '2-digit', minute: '2-digit' }).format(
			new Date(value)
		);
</script>

<aside
	class="flex h-full min-h-0 flex-col border-r border-border bg-surface/95"
	aria-label="Các cuộc trò chuyện"
>
	<div class="border-b border-border-red px-4 pb-4">
		<button
			class="mt-5 flex min-h-11 w-full items-center justify-center gap-2 border border-border-red bg-red-muted/30 text-sm font-semibold text-red hover:bg-red-muted/50 hover:text-red-bright"
			onclick={onnew}><Plus class="size-4" /> Tin nhắn mới</button
		>
		<label class="relative mt-4 block"
			><span class="sr-only">Tìm kiếm cuộc trò chuyện</span><Search
				class="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-text-muted"
			/><input
				bind:value={query}
				class="h-11 w-full border border-border bg-background pr-3 pl-10 text-sm text-text outline-none focus:border-red-dark"
				placeholder="Tìm kiếm cuộc trò chuyện…"
			/></label
		>
		<div class="mt-3 grid grid-cols-2 border-b border-border" aria-label="Lọc cuộc trò chuyện">
			<button
				class="min-h-10 border-b-2 text-xs"
				class:border-red={filter === 'all'}
				class:border-transparent={filter !== 'all'}
				class:text-red={filter === 'all'}
				class:text-text-muted={filter !== 'all'}
				onclick={() => (filter = 'all')}>Tất cả</button
			>
			<button
				class="min-h-10 border-b-2 text-xs"
				class:border-red={filter === 'unread'}
				class:border-transparent={filter !== 'unread'}
				class:text-red={filter === 'unread'}
				class:text-text-muted={filter !== 'unread'}
				onclick={() => (filter = 'unread')}>Chưa đọc</button
			>
		</div>
	</div>
	<div class="min-h-0 flex-1 overflow-y-auto">
		{#if filtered.length}{#each filtered as conversation (conversation.id)}<button
					class={`relative flex w-full gap-3 border-b border-border px-4 py-4 text-left transition-colors hover:bg-surface-hover ${selectedId === conversation.id ? 'bg-red-muted/20' : ''}`}
					onclick={() => onselect(conversation)}
					aria-current={selectedId === conversation.id ? 'true' : undefined}
				>
					{#if selectedId === conversation.id}<span class="absolute inset-y-0 left-0 w-0.5 bg-red"
						></span>{/if}
					<MessageAvatar
						name={conversation.participant.displayName}
						url={conversation.participant.avatarUrl}
						online={conversation.participant.online}
						size="lg"
					/>
					<span class="min-w-0 flex-1"
						><span class="flex items-center gap-2"
							><strong
								class={`min-w-0 flex-1 truncate text-sm ${conversation.unreadCount ? 'text-text' : 'font-medium text-text-secondary'}`}
								>{conversation.participant.displayName}</strong
							>{#if conversation.muted}<BellOff class="size-3 text-text-muted" />{/if}<time
								class="text-[.62rem] text-text-muted">{formatTime(conversation.lastMessageAt)}</time
							></span
						><span class="mt-1 flex items-center gap-2"
							><span
								class={`min-w-0 flex-1 truncate text-xs ${conversation.unreadCount ? 'text-text-secondary' : 'text-text-muted'}`}
								>{conversation.lastMessage}</span
							>{#if conversation.unreadCount}<span
									class="grid min-w-5 place-items-center bg-red-dark px-1 text-[.62rem] text-white"
									>{conversation.unreadCount}</span
								>{/if}</span
						></span
					>
				</button>{/each}
		{:else}<div class="px-6 py-14 text-center">
				<p class="font-editorial text-xl text-text">Chưa có cuộc trò chuyện</p>
				<p class="mt-2 text-xs leading-5 text-text-muted">Hãy gửi một lời thì thầm vào màn đêm.</p>
				<button class="mt-4 text-xs text-red hover:text-red-bright" onclick={onnew}
					>Bắt đầu trò chuyện</button
				>
			</div>{/if}
	</div>
</aside>
