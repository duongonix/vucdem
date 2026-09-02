<script lang="ts">
	import { onMount } from 'svelte';
	import { page } from '$app/state';
	import { authStore } from '$lib/stores/auth.svelte';
	import {
		listConversations,
		listMessages,
		markConversationRead,
		removeConversation,
		sendMessage,
		startConversation,
		toggleConversationMuted,
		watchConversations,
		watchMessages
	} from '$lib/services/messages';
	import type { Conversation, DirectMessage, MessageParticipant } from '$lib/types';
	import ConversationSidebar from './ConversationSidebar.svelte';
	import ChatPanel from './ChatPanel.svelte';
	import NewMessageDialog from './NewMessageDialog.svelte';
	let conversations = $state<Conversation[]>([]);
	let selected = $state<Conversation | null>(null);
	let messages = $state<DirectMessage[]>([]);
	let mobileChatOpen = $state(false);
	let newMessageOpen = $state(false);
	let loading = $state(true);
	let errorMessage = $state('');
	let stopConversations: (() => void) | undefined;
	let stopMessages: (() => void) | undefined;
	const currentUserId = $derived(authStore.user?.id ?? 'current-user');
	onMount(() => {
		void initialize();
		return () => {
			stopConversations?.();
			stopMessages?.();
		};
	});
	async function initialize() {
		try {
			conversations = await listConversations();
			const participantId = page.url.searchParams.get('with');
			if (participantId && participantId !== currentUserId) {
				await begin({
					id: participantId,
					username: '',
					displayName: '',
					avatarUrl: null,
					online: false
				});
			} else if (conversations[0]) await selectConversation(conversations[0], false);
			stopConversations = watchConversations(
				(value) => {
					conversations = value.conversations;
					if (selected) {
						const fresh = conversations.find((item) => item.id === selected?.id);
						if (fresh) {
							selected = { ...fresh, unreadCount: 0 };
							if (fresh.unreadCount > 0) void markConversationRead(fresh.id);
						}
					}
				},
				() => (errorMessage = 'Không thể đồng bộ danh sách tin nhắn.')
			);
		} catch {
			errorMessage = 'Không thể tải tin nhắn.';
		} finally {
			loading = false;
		}
	}
	async function selectConversation(conversation: Conversation, openMobile = true) {
		selected = { ...conversation, unreadCount: 0 };
		mobileChatOpen = openMobile;
		messages = await listMessages(conversation.id);
		stopMessages?.();
		stopMessages = watchMessages(conversation.id, (value) => (messages = value));
		await markConversationRead(conversation.id);
		conversations = conversations.map((item) =>
			item.id === conversation.id ? { ...item, unreadCount: 0 } : item
		);
	}
	async function send(content: string) {
		if (!selected) return;
		const message = await sendMessage(selected.id, currentUserId, content);
		messages = [...messages, message];
		selected = { ...selected, lastMessage: message.content, lastMessageAt: message.createdAt };
		conversations = [selected, ...conversations.filter((item) => item.id !== selected!.id)];
	}
	async function begin(participant: MessageParticipant) {
		const conversation = await startConversation(participant);
		if (!conversations.some((item) => item.id === conversation.id))
			conversations = [conversation, ...conversations];
		await selectConversation(conversation);
	}
	async function mute() {
		if (!selected) return;
		selected = await toggleConversationMuted(selected.id);
		conversations = conversations.map((item) => (item.id === selected!.id ? selected! : item));
	}
	async function remove() {
		if (!selected) return;
		await removeConversation(selected.id);
		conversations = conversations.filter((item) => item.id !== selected!.id);
		selected = conversations[0] ?? null;
		messages = selected ? await listMessages(selected.id) : [];
		mobileChatOpen = false;
	}
</script>

<svelte:head
	><title>Tin nhắn — VỰC ĐÊM</title><meta
		name="description"
		content="Trò chuyện riêng cùng cộng đồng VỰC ĐÊM."
	/></svelte:head
>
<div class="messages-page h-full min-h-0 bg-background text-text">
	{#if loading}<div
			class="message-viewport mx-auto grid max-w-[1440px] grid-cols-[21rem_minmax(0,1fr)] border border-border"
		>
			<div class="border-r border-border p-5">
				{#each [1, 2, 3, 4] as item (item)}<div
						class="mb-4 h-16 animate-pulse bg-surface-2"
					></div>{/each}
			</div>
			<div class="p-8">
				{#each [1, 2, 3] as item (item)}<div
						class="mb-5 h-16 w-2/3 animate-pulse bg-surface-2"
						class:ml-auto={item % 2 === 0}
					></div>{/each}
			</div>
		</div>
	{:else if errorMessage}<div class="message-viewport grid place-items-center border border-border">
			<div class="border border-error/30 bg-surface p-8 text-center">
				<p class="text-error">{errorMessage}</p>
				<button
					class="mt-4 border border-border-red px-4 py-2 text-sm text-red"
					onclick={() => location.reload()}>Thử lại</button
				>
			</div>
		</div>
	{:else}<div
			class:mobile-chat-open={mobileChatOpen}
			class="messages-shell message-viewport mx-auto grid max-w-[1440px] min-w-0 overflow-hidden border border-border bg-background md:grid-cols-[minmax(280px,340px)_minmax(0,1fr)]"
		>
			<div class="conversation-column min-h-0">
				<ConversationSidebar
					{conversations}
					selectedId={selected?.id ?? null}
					onselect={selectConversation}
					onnew={() => (newMessageOpen = true)}
				/>
			</div>
			<div class="chat-column min-h-0 min-w-0">
				<ChatPanel
					conversation={selected}
					{messages}
					{currentUserId}
					onback={() => (mobileChatOpen = false)}
					onsend={send}
					onmute={mute}
					ondelete={remove}
				/>
			</div>
		</div>{/if}
</div>
<NewMessageDialog bind:open={newMessageOpen} onselect={begin} />

<style>
	.messages-page {
		background-image:
			radial-gradient(circle at 86% 12%, rgb(122 16 16 / 12%), transparent 28%),
			linear-gradient(rgb(5 5 5 / 94%), rgb(5 5 5 / 98%)), url('/images/ui/home-right-gothic.png');
		background-size: auto, auto, cover;
		background-position: center;
	}
	.message-viewport {
		height: 100%;
		min-height: 0;
	}
	@media (max-width: 767px) {
		.messages-shell {
			display: block;
		}
		.chat-column {
			display: none;
			height: 100%;
		}
		.conversation-column {
			height: 100%;
		}
		.messages-shell.mobile-chat-open .conversation-column {
			display: none;
		}
		.messages-shell.mobile-chat-open .chat-column {
			display: block;
		}
	}
</style>
