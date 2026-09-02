<script lang="ts">
	/* eslint-disable svelte/no-navigation-without-resolve -- dynamic story routes */
	import { onMount } from 'svelte';
	import {
		BookOpen,
		Eye,
		Headphones,
		Layers,
		LoaderCircle,
		MessageCircle,
		Settings
	} from '@lucide/svelte';
	import { getStoryBySlug } from '$lib/services/stories';
	import { listChapters } from '$lib/services/chapters';
	import { authStore } from '$lib/stores/auth.svelte';
	import type { Chapter, Story } from '$lib/types';
	import BookmarkButton from '$lib/components/bookmark/BookmarkButton.svelte';
	import ReportDialog from '$lib/components/report/ReportDialog.svelte';
	import StoryFollowButton from './StoryFollowButton.svelte';
	import StoryRating from './StoryRating.svelte';
	import CommentSection from '$lib/components/comment/CommentSection.svelte';
	import { getReadingProgress } from '$lib/services/reading';
	import type { ReadingProgress } from '$lib/types';
	import VerifiedBadge from '$lib/components/profile/VerifiedBadge.svelte';
	let { slug }: { slug: string } = $props();
	let story = $state<Story | null>(null);
	let chapters = $state<Chapter[]>([]);
	let loading = $state(true);
	let errorMessage = $state('');
	let readingProgress = $state<ReadingProgress | null>(null);
	onMount(async () => {
		try {
			story = await getStoryBySlug(slug);
			[chapters, readingProgress] = await Promise.all([
				listChapters(story.id),
				getReadingProgress(story.id).catch(() => null)
			]);
		} catch (reason) {
			errorMessage = reason instanceof Error ? reason.message : 'Không thể tải truyện.';
		} finally {
			loading = false;
		}
	});
	const label = (status: string) =>
		({ ongoing: 'Đang ra', hiatus: 'Tạm dừng', completed: 'Hoàn thành', draft: 'Bản nháp' })[
			status
		] ?? status;
</script>

<div class="mx-auto max-w-6xl py-6">
	{#if loading}<p class="flex items-center gap-2 text-text-muted">
			<LoaderCircle class="size-4 animate-spin" /> Đang gọi tên câu chuyện…
		</p>{:else if !story}<div class="border border-border p-10 text-center text-error">
			{errorMessage || 'Không tìm thấy truyện.'}
		</div>{:else}<section class="grid gap-7 border-b border-border pb-8 md:grid-cols-[15rem_1fr]">
			<div
				class="mx-auto aspect-[2/3] w-full max-w-60 overflow-hidden border border-border bg-surface"
			>
				{#if story.cover}<img
						src={story.cover.url}
						alt={`Bìa ${story.title}`}
						decoding="async"
						class="size-full object-cover"
					/>{/if}
			</div>
			<div>
				<p class="text-xs tracking-[.2em] text-red uppercase">{label(story.status)}</p>
				{#if story.contentFormat !== 'text'}<p
						class="mt-2 inline-flex items-center gap-1.5 border border-border-red bg-red-muted/10 px-2 py-1 text-[.65rem] tracking-wider text-red uppercase"
					>
						{#if story.contentFormat === 'interactive'}<MessageCircle size={13} />{:else}<Headphones
								size={13}
							/>{/if}
						{story.contentFormat === 'mixed'
							? 'Nội dung hỗn hợp'
							: story.contentFormat === 'interactive'
								? 'Truyện nhập vai'
								: 'Truyện audio'}
					</p>{/if}
				<h1 class="mt-2 font-editorial text-4xl font-semibold text-text sm:text-6xl">
					{story.title}
				</h1>
				<div class="mt-3 flex items-center gap-1.5">
					<a href={`/u/${story.authorUsername}`} class="text-sm text-text-secondary hover:text-red"
						>bởi {story.authorName} · @{story.authorUsername}</a
					>{#if story.authorVerified}<VerifiedBadge size="sm" />{/if}
				</div>
				<p class="mt-6 max-w-3xl leading-7 whitespace-pre-line text-text-secondary">
					{story.description}
				</p>
				<div class="mt-4 flex flex-wrap gap-2">
					{#each story.tags as tag (tag)}<span
							class="border border-border px-2 py-1 text-xs text-text-muted">#{tag}</span
						>{/each}
				</div>
				<div class="mt-6 flex flex-wrap gap-5 text-sm text-text-muted">
					<span class="flex gap-2"><Eye class="size-4" />{story.viewCount} lượt đọc</span><span
						class="flex gap-2"
						><Layers class="size-4" />{story.format === 'short'
							? 'Truyện ngắn · 1 phần'
							: `${story.chapterCount} chương`}</span
					><span>{story.followerCount} người theo dõi</span>
				</div>
				<StoryRating
					storyId={story.id}
					initialAverage={story.ratingAverage}
					initialCount={story.ratingCount}
				/>
				<div class="mt-6 flex flex-wrap gap-2">
					{#if chapters[0]}<a
							href={`/story/${story.slug}/${readingProgress?.chapterNumber ?? chapters[0].chapterNumber}`}
							class="inline-flex min-h-10 items-center gap-2 bg-red-dark px-5 text-sm text-text hover:bg-red"
							>{#if story.contentFormat === 'interactive'}<MessageCircle
									class="size-4"
								/>{:else}<BookOpen class="size-4" />{/if}
							{readingProgress
								? `Đọc tiếp chương ${readingProgress.chapterNumber}`
								: story.contentFormat === 'interactive'
									? 'Bắt đầu trải nghiệm'
									: 'Đọc truyện'}</a
						>{/if}<StoryFollowButton
						storyId={story.id}
						bind:count={story.followerCount}
					/><BookmarkButton targetType="story" targetId={story.id} showLabel /><ReportDialog
						targetType="story"
						targetId={story.id}
					/>{#if authStore.user?.id === story.authorId}<a
							href={`/story/${story.id}/manage`}
							class="inline-flex min-h-10 items-center gap-2 border border-border px-4 text-sm text-text-secondary"
							><Settings class="size-4" /> Quản lý</a
						>{/if}
				</div>
			</div>
		</section>
		{#if story.format === 'serial'}<section class="mt-8">
				<h2 class="font-editorial text-3xl text-text">Danh sách chương</h2>
				{#if chapters.length}<div class="mt-4 border border-border bg-surface">
						{#each chapters as chapter (chapter.id)}<a
								href={`/story/${story.slug}/${chapter.chapterNumber}`}
								class="flex items-center gap-4 border-b border-border px-5 py-4 last:border-0 hover:bg-surface-hover"
								><span class="font-editorial text-xl text-red"
									>{String(chapter.chapterNumber).padStart(2, '0')}</span
								><span class="flex flex-1 items-center gap-2 text-text"
									>{#if chapter.contentFormat === 'audio'}<Headphones
											class="size-4 text-red"
										/>{:else if chapter.contentFormat === 'interactive'}<MessageCircle
											class="size-4 text-red"
										/>{/if}{chapter.title}</span
								><span class="text-xs text-text-muted"
									>{chapter.contentFormat === 'audio'
										? `${Math.ceil((chapter.audio?.duration ?? 0) / 60)} phút`
										: chapter.contentFormat === 'interactive'
											? 'Nhập vai'
											: `${chapter.wordCount} từ`}</span
								></a
							>{/each}
					</div>{:else}<p
						class="mt-4 border border-dashed border-border p-8 text-center text-text-muted"
					>
						Chưa có chương công khai.
					</p>{/if}
			</section>{/if}
		{#if ['ongoing', 'hiatus', 'completed'].includes(story.status)}<div class="mt-12">
				<CommentSection
					targetType="story"
					targetId={story.id}
					authorId={story.authorId}
					initialCount={story.commentCount ?? 0}
				/>
			</div>{/if}{/if}
</div>
