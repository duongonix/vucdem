<script lang="ts">
	import { tick } from 'svelte';
	import type { DirectMessage, MessageParticipant } from '$lib/types';
	import MessageAvatar from './MessageAvatar.svelte';
	let {
		messages,
		participant,
		currentUserId
	}: { messages: DirectMessage[]; participant: MessageParticipant; currentUserId: string } =
		$props();
	let container = $state<HTMLDivElement>();
	const formatTime = (value: string) =>
		new Intl.DateTimeFormat('vi-VN', { hour: '2-digit', minute: '2-digit' }).format(
			new Date(value)
		);
	const statusLabel = { sent: 'Đã gửi', delivered: 'Đã nhận', read: 'Đã xem' } as const;
	export async function scrollToLatest() {
		await tick();
		container?.scrollTo({ top: container.scrollHeight, behavior: 'smooth' });
	}
	$effect(() => {
		void messages.length;
		void scrollToLatest();
	});
</script>

<div class="message-scroll min-h-0 flex-1 overflow-y-auto px-4 py-6 sm:px-7" bind:this={container}>
	<div class="mx-auto max-w-3xl">
		<div
			class="mb-8 flex items-center gap-3 text-[.62rem] tracking-[.16em] text-red-dark uppercase"
		>
			<span class="h-px flex-1 bg-border-red"></span>Hôm nay<span class="h-px flex-1 bg-border-red"
			></span>
		</div>
		{#if messages.length}<div class="grid gap-4">
				{#each messages as message (message.id)}
					{@const sent = message.senderId === currentUserId || message.senderId === 'current-user'}
					<div class={`flex items-end gap-2 ${sent ? 'justify-end' : 'justify-start'}`}>
						{#if !sent}<MessageAvatar
								name={participant.displayName}
								url={participant.avatarUrl}
								size="sm"
							/>{/if}
						<div
							class={`message-bubble max-w-[78%] px-3.5 py-2.5 sm:max-w-[68%] ${sent ? 'sent' : 'received'}`}
						>
							<p class="text-sm leading-6 whitespace-pre-wrap text-text">{message.content}</p>
							<div
								class={`mt-1 flex items-center gap-2 text-[.6rem] text-text-muted ${sent ? 'justify-end' : ''}`}
							>
								<time>{formatTime(message.createdAt)}</time>{#if sent}<span
										>{statusLabel[message.status]}</span
									>{/if}
							</div>
						</div>
					</div>
				{/each}
			</div>{:else}<div class="py-24 text-center">
				<p class="font-editorial text-2xl text-text">Chưa có lời thì thầm nào</p>
				<p class="mt-2 text-sm text-text-muted">Hãy gửi tin nhắn đầu tiên.</p>
			</div>{/if}
	</div>
</div>

<style>
	.message-scroll {
		scrollbar-color: var(--color-red-muted) var(--color-background);
	}
	.message-bubble {
		border-radius: 7px;
	}
	.message-bubble.received {
		border: 1px solid var(--color-border);
		background: #101010;
	}
	.message-bubble.sent {
		border: 1px solid #4a1111;
		background: #210b0b;
		box-shadow: 0 0 12px rgb(122 16 16 / 10%);
	}
</style>
