<script lang="ts">
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { Eye, MessageCircle, MoreHorizontal, Pencil, Share2, Trash2 } from '@lucide/svelte';
	import BookmarkButton from '$lib/components/bookmark/BookmarkButton.svelte';
	import ReportDialog from '$lib/components/report/ReportDialog.svelte';
	import CommentSection from '$lib/components/comment/CommentSection.svelte';
	import { getPost, removePost } from '$lib/services/posts';
	import { authStore } from '$lib/stores/auth.svelte';
	import { recordPostView } from '$lib/services/views';
	import type { Post } from '$lib/types';
	import {
		cloudinaryThumbnail,
		compactNumber,
		postCategoryLabel,
		relativeTime
	} from '$lib/utils/post';
	import AuthorMeta from './AuthorMeta.svelte';
	import TagList from './TagList.svelte';
	import VoteControl from './VoteControl.svelte';
	let { postId }: { postId: string } = $props();
	let post = $state<Post | null>(null);
	let loading = $state(true);
	let error = $state('');
	let menu = $state(false);
	let removing = $state(false);
	let shared = $state(false);
	const own = $derived(Boolean(post && authStore.user?.id === post.authorId));
	function editHref(id: string): string {
		return `${resolve('/write')}?edit=${encodeURIComponent(id)}`;
	}
	$effect(() => {
		if (!authStore.initialized) return;
		loading = true;
		getPost(postId)
			.then((value) => {
				post = value;
				void recordPostView(value.id)
					.then((result) => {
						if (post?.id === value.id) post = { ...post, viewCount: result.viewCount };
					})
					.catch(() => undefined);
			})
			.catch(
				(cause) => (error = cause instanceof Error ? cause.message : 'Không thể tải bài viết.')
			)
			.finally(() => (loading = false));
	});
	async function share() {
		if (!post) return;
		try {
			if (navigator.share)
				await navigator.share({ title: post.title, text: post.excerpt, url: location.href });
			else await navigator.clipboard.writeText(location.href);
			shared = true;
			setTimeout(() => (shared = false), 1800);
		} catch {
			shared = false;
		}
	}
	async function remove() {
		if (!post || !confirm('Gỡ bài viết này? Nội dung sẽ không còn hiển thị công khai.')) return;
		removing = true;
		try {
			await removePost(post.id);
			await goto(resolve('/'));
		} catch (cause) {
			error = cause instanceof Error ? cause.message : 'Không thể gỡ bài viết.';
			removing = false;
		}
	}
</script>

<svelte:head
	><title>{post ? `${post.title} — VỰC ĐÊM` : 'Bài viết — VỰC ĐÊM'}</title>{#if post}<meta
			name="description"
			content={post.excerpt}
		/>{/if}</svelte:head
>
{#if loading}<div class="mx-auto max-w-4xl animate-pulse py-8">
		<div class="h-4 w-40 bg-surface-2"></div>
		<div class="mt-6 h-20 bg-surface-2"></div>
		<div class="mt-8 h-96 bg-surface-2"></div>
	</div>
{:else if error || !post}<div
		class="mx-auto max-w-2xl border border-border bg-surface px-6 py-16 text-center"
	>
		<p class="font-editorial text-3xl text-text">Không tìm thấy lời kể này</p>
		<p class="mt-2 text-sm text-text-muted">
			{error || 'Bài viết không tồn tại hoặc bạn không có quyền xem.'}
		</p>
		<a
			class="mt-5 inline-block border border-border-red px-4 py-2 text-sm text-red"
			href={resolve('/')}>Trở về trang chủ</a
		>
	</div>
{:else}
	<div class="mx-auto grid max-w-6xl gap-8 xl:grid-cols-[minmax(0,1fr)_17rem]">
		<article class="min-w-0 py-4 sm:py-8">
			<header class="border-b border-border pb-7">
				<div class="flex items-start justify-between gap-4">
					<div>
						<div
							class="mb-4 flex flex-wrap items-center gap-2 text-xs font-semibold tracking-wider text-red uppercase"
						>
							<a href={resolve('/category/[slug]', { slug: post.category })} class="hover:text-red"
								>{postCategoryLabel(post.category)}</a
							>{#if post.communityId}<span>· Cộng đồng</span>{/if}{#if post.status === 'draft'}<span
									class="border border-warning px-2 py-0.5 text-warning">Bản nháp</span
								>{/if}
						</div>
						<AuthorMeta
							name={post.authorName}
							username={post.authorUsername}
							avatarUrl={post.authorAvatarUrl}
							verified={post.authorVerified}
							date={(post.publishedAt ?? post.createdAt).toDate()}
						/>
					</div>
					{#if own}<div class="relative">
							<button
								class="p-2 text-text-muted hover:text-red"
								aria-label="Quản lý bài viết"
								onclick={() => (menu = !menu)}><MoreHorizontal /></button
							>{#if menu}<div
									class="absolute top-10 right-0 z-dropdown w-40 border border-border bg-surface-2 p-1 shadow-xl"
								>
									<button
										class="flex items-center gap-2 px-3 py-2 text-sm hover:bg-surface-hover"
										onclick={() => (location.href = editHref(post!.id))}
										><Pencil size={15} /> Chỉnh sửa</button
									><button
										class="flex w-full items-center gap-2 px-3 py-2 text-sm text-error hover:bg-surface-hover"
										disabled={removing}
										onclick={remove}><Trash2 size={15} /> Gỡ bài</button
									>
								</div>{/if}
						</div>{/if}
				</div>
				<h1 class="mt-5 font-editorial text-4xl leading-[1.05] font-semibold text-text sm:text-6xl">
					{post.title}
				</h1>
				{#if post.updatedAt.toMillis() - post.createdAt.toMillis() > 60000}<p
						class="mt-3 text-xs text-text-muted italic"
					>
						Đã chỉnh sửa · {relativeTime(post.updatedAt.toDate())}
					</p>{/if}
			</header>
			{#if post.thumbnail}<img
					class="mt-8 aspect-[16/9] w-full border border-border object-cover"
					src={cloudinaryThumbnail(post.thumbnail.url, 1200)}
					alt={`Ảnh đại diện cho ${post.title}`}
					decoding="async"
				/>{/if}
			<div
				class="mt-8 max-w-[52rem] text-[1.05rem] leading-8 whitespace-pre-wrap text-text-secondary"
			>
				{post.content}
			</div>
			{#if post.images.length}<div class="mt-8 grid gap-5">
					{#each post.images as image (image.publicId)}<img
							class="w-full border border-border"
							src={cloudinaryThumbnail(image.url, 1200)}
							alt="Ảnh trong bài viết"
							loading="lazy"
							decoding="async"
						/>{/each}
				</div>{/if}
			{#if post.tags.length}<div class="mt-8"><TagList tags={post.tags} /></div>{/if}
			<div class="mt-8 flex flex-wrap items-center gap-4 border-y border-border py-4">
				<VoteControl postId={post.id} initialScore={post.voteScore} orientation="horizontal" /><span
					class="inline-flex items-center gap-2 text-sm text-text-muted"
					><Eye size={18} /> {compactNumber(post.viewCount)} lượt đọc</span
				><a
					class="inline-flex items-center gap-2 text-sm text-text-muted hover:text-red"
					href="#comments"><MessageCircle size={18} /> {compactNumber(post.commentCount)}</a
				><BookmarkButton targetType="post" targetId={post.id} showLabel /><ReportDialog
					targetType="post"
					targetId={post.id}
				/><button
					class="ml-auto inline-flex items-center gap-2 text-sm text-text-muted hover:text-red"
					onclick={share}><Share2 size={18} /> {shared ? 'Đã sao chép' : 'Chia sẻ'}</button
				>
			</div>
		</article>
		<aside class="hidden border-l border-border pl-6 xl:block">
			<div class="sticky top-28 space-y-6">
				<section class="border border-border bg-surface p-5">
					<p class="text-xs font-semibold tracking-wider text-red uppercase">Về người kể</p>
					<p class="mt-3 font-editorial text-2xl text-text">{post.authorName}</p>
					<a
						class="mt-2 inline-block text-sm text-text-muted hover:text-red"
						href={resolve('/u/[username]', { username: post.authorUsername })}
						>u/{post.authorUsername}</a
					>
				</section>
				<section class="border border-border bg-surface p-5">
					<p class="text-xs font-semibold tracking-wider text-red uppercase">Lời nhắc trong đêm</p>
					<p class="mt-3 font-editorial text-lg text-text-secondary italic">
						Không phải câu chuyện nào cũng nên được kể lại.
					</p>
				</section>
			</div>
		</aside>
		<div class="xl:col-span-2">
			<CommentSection
				targetType="post"
				targetId={post.id}
				authorId={post.authorId}
				initialCount={post.commentCount}
			/>
		</div>
	</div>
{/if}
