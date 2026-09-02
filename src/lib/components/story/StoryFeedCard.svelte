<script lang="ts">
	import { resolve } from '$app/paths';
	import { BookOpen, Eye, Headphones, MessageCircle } from '@lucide/svelte';
	import BookmarkButton from '$lib/components/bookmark/BookmarkButton.svelte';
	import type { Story } from '$lib/types';
	import { cloudinaryThumbnail, compactNumber } from '$lib/utils/post';
	import VerifiedBadge from '$lib/components/profile/VerifiedBadge.svelte';
	let { story }: { story: Story } = $props();
</script>

<article
	class="group grid min-w-0 border border-border bg-surface transition-colors hover:border-border-red sm:grid-cols-[minmax(0,1fr)_11rem] lg:grid-cols-[minmax(0,1fr)_14rem]"
>
	<div class="min-w-0 p-4 sm:p-5">
		<div class="flex items-center gap-2 text-xs text-text-muted">
			<span
				class="grid size-7 place-items-center rounded-full border border-border bg-surface-2 font-editorial text-red"
				>{story.authorName.charAt(0)}</span
			>
			<a class="hover:text-red" href={resolve('/u/[username]', { username: story.authorUsername })}
				>u/{story.authorUsername}</a
			>{#if story.authorVerified}<VerifiedBadge size="sm" />{/if}
			<span>·</span><time
				>{(story.publishedAt ?? story.createdAt).toDate().toLocaleDateString('vi-VN')}</time
			>
		</div>
		<a class="mt-3 block" href={resolve('/story/[slug]', { slug: story.slug })}>
			<p class="mb-1 flex items-center gap-2 text-xs tracking-wider text-red uppercase">
				{#if story.contentFormat === 'audio'}<Headphones
						size={14}
					/>{:else if story.contentFormat === 'interactive'}<MessageCircle
						size={14}
					/>{:else}<BookOpen size={14} />{/if}
				{story.format === 'short' ? 'Truyện ngắn' : 'Truyện dài'}
				{#if story.contentFormat !== 'text'}<span
						class="border border-border-red px-1.5 py-0.5 text-[.6rem]"
						>{story.contentFormat === 'mixed'
							? 'Hỗn hợp'
							: story.contentFormat === 'interactive'
								? 'Nhập vai'
								: 'Audio'}</span
					>{/if}
			</p>
			<h2
				class="font-editorial text-2xl leading-tight font-semibold text-text group-hover:text-red-bright sm:text-[1.8rem]"
			>
				{story.title}
			</h2>
			<p class="mt-2 line-clamp-3 text-sm leading-6 text-text-secondary">{story.description}</p>
		</a>
		<div class="mt-4 flex flex-wrap gap-2">
			{#each story.tags.slice(0, 3) as tag (tag)}<span
					class="border border-border-red px-2.5 py-1 text-xs text-red-muted">{tag}</span
				>{/each}
		</div>
		<div class="mt-4 flex items-center gap-5 text-xs text-text-muted">
			<span class="flex items-center gap-1.5"
				><Eye size={16} />{compactNumber(story.viewCount)}</span
			>
			<span class="flex items-center gap-1.5"
				><MessageCircle size={16} />{compactNumber(story.commentCount)}</span
			>
			<span>{story.format === 'short' ? '1 phần' : `${story.chapterCount} chương`}</span>
			<span class="ml-auto"><BookmarkButton targetType="story" targetId={story.id} /></span>
		</div>
	</div>
	{#if story.cover}<a
			class="hidden border-l border-border p-4 sm:block"
			href={resolve('/story/[slug]', { slug: story.slug })}
			tabindex="-1"
		>
			<img
				class="h-full min-h-44 w-full object-cover grayscale-[20%] transition group-hover:grayscale-0"
				src={cloudinaryThumbnail(story.cover.url)}
				alt={`Bìa truyện ${story.title}`}
				loading="lazy"
				decoding="async"
			/>
		</a>{/if}
</article>
