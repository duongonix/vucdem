<script lang="ts">
	import { resolve } from '$app/paths';
	import { Copy, Eye, EyeOff, MoreVertical, Pencil, Trash2 } from '@lucide/svelte';
	import type { Comment } from '$lib/types';
	import { authStore } from '$lib/stores/auth.svelte';
	import { editComment, removeComment } from '$lib/services/comments';
	import { relativeTime } from '$lib/utils/post';
	import CommentActions from './CommentActions.svelte';
	import CommentComposer from './CommentComposer.svelte';
	import CommentItem from './CommentItem.svelte';
	import ReportDialog from '$lib/components/report/ReportDialog.svelte';
	import VerifiedBadge from '$lib/components/profile/VerifiedBadge.svelte';
	let {
		comment,
		postAuthorId,
		depth = 0,
		allComments,
		onreply,
		onchanged
	}: {
		comment: Comment;
		postAuthorId: string;
		depth?: number;
		allComments: Comment[];
		onreply: (parentId: string, content: string, isSpoiler?: boolean) => Promise<void>;
		onchanged: () => void;
	} = $props();
	let replying = $state(false);
	let editing = $state(false);
	let draft = $derived(comment.content);
	let busy = $state(false);
	let menu = $state(false);
	let copied = $state(false);
	let spoilerRevealed = $state(false);
	const own = $derived(authStore.user?.id === comment.authorId);
	const replies = $derived(allComments.filter((item) => item.parentId === comment.id));
	async function save() {
		if (!draft.trim() || busy) return;
		busy = true;
		try {
			await editComment(comment.id, draft);
			editing = false;
			onchanged();
		} finally {
			busy = false;
		}
	}
	async function remove() {
		if (!confirm('Gỡ bình luận này?')) return;
		busy = true;
		try {
			await removeComment(comment.id);
			onchanged();
		} finally {
			busy = false;
		}
	}
	async function copyLink() {
		await navigator.clipboard.writeText(
			`${location.origin}${location.pathname}#comment-${comment.id}`
		);
		copied = true;
		menu = false;
		setTimeout(() => (copied = false), 1500);
	}
</script>

<article
	id={`comment-${comment.id}`}
	class:reply={depth > 0}
	class="comment-card relative border border-border bg-surface/55 p-4 transition-colors hover:bg-surface-hover/45 sm:p-5"
>
	<div
		class="grid grid-cols-[2.75rem_minmax(0,1fr)] gap-3 sm:grid-cols-[3.5rem_minmax(0,1fr)] sm:gap-4"
	>
		<a
			href={resolve('/u/[username]', { username: comment.authorUsername })}
			class="shrink-0"
			aria-label={`Xem hồ sơ ${comment.authorName}`}
		>
			{#if comment.authorAvatarUrl}<img
					class="size-11 rounded-full border border-border-red object-cover grayscale-[35%] sm:size-14"
					src={comment.authorAvatarUrl}
					alt=""
					loading="lazy"
				/>{:else}<span
					class="grid size-11 place-items-center rounded-full border border-border-red bg-surface-2 font-editorial text-xl text-red sm:size-14"
					>{comment.authorName.slice(0, 1).toUpperCase()}</span
				>{/if}
		</a>
		<div class="min-w-0">
			<div class="flex items-start justify-between gap-3">
				<div class="min-w-0">
					<div class="flex flex-wrap items-center gap-2">
						<a
							class="truncate font-editorial text-xl text-red hover:text-red-bright"
							href={resolve('/u/[username]', { username: comment.authorUsername })}
							>{comment.authorName}</a
						>{#if comment.authorVerified}<VerifiedBadge size="sm" />{/if}
						{#if comment.authorId === postAuthorId}<span
								class="border border-border-red bg-red-muted/10 px-2 py-0.5 text-[0.65rem] tracking-wide text-red uppercase"
								>Tác giả</span
							>{/if}
					</div>
					<time
						class="mt-0.5 block text-xs text-text-muted"
						datetime={comment.createdAt.toDate().toISOString()}
						>{relativeTime(comment.createdAt.toDate())}</time
					>
				</div>
				<div class="relative">
					<button
						class="grid size-9 place-items-center text-text-muted hover:text-red"
						aria-label="Tùy chọn bình luận"
						aria-expanded={menu}
						onclick={() => (menu = !menu)}><MoreVertical size={18} /></button
					>
					{#if menu}<div
							class="shadow-overlay absolute top-9 right-0 z-dropdown w-44 border border-border bg-surface-2 p-1"
						>
							<button
								class="flex w-full items-center gap-2 px-3 py-2 text-left text-xs text-text-secondary hover:bg-surface-hover"
								onclick={copyLink}><Copy size={14} /> Sao chép liên kết</button
							>
							{#if !own}<ReportDialog
									targetType="comment"
									targetId={comment.id}
									triggerClass="flex w-full items-center gap-2 px-3 py-2 text-left text-xs text-text-secondary hover:bg-surface-hover"
								/>{/if}
							{#if own && comment.status === 'published'}<button
									class="flex w-full items-center gap-2 px-3 py-2 text-left text-xs text-text-secondary hover:bg-surface-hover"
									onclick={() => {
										editing = true;
										menu = false;
									}}><Pencil size={14} /> Chỉnh sửa</button
								><button
									class="flex w-full items-center gap-2 px-3 py-2 text-left text-xs text-error hover:bg-surface-hover"
									onclick={remove}><Trash2 size={14} /> Xóa</button
								>{/if}
						</div>{/if}
				</div>
			</div>
			{#if copied}<p class="mt-2 text-xs text-success" role="status">Đã sao chép liên kết.</p>{/if}
			{#if comment.status === 'removed'}<p class="mt-4 text-sm text-text-muted italic">
					Bình luận đã được gỡ.
				</p>
			{:else if editing}<textarea
					aria-label="Chỉnh sửa bình luận"
					class="mt-4 w-full border border-border bg-surface-2 p-3 text-sm leading-6 text-text focus:border-border-red"
					rows="3"
					bind:value={draft}></textarea>
				<div class="mt-2 flex gap-2">
					<button class="border border-border px-3 py-1 text-xs" onclick={() => (editing = false)}
						>Hủy</button
					><button
						class="border border-border-red bg-red-muted/20 px-3 py-1 text-xs text-red"
						disabled={busy}
						onclick={save}>Lưu</button
					>
				</div>
			{:else if comment.isSpoiler && !spoilerRevealed}<button
					class="mt-4 flex w-full items-center justify-center gap-2 border border-border-red bg-red-muted/10 px-4 py-6 text-sm text-text-muted hover:text-red"
					onclick={() => (spoilerRevealed = true)}
					><EyeOff size={17} /> Nội dung có spoiler — nhấn để xem</button
				>
			{:else}<div class="mt-4">
					{#if comment.isSpoiler}<button
							class="mb-2 inline-flex items-center gap-1 text-xs text-text-muted hover:text-red"
							onclick={() => (spoilerRevealed = false)}><Eye size={14} /> Ẩn spoiler</button
						>
					{/if}
					<p class="text-[0.95rem] leading-7 whitespace-pre-wrap text-text-secondary">
						{comment.content}
					</p>
				</div>{/if}
			{#if comment.status === 'published'}<div class="flex flex-wrap items-center gap-2">
					<CommentActions
						commentId={comment.id}
						initialScore={comment.voteScore}
						canReply={depth < 2}
						onreply={() => (replying = !replying)}
					/>
				</div>{/if}
			{#if replying}<div class="mt-3">
					<CommentComposer
						compact
						placeholder={`Trả lời ${comment.authorName}…`}
						onsubmit={async (content, isSpoiler) => {
							await onreply(comment.id, content, isSpoiler);
							replying = false;
						}}
					/>
				</div>{/if}
		</div>
	</div>
	{#if depth < 2 && replies.length}<div class="reply-stack mt-3 space-y-3 sm:ml-16">
			{#each replies as reply (reply.id)}<CommentItem
					comment={reply}
					{postAuthorId}
					depth={depth + 1}
					{allComments}
					{onreply}
					{onchanged}
				/>{/each}
		</div>{/if}
</article>

<style>
	.reply {
		border-color: color-mix(in srgb, var(--border-red) 75%, var(--border));
		background: color-mix(in srgb, var(--surface) 88%, var(--red-muted));
	}
	.reply-stack {
		position: relative;
		padding-left: 0.75rem;
		border-left: 1px solid var(--red-muted);
	}
	.reply-stack::before {
		content: '';
		position: absolute;
		top: 1.6rem;
		left: 0;
		width: 0.75rem;
		border-top: 1px solid var(--red-muted);
	}
	@media (max-width: 639px) {
		.reply-stack {
			margin-left: 0.5rem;
			padding-left: 0.5rem;
		}
	}
</style>
