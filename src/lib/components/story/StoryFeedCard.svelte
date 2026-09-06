<script lang="ts">
	import { resolve } from '$app/paths';
	import { BookOpen, Eye, Headphones, MessageCircle } from '@lucide/svelte';
	import BookmarkButton from '$lib/components/bookmark/BookmarkButton.svelte';
	import ContentCoverFallback from '$lib/components/content/ContentCoverFallback.svelte';
	import AuthorMeta from '$lib/components/post/AuthorMeta.svelte';
	import type { Story } from '$lib/types';
	import { cloudinaryThumbnail, compactNumber } from '$lib/utils/post';
	let { story }: { story: Story } = $props();
</script>

<article
	class="group grid min-w-0 border border-border bg-surface transition-colors hover:border-border-red sm:grid-cols-[minmax(0,1fr)_11rem] lg:grid-cols-[minmax(0,1fr)_14rem]"
>
	<div class="flex min-h-full min-w-0 flex-col p-4 pb-2 sm:p-5 sm:pb-2">
		<AuthorMeta
			name={story.authorName}
			username={story.authorUsername}
			avatarUrl={story.authorAvatarUrl}
			verified={story.authorVerified}
			date={(story.publishedAt ?? story.createdAt).toDate()}
		/>
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
			{#each story.tags.slice(0, 3) as tag (tag)}<a
					href={resolve('/tag/[slug]', { slug: tag })}
					class="border border-border-red px-2.5 py-1 text-xs text-red-muted hover:bg-red-muted/20 hover:text-red"
					>#{tag}</a
				>{/each}
		</div>
		<div
			class="-mx-4 mt-auto -mb-2 flex min-h-13 items-center px-4 pt-1 text-text-muted sm:-mx-5 sm:px-5"
		>
			<div class="engagement-cluster">
				<a
					class="engagement-item"
					href={resolve('/story/[slug]', { slug: story.slug })}
					aria-label={`Xem ${compactNumber(story.commentCount)} bình luận`}
					><MessageCircle size={18} strokeWidth={1.8} aria-hidden="true" />{compactNumber(
						story.commentCount
					)}</a
				>
				<span
					class="engagement-item engagement-view"
					aria-label={`${compactNumber(story.viewCount)} lượt xem`}
					><Eye size={18} strokeWidth={1.8} aria-hidden="true" />{compactNumber(
						story.viewCount
					)}</span
				>
				<span class="story-parts"
					>{story.format === 'short' ? '1 phần' : `${story.chapterCount} chương`}</span
				>
			</div>
			<span class="ml-auto"><BookmarkButton targetType="story" targetId={story.id} minimal /></span>
		</div>
	</div>
	<a
		class="hidden aspect-[2/3] self-center border-l border-border p-4 sm:block"
		href={resolve('/story/[slug]', { slug: story.slug })}
		tabindex="-1"
	>
		{#if story.cover}<img
				class="size-full object-cover grayscale-[20%] transition group-hover:grayscale-0"
				src={cloudinaryThumbnail(story.cover.url)}
				alt={`Bìa truyện ${story.title}`}
				loading="lazy"
				decoding="async"
			/>{:else}<ContentCoverFallback title={story.title} type="story" compact />{/if}
	</a>
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
	.story-parts {
		white-space: nowrap;
		font-size: 0.75rem;
		color: var(--color-text-muted);
	}
	@media (max-width: 639px) {
		.engagement-item,
		.story-parts {
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
		.story-parts {
			display: none;
		}
	}
</style>
