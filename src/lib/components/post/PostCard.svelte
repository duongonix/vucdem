<script lang="ts">
	import { resolve } from '$app/paths';
	import { Eye, MessageCircle, MoreVertical } from '@lucide/svelte';
	import BookmarkButton from '$lib/components/bookmark/BookmarkButton.svelte';
	import ContentCoverFallback from '$lib/components/content/ContentCoverFallback.svelte';
	import type { Post } from '$lib/types';
	import { cloudinaryThumbnail, compactNumber, postCategoryLabel } from '$lib/utils/post';
	import AuthorMeta from './AuthorMeta.svelte';
	import TagList from './TagList.svelte';
	import VoteControl from './VoteControl.svelte';
	let { post }: { post: Post } = $props();
</script>

<article
	class="group flex min-w-0 border border-border bg-surface transition-colors hover:border-border-red sm:grid-cols-[4.75rem_minmax(0,1fr)] lg:grid-cols-[4.75rem_minmax(0,1fr)_14rem]"
>
	<div class="flex flex-1 flex-col">
		<div class="flex min-w-0 flex-1 flex-col p-4 pb-2 sm:p-5 sm:pb-3">
			<div class="flex items-center justify-between gap-3">
				<AuthorMeta
					name={post.authorName}
					username={post.authorUsername}
					avatarUrl={post.authorAvatarUrl}
					verified={post.authorVerified}
					date={(post.publishedAt ?? post.createdAt).toDate()}
				/>
				<button
					class="-mt-2 grid size-9 place-items-center text-text-muted hover:text-red"
					aria-label="Tùy chọn bài viết"><MoreVertical size={17} /></button
				>
			</div>
			<a class="mt-3 block" href={resolve('/post/[id]', { id: post.id })}>
				<h2
					class="font-editorial text-2xl leading-tight font-semibold text-text group-hover:text-red-bright sm:text-[1.8rem]"
				>
					{post.title}
				</h2>
				<p class="mt-2 line-clamp-3 text-sm leading-6 text-text-secondary">{post.excerpt}</p></a
			>
			<div class="mt-4">
				<TagList
					tags={post.tags.slice(0, 2)}
					category={{ id: post.category, label: postCategoryLabel(post.category) }}
				/>
			</div>
		</div>
		<div
			class="engagement-footer mt-auto flex min-h-13 items-center px-4 pb-1 text-text-muted sm:px-5"
		>
			<div class="engagement-cluster">
				<VoteControl postId={post.id} initialScore={post.voteScore} compact />
				<a
					class="engagement-item"
					href={resolve('/post/[id]', { id: post.id })}
					aria-label={`Xem ${compactNumber(post.commentCount)} bình luận`}
					><MessageCircle size={18} strokeWidth={1.8} aria-hidden="true" />{compactNumber(
						post.commentCount
					)}</a
				>
				<span
					class="engagement-item engagement-view"
					aria-label={`${compactNumber(post.viewCount)} lượt xem`}
					><Eye size={18} strokeWidth={1.8} aria-hidden="true" />{compactNumber(
						post.viewCount
					)}</span
				>
			</div>
			<span class="ml-auto"><BookmarkButton targetType="post" targetId={post.id} minimal /></span>
		</div>
	</div>
	<a
		class="hidden aspect-[2/3] max-w-56 self-center border-l border-border p-2 lg:block"
		href={resolve('/post/[id]', { id: post.id })}
		tabindex="-1"
		>{#if post.thumbnail}<img
				class="size-full max-h-44 object-cover grayscale-[20%] transition group-hover:grayscale-0"
				src={cloudinaryThumbnail(post.thumbnail.url)}
				alt={`Ảnh đại diện cho ${post.title}`}
				loading="lazy"
				decoding="async"
			/>{:else}<ContentCoverFallback title={post.title} type="post" compact />{/if}</a
	>
</article>

<style>
	.engagement-cluster {
		display: flex;
		min-width: 0;
		align-items: center;
		gap: 1.25rem;
	}
	.engagement-item {
		display: inline-flex;
		min-height: 2.5rem;
		align-items: center;
		gap: 0.4rem;
		font-size: 0.8125rem;
		font-weight: 500;
		color: var(--color-text-secondary);
		transition: color 160ms ease;
	}
	a.engagement-item:hover {
		color: var(--color-text);
	}
	a.engagement-item:focus-visible {
		outline: 1px solid var(--color-red-dark);
		outline-offset: 4px;
	}
	.engagement-view {
		cursor: default;
	}
	@media (max-width: 639px) {
		.engagement-item {
			font-size: 0.75rem;
		}
		.engagement-item :global(svg) {
			width: 1rem;
			height: 1rem;
		}
	}
	@media (max-width: 420px) {
		.engagement-cluster {
			gap: 0.9rem;
		}
		.engagement-footer {
			padding-inline: 0.875rem;
		}
	}
	@media (prefers-reduced-motion: reduce) {
		.engagement-item {
			transition: none;
		}
	}
</style>
