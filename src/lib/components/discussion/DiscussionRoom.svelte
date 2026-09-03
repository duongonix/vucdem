<script lang="ts">
	import { MessageCircleMore, RotateCcw, UsersRound } from '@lucide/svelte';
	import { onMount } from 'svelte';
	import DiscussionComposer from './DiscussionComposer.svelte';
	import DiscussionMessageItem from './DiscussionMessageItem.svelte';
	import VerifiedBadge from '$lib/components/profile/VerifiedBadge.svelte';
	import { sendDiscussionMessage, watchDiscussionMessages } from '$lib/services/discussion';
	import { authStore } from '$lib/stores/auth.svelte';
	import type { DiscussionMessage } from '$lib/types';

	let messages = $state<DiscussionMessage[]>([]);
	let loading = $state(true);
	let sending = $state(false);
	let errorMessage = $state('');
	let transcript: HTMLDivElement;
	let stopWatching: (() => void) | undefined;
	const participants = $derived.by(() => {
		const unique: DiscussionMessage[] = [];
		for (const message of [...messages].reverse())
			if (!unique.some((participant) => participant.authorId === message.authorId))
				unique.push(message);
		return unique.slice(0, 8);
	});

	function startWatching() {
		stopWatching?.();
		errorMessage = '';
		stopWatching = watchDiscussionMessages(
			(next) => {
				const nearBottom =
					!transcript ||
					transcript.scrollHeight - transcript.scrollTop - transcript.clientHeight < 120;
				messages = next;
				loading = false;
				if (nearBottom)
					requestAnimationFrame(() => transcript?.scrollTo({ top: transcript.scrollHeight }));
			},
			(cause) => {
				loading = false;
				errorMessage = cause instanceof Error ? cause.message : 'Không thể tải phòng chat.';
			}
		);
	}

	async function send(content: string) {
		sending = true;
		errorMessage = '';
		try {
			const message = await sendDiscussionMessage(content);
			if (!messages.some((item) => item.id === message.id)) messages = [...messages, message];
			requestAnimationFrame(() =>
				transcript?.scrollTo({ top: transcript.scrollHeight, behavior: 'smooth' })
			);
			return true;
		} catch (cause) {
			errorMessage = cause instanceof Error ? cause.message : 'Không thể gửi tin nhắn.';
			return false;
		} finally {
			sending = false;
		}
	}

	onMount(() => {
		startWatching();
		return () => stopWatching?.();
	});
</script>

<svelte:head>
	<title>Phòng trò chuyện — VỰC ĐÊM</title>
	<meta name="description" content="Phòng trò chuyện chung của cộng đồng kinh dị VỰC ĐÊM." />
</svelte:head>

<section class="discussion-shell overflow-hidden border border-border bg-surface">
	<header class="relative overflow-hidden border-b border-border px-4 py-4 sm:px-5">
		<div
			class="absolute inset-0 bg-[radial-gradient(circle_at_85%_0%,rgb(122_16_16/18%),transparent_40%)]"
		></div>
		<div class="relative flex items-center justify-between gap-4">
			<div class="flex min-w-0 items-center gap-3">
				<span
					class="grid size-10 shrink-0 place-items-center border border-border-red bg-red-muted/15 text-red"
				>
					<MessageCircleMore size={21} />
				</span>
				<div class="min-w-0">
					<p class="flex items-center gap-2 text-[.65rem] tracking-[.2em] text-red uppercase">
						<span class="size-1.5 animate-pulse rounded-full bg-red"></span> Đang thức
					</p>
					<h1 class="truncate font-editorial text-2xl font-semibold text-text sm:text-3xl">
						Phòng chung Vực Đêm
					</h1>
				</div>
			</div>
			<div class="hidden items-center gap-2 text-xs text-text-muted sm:flex">
				<UsersRound size={15} />
				{participants.length} người vừa lên tiếng
			</div>
		</div>
	</header>

	<div class="grid min-h-0 lg:grid-cols-[minmax(0,1fr)_13rem]">
		<div class="flex min-h-0 min-w-0 flex-col">
			<div
				bind:this={transcript}
				class="transcript min-h-0 flex-1 overflow-y-auto"
				aria-live="polite"
			>
				{#if loading}
					<div class="space-y-5 p-5" aria-label="Đang tải tin nhắn">
						{#each [1, 2, 3, 4] as item (item)}<div class="flex gap-3">
								<div class="size-9 animate-pulse rounded-full bg-surface-2"></div>
								<div class="flex-1 space-y-2">
									<div class="h-3 w-32 animate-pulse bg-surface-2"></div>
									<div class="h-4 w-2/3 animate-pulse bg-surface-2"></div>
								</div>
							</div>{/each}
					</div>
				{:else if messages.length}
					{#each messages as message (message.id)}<DiscussionMessageItem
							{message}
							own={message.authorId === authStore.user?.id}
						/>{/each}
				{:else if !errorMessage}
					<div class="grid min-h-72 place-items-center p-8 text-center">
						<div>
							<MessageCircleMore class="mx-auto mb-3 text-red-muted" size={32} />
							<p class="font-editorial text-2xl text-text">Căn phòng vẫn im lặng.</p>
							<p class="mt-1 text-sm text-text-muted">Hãy là người đầu tiên cất tiếng trong đêm.</p>
						</div>
					</div>
				{/if}
			</div>
			{#if errorMessage}<div
					class="flex items-center justify-between gap-3 border-t border-error/30 bg-error/5 px-4 py-2 text-xs text-error"
					role="alert"
				>
					<span>{errorMessage}</span><button
						class="inline-flex items-center gap-1 hover:text-text"
						onclick={startWatching}><RotateCcw size={13} /> Thử lại</button
					>
				</div>{/if}
			<DiscussionComposer {sending} onsend={send} />
		</div>

		<aside
			class="hidden border-l border-border bg-[#070707] p-4 lg:block"
			aria-label="Người vừa trò chuyện"
		>
			<h2 class="mb-4 text-[.68rem] tracking-[.16em] text-red uppercase">Người vừa lên tiếng</h2>
			{#if participants.length}<ul class="space-y-3">
					{#each participants as participant (participant.authorId)}<li
							class="flex min-w-0 items-center gap-2"
						>
							<span
								class="grid size-8 shrink-0 place-items-center overflow-hidden rounded-full border border-border bg-surface-2 text-xs text-red"
								>{#if participant.authorAvatarUrl}<img
										src={participant.authorAvatarUrl}
										alt=""
										class="size-full object-cover"
									/>{:else}{participant.authorName.slice(0, 1).toUpperCase()}{/if}</span
							>
							<div class="min-w-0">
								<p class="flex items-center gap-1 truncate text-xs text-text">
									{participant.authorName}{#if participant.authorVerified}<VerifiedBadge
											size="sm"
										/>{/if}
								</p>
								<p class="truncate text-[.65rem] text-text-muted">@{participant.authorUsername}</p>
							</div>
						</li>{/each}
				</ul>{:else}<p class="text-xs text-text-muted">Chưa có ai lên tiếng.</p>{/if}
			<div class="mt-6 border-t border-border pt-4 text-xs leading-5 text-text-muted">
				<p class="font-editorial text-base text-text-secondary">Giữ căn phòng an toàn</p>
				<p class="mt-1">
					Tôn trọng người khác, không spam và không chia sẻ nội dung vi phạm quy tắc cộng đồng.
				</p>
			</div>
		</aside>
	</div>
</section>

<style>
	.discussion-shell {
		height: min(50rem, calc(100dvh - 7rem));
		min-height: 35rem;
	}
	.transcript {
		scrollbar-color: var(--red-muted) #070707;
	}
	@media (max-width: 640px) {
		.discussion-shell {
			height: calc(100dvh - 6rem);
			min-height: 31rem;
		}
	}
</style>
