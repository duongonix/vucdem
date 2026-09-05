<script lang="ts">
	import { Check, Eye, LoaderCircle, RotateCcw, X } from '@lucide/svelte';
	import { onMount } from 'svelte';
	import {
		listApprovalQueue,
		getApprovalDetail,
		reviewApproval,
		type ApprovalChapter,
		type ApprovalPost,
		type ApprovalQueue,
		type ApprovalStory
	} from '$lib/services/approvals';
	import InteractiveStoryPlayer from '$lib/components/story/interactive/InteractiveStoryPlayer.svelte';
	import type { InteractiveStoryContent } from '$lib/types';
	let { oncountchange }: { oncountchange?: (count: number) => void } = $props();

	type Item =
		| { kind: 'post'; post: ApprovalPost }
		| { kind: 'short_story'; story: ApprovalStory; chapter: ApprovalChapter | null }
		| { kind: 'serial_story'; story: ApprovalStory }
		| { kind: 'chapter'; story: ApprovalStory | null; chapter: ApprovalChapter };
	let queue = $state<ApprovalQueue>({
		posts: [],
		shortStories: [],
		serialStories: [],
		serialChapters: []
	});
	let tab = $state<'posts' | 'short' | 'serial'>('posts');
	let selected = $state<Item | null>(null);
	let rejecting = $state(false);
	let reason = $state('');
	let loading = $state(true);
	let pending = $state(false);
	let error = $state('');
	let reviewHistory = $state<
		{
			id: string;
			decision: 'approved' | 'rejected';
			reason: string | null;
			reviewerName: string;
			submissionVersion: number;
			createdAt: number;
		}[]
	>([]);
	let interactive = $state<InteractiveStoryContent | null>(null);
	const counts = $derived({
		posts: queue.posts.length,
		short: queue.shortStories.length,
		serial: queue.serialStories.length + queue.serialChapters.length
	});

	async function load() {
		loading = true;
		error = '';
		try {
			queue = await listApprovalQueue();
			oncountchange?.(
				queue.posts.length +
					queue.shortStories.length +
					queue.serialStories.length +
					queue.serialChapters.length
			);
		} catch (cause) {
			error = cause instanceof Error ? cause.message : 'Không thể tải hàng chờ.';
		} finally {
			loading = false;
		}
	}
	onMount(load);
	function meta(item: Item) {
		if (item.kind === 'post')
			return {
				title: item.post.title,
				author: item.post.authorName,
				version: item.post.submissionVersion,
				submittedAt: item.post.submittedAt
			};
		if (item.kind === 'short_story' || item.kind === 'serial_story')
			return {
				title: item.story.title,
				author: item.story.authorName,
				version: item.story.submissionVersion,
				submittedAt: item.story.submittedAt
			};
		return {
			title: `Chương ${item.chapter.chapterNumber}: ${item.chapter.title}`,
			author: item.story?.authorName ?? '—',
			version: item.chapter.submissionVersion,
			submittedAt: item.chapter.submittedAt
		};
	}
	async function decide(decision: 'approved' | 'rejected') {
		if (!selected || pending) return;
		if (decision === 'rejected' && !reason.trim()) {
			error = 'Vui lòng nhập lý do từ chối.';
			return;
		}
		const version = meta(selected).version;
		pending = true;
		error = '';
		try {
			await reviewApproval({
				kind: selected.kind,
				id:
					selected.kind === 'post'
						? selected.post.id
						: selected.kind === 'short_story' || selected.kind === 'serial_story'
							? selected.story.id
							: selected.chapter.id,
				storyId: selected.kind === 'chapter' ? selected.story?.id : undefined,
				decision,
				reason: decision === 'rejected' ? reason.trim() : null,
				expectedSubmissionVersion: version
			});
			selected = null;
			rejecting = false;
			reason = '';
			await load();
		} catch (cause) {
			error = cause instanceof Error ? cause.message : 'Không thể xét duyệt.';
		} finally {
			pending = false;
		}
	}
	async function open(item: Item) {
		selected = item;
		error = '';
		reviewHistory = [];
		interactive = null;
		try {
			const id =
				item.kind === 'post'
					? item.post.id
					: item.kind === 'short_story' || item.kind === 'serial_story'
						? item.story.id
						: item.chapter.id;
			const detail = await getApprovalDetail(
				item.kind,
				id,
				item.kind === 'chapter' ? item.story?.id : undefined
			);
			reviewHistory = detail.reviews;
			interactive = detail.interactive;
		} catch (cause) {
			error = cause instanceof Error ? cause.message : 'Không thể tải chi tiết xét duyệt.';
		}
	}
	function items(): Item[] {
		if (tab === 'posts') return queue.posts.map((post) => ({ kind: 'post' as const, post }));
		if (tab === 'short')
			return queue.shortStories.map(({ story, chapter }) => ({
				kind: 'short_story' as const,
				story,
				chapter
			}));
		return [
			...queue.serialStories.map((story) => ({ kind: 'serial_story' as const, story })),
			...queue.serialChapters.map(({ story, chapter }) => ({
				kind: 'chapter' as const,
				story,
				chapter
			}))
		];
	}
</script>

<svelte:window
	onkeydown={(event) => {
		if (event.key === 'Escape' && selected && !pending) selected = null;
	}}
/>

<section class="border border-border bg-surface">
	<header class="border-b border-border p-5">
		<p class="text-xs tracking-[.2em] text-red uppercase">Kiểm duyệt trước xuất bản</p>
		<h2 class="mt-1 font-editorial text-3xl text-text">Hàng chờ phê duyệt</h2>
	</header>
	<nav class="flex overflow-x-auto border-b border-border p-2" aria-label="Loại nội dung chờ duyệt">
		{#each [{ id: 'posts', label: 'Bài viết', count: counts.posts }, { id: 'short', label: 'Truyện ngắn', count: counts.short }, { id: 'serial', label: 'Truyện dài', count: counts.serial }] as entry (entry.id)}<button
				class:active={tab === entry.id}
				class="queue-tab"
				onclick={() => (tab = entry.id as typeof tab)}
				>{entry.label}<span>{entry.count}</span></button
			>{/each}
	</nav>
	{#if loading}<p class="flex items-center gap-2 p-6 text-text-muted">
			<LoaderCircle class="size-4 animate-spin" /> Đang tải hàng chờ…
		</p>{:else if error && !selected}<div
			class="flex items-center justify-between gap-3 p-6 text-error"
		>
			<span>{error}</span><button onclick={load}><RotateCcw class="size-4" /></button>
		</div>{:else if items().length}<div class="divide-y divide-border">
			{#each items() as item (`${item.kind}:${meta(item).title}`)}{@const info = meta(item)}
				<article class="grid gap-4 p-4 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center">
					<div class="min-w-0">
						<p class="truncate font-editorial text-xl text-text">{info.title}</p>
						<p class="mt-1 text-xs text-text-muted">
							{info.author} · {info.submittedAt
								? new Date(info.submittedAt).toLocaleString('vi-VN')
								: 'Vừa gửi'} · {info.version > 1 ? `Gửi lại lần ${info.version}` : 'Gửi lần đầu'}
						</p>
					</div>
					<button
						class="inline-flex min-h-10 items-center justify-center gap-2 border border-border-red px-4 text-sm text-red hover:bg-red-muted/20"
						onclick={() => open(item)}><Eye class="size-4" /> Xem & xét duyệt</button
					>
				</article>{/each}
		</div>{:else}<p class="p-12 text-center text-text-muted">
			Không còn nội dung nào đang chờ phê duyệt.
		</p>{/if}
</section>

{#if selected}<div
		class="fixed inset-0 z-60 grid place-items-center bg-black/80 p-3"
		role="presentation"
	>
		<div
			role="dialog"
			aria-modal="true"
			aria-labelledby="review-title"
			class="max-h-[94dvh] w-full max-w-4xl overflow-y-auto border border-border-red bg-background"
		>
			<header
				class="sticky top-0 z-10 flex items-start justify-between border-b border-border bg-background p-5"
			>
				<div>
					<p class="text-xs tracking-widest text-red uppercase">
						Bản gửi lần {meta(selected).version}
					</p>
					<h2 id="review-title" class="font-editorial text-3xl text-text">
						{meta(selected).title}
					</h2>
					<p class="text-sm text-text-muted">Tác giả: {meta(selected).author}</p>
				</div>
				<button
					class="p-2 text-text-muted hover:text-text"
					aria-label="Đóng"
					onclick={() => (selected = null)}><X /></button
				>
			</header>
			<div class="space-y-5 p-5 sm:p-7">
				{#if selected.kind === 'post'}{#if selected.post.thumbnail}<img
							class="max-h-80 w-auto border border-border object-contain"
							src={selected.post.thumbnail.url}
							alt="Ảnh bìa"
						/>{/if}
					<p class="whitespace-pre-wrap text-text-secondary">{selected.post.content}</p>
					{#each selected.post.images as image (image.url)}<img
							class="max-h-[32rem] w-auto border border-border object-contain"
							src={image.url}
							alt="Ảnh nội dung"
						/>{/each}
					<p class="text-sm text-text-muted">
						Danh mục: {selected.post.category} · #{selected.post.tags.join(' #')}
					</p>
				{:else}{@const story = selected.story}{@const chapter =
						selected.kind === 'serial_story' ? null : selected.chapter}{#if story?.cover}<img
							class="aspect-2/3 h-72 border border-border object-cover"
							src={story.cover.url}
							alt="Bìa truyện"
						/>{/if}{#if story}<p class="text-text-secondary">{story.description}</p>
						<p class="text-sm text-text-muted">#{story.tags.join(' #')}</p>{/if}{#if chapter}<div
							class="border-t border-border pt-5"
						>
							<h3 class="font-editorial text-2xl text-text">{chapter.title}</h3>
							{#if chapter.contentFormat === 'audio' && chapter.audio}<audio
									class="mt-4 w-full"
									controls
									src={chapter.audio.url}
								></audio>{:else if chapter.contentFormat === 'interactive'}<div
									class="mt-3 border border-border p-4 text-text-muted"
								>
									{#if interactive}<InteractiveStoryPlayer
											content={interactive}
											title={chapter.title}
										/>{:else}Đang tải bản xem trước nhập vai…{/if}
								</div>{:else}<p class="mt-4 leading-8 whitespace-pre-wrap text-text-secondary">
									{chapter.content}
								</p>{/if}
						</div>{/if}{/if}
				{#if reviewHistory.length}<section class="border-t border-border pt-5">
						<h3 class="text-xs tracking-widest text-red uppercase">Lịch sử xét duyệt</h3>
						<div class="mt-3 grid gap-2">
							{#each reviewHistory as review (review.id)}<article
									class="border-l-2 border-border-red bg-surface p-3 text-sm"
								>
									<p class="text-text">
										Lần {review.submissionVersion} · {review.decision === 'approved'
											? 'Đã duyệt'
											: 'Từ chối'}
									</p>
									<p class="text-xs text-text-muted">
										{review.reviewerName} · {new Date(review.createdAt).toLocaleString('vi-VN')}
									</p>
									{#if review.reason}<p class="mt-2 text-text-secondary">{review.reason}</p>{/if}
								</article>{/each}
						</div>
					</section>{/if}
				{#if rejecting}<label class="block"
						><span class="mb-2 block text-xs tracking-widest text-red uppercase"
							>Lý do từ chối *</span
						><textarea
							bind:value={reason}
							maxlength="2000"
							rows="5"
							class="w-full border border-border bg-surface p-3 text-text outline-none focus:border-red"
							placeholder="Nêu rõ phần nội dung cần chỉnh sửa…"></textarea></label
					>{/if}{#if error}<p class="text-sm text-error" role="alert">{error}</p>{/if}
			</div>
			<footer
				class="sticky bottom-0 flex flex-wrap justify-end gap-2 border-t border-border bg-background p-4"
			>
				{#if rejecting}<button
						class="border border-border px-4 py-2 text-text-secondary"
						onclick={() => {
							rejecting = false;
							reason = '';
						}}>Hủy</button
					><button
						class="inline-flex items-center gap-2 border border-error bg-error/10 px-4 py-2 text-error"
						disabled={pending}
						onclick={() => decide('rejected')}><X class="size-4" /> Gửi phản hồi & từ chối</button
					>{:else}<button
						class="inline-flex items-center gap-2 border border-error/50 px-4 py-2 text-error"
						onclick={() => (rejecting = true)}><X class="size-4" /> Từ chối</button
					><button
						class="inline-flex items-center gap-2 border border-success/50 bg-success/10 px-4 py-2 text-success"
						disabled={pending}
						onclick={() => decide('approved')}
						>{#if pending}<LoaderCircle class="size-4 animate-spin" />{:else}<Check
								class="size-4"
							/>{/if} Phê duyệt</button
					>{/if}
			</footer>
		</div>
	</div>{/if}

<style>
	.queue-tab {
		display: flex;
		min-height: 2.75rem;
		align-items: center;
		gap: 0.5rem;
		border-bottom: 2px solid transparent;
		padding: 0 1rem;
		color: var(--color-text-muted);
		font-size: 0.82rem;
	}
	.queue-tab span {
		display: grid;
		min-width: 1.25rem;
		height: 1.25rem;
		place-items: center;
		background: var(--color-surface-2);
		color: var(--color-text-secondary);
		font-size: 0.65rem;
	}
	.queue-tab.active {
		border-color: var(--color-red);
		background: var(--color-red-muted);
		color: var(--color-text);
	}
</style>
