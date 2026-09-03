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
	<div class="flex flex-col flex-1">
		<div class="flex min-w-0 flex-col p-4 sm:p-5 h-full">
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
		<div class="p-4 flex flex-1 items-center gap-2 text-xs text-text-muted flex-1">
			<VoteControl postId={post.id} initialScore={post.voteScore} />
			<span class="mr-4 flex items-center gap-1.5"
				><Eye size={16} />{compactNumber(post.viewCount)}</span
			><a
				class="flex items-center gap-1.5 hover:text-red"
				href={resolve('/post/[id]', { id: post.id })}
				><MessageCircle size={16} />{compactNumber(post.commentCount)}</a
			><span class="ml-auto"><BookmarkButton targetType="post" targetId={post.id} /></span>
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
