<script lang="ts">
	import { resolve } from '$app/paths';
	import { Eye, MessageCircle, MoreVertical } from '@lucide/svelte';
	import BookmarkButton from '$lib/components/bookmark/BookmarkButton.svelte';
	import type { Post } from '$lib/types';
	import { cloudinaryThumbnail, compactNumber, postCategoryLabel } from '$lib/utils/post';
	import AuthorMeta from './AuthorMeta.svelte';
	import TagList from './TagList.svelte';
	import VoteControl from './VoteControl.svelte';
	let { post }: { post: Post } = $props();
</script>

<article
	class="group grid min-w-0 border border-border bg-surface transition-colors hover:border-border-red sm:grid-cols-[4.75rem_minmax(0,1fr)] lg:grid-cols-[4.75rem_minmax(0,1fr)_14rem]"
>
	<div class="hidden border-r border-border py-5 sm:block">
		<VoteControl postId={post.id} initialScore={post.voteScore} />
	</div>
	<div class="min-w-0 p-4 sm:p-5">
		<div class="flex items-start justify-between gap-3">
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
			<TagList tags={[postCategoryLabel(post.category), ...post.tags].slice(0, 3)} />
		</div>
		<div class="mt-4 flex flex-wrap items-center gap-5 text-xs text-text-muted sm:hidden">
			<VoteControl postId={post.id} initialScore={post.voteScore} orientation="horizontal" />
		</div>
		<div class="mt-4 flex items-center gap-5 text-xs text-text-muted">
			<span class="flex items-center gap-1.5"><Eye size={16} />{compactNumber(post.viewCount)}</span
			><a
				class="flex items-center gap-1.5 hover:text-red"
				href={resolve('/post/[id]', { id: post.id })}
				><MessageCircle size={16} />{compactNumber(post.commentCount)}</a
			><span class="ml-auto"><BookmarkButton targetType="post" targetId={post.id} /></span>
		</div>
	</div>
	{#if post.thumbnail}<a
			class="hidden border-l border-border p-4 lg:block"
			href={resolve('/post/[id]', { id: post.id })}
			tabindex="-1"
			><img
				class="h-full min-h-44 w-full object-cover grayscale-[20%] transition group-hover:grayscale-0"
				src={cloudinaryThumbnail(post.thumbnail.url)}
				alt={`Ảnh đại diện cho ${post.title}`}
				loading="lazy"
				decoding="async"
			/></a
		>{/if}
</article>
