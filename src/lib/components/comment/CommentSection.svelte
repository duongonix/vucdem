<script lang="ts">
	import { LoaderCircle, MessageSquareDashed, RotateCcw } from '@lucide/svelte';
	import type { Comment, CommentTargetType } from '$lib/types';
	import { createComment, queryComments } from '$lib/services/comments';
	import CommentComposer from './CommentComposer.svelte';
	import CommentHeader from './CommentHeader.svelte';
	import CommentItem from './CommentItem.svelte';
	import CommentRules from './CommentRules.svelte';
	import CommentSkeleton from './CommentSkeleton.svelte';
	let {
		targetType,
		targetId,
		authorId,
		initialCount
	}: {
		targetType: CommentTargetType;
		targetId: string;
		authorId: string;
		initialCount: number;
	} = $props();
	let comments = $state<Comment[]>([]);
	let cursor = $state<string | null>(null);
	let loading = $state(true);
	let loadingMore = $state(false);
	let error = $state('');
	let loadVersion = 0;
	let count = $derived(initialCount);
	const roots = $derived(comments.filter((item) => item.parentId === null));
	async function load(reset = true) {
		if (!reset && (!cursor || loadingMore)) return;
		const version = reset ? ++loadVersion : loadVersion;
		const requestedType = targetType;
		const requestedId = targetId;
		if (reset) {
			loading = true;
			comments = [];
			cursor = null;
		} else loadingMore = true;
		error = '';
		try {
			const page = await queryComments(
				requestedType,
				requestedId,
				reset ? undefined : (cursor ?? undefined)
			);
			if (version !== loadVersion) return;
			const ids = new Set(comments.map((item) => item.id));
			comments = reset
				? page.comments
				: [...comments, ...page.comments.filter((item) => !ids.has(item.id))];
			cursor = page.nextCursor;
		} catch {
			if (version !== loadVersion) return;
			error = 'Không thể tải bình luận.';
		} finally {
			if (version === loadVersion) {
				loading = false;
				loadingMore = false;
			}
		}
	}
	async function submit(content: string, parentId: string | null, isSpoiler = false) {
		const comment = await createComment(targetType, targetId, content, parentId, isSpoiler);
		comments = parentId ? [...comments, comment] : [comment, ...comments];
		count += 1;
	}
	$effect(() => {
		void targetType;
		void targetId;
		void load();
	});
</script>

<section
	id="comments"
	class="scroll-mt-28 border-t border-border pt-10 sm:pt-12"
	aria-labelledby="comments-title"
>
	<div class="grid min-w-0 gap-8 xl:grid-cols-[minmax(0,1fr)_19rem]">
		<div class="min-w-0">
			<CommentHeader {count} />
			<div class="mt-6">
				<CommentComposer onsubmit={(content, spoiler) => submit(content, null, spoiler)} />
			</div>
			{#if loading}<div class="mt-5 grid gap-3" aria-label="Đang tải bình luận">
					{#each [0, 1, 2] as skeleton (skeleton)}<CommentSkeleton />{/each}
				</div>
			{:else if !roots.length && !error}<div
					class="mt-5 border border-dashed border-border bg-surface/50 px-5 py-12 text-center"
				>
					<MessageSquareDashed class="mx-auto text-red-muted" size={30} />
					<p class="mt-4 font-editorial text-2xl text-text">Chưa có bình luận nào.</p>
					<p class="mt-1 text-sm text-text-muted">
						Hãy là người đầu tiên bước vào cuộc trò chuyện này.
					</p>
				</div>
			{:else}<div class="mt-5 grid gap-3">
					{#each roots as comment (comment.id)}<CommentItem
							{comment}
							postAuthorId={authorId}
							allComments={comments}
							onreply={(parentId, content, spoiler) => submit(content, parentId, spoiler)}
							onchanged={() => load()}
						/>{/each}
				</div>{/if}
			{#if error}<div
					class="mt-5 flex flex-wrap items-center justify-between gap-3 border border-error/30 bg-error/5 p-4 text-sm text-error"
					role="alert"
				>
					<span>Không thể tải bình luận.</span><button
						class="inline-flex min-h-10 items-center gap-2 border border-error/40 px-3"
						onclick={() => load()}><RotateCcw size={14} /> Thử lại</button
					>
				</div>{/if}
			{#if cursor}<button
					class="mx-auto mt-6 flex min-h-11 items-center gap-2 border border-border-red bg-red-muted/10 px-5 text-xs tracking-widest text-red uppercase hover:border-red"
					disabled={loadingMore}
					onclick={() => load(false)}
					>{#if loadingMore}<LoaderCircle class="animate-spin" size={14} />{/if} Xem thêm bình luận</button
				>{/if}
		</div>
		<div class="pt-5 xl:pt-0"><div class="xl:sticky xl:top-28"><CommentRules /></div></div>
	</div>
</section>
