<script lang="ts">
	/* eslint-disable svelte/no-navigation-without-resolve -- dynamic story route */
	import { onMount } from 'svelte';
	import {
		BookOpen,
		Edit3,
		Headphones,
		LoaderCircle,
		MessageCircle,
		Plus,
		Trash2
	} from '@lucide/svelte';
	import { Button } from '$lib/components/ui/button';
	import { getStory, updateStory } from '$lib/services/stories';
	import { listChapters, removeChapter } from '$lib/services/chapters';
	import type { Chapter, Story } from '$lib/types';
	import StoryCoverUploader from './StoryCoverUploader.svelte';
	import StoryTagEditor from './StoryTagEditor.svelte';
	import ChapterEditor from './ChapterEditor.svelte';
	let { storyId }: { storyId: string } = $props();
	let story = $state<Story | null>(null);
	let chapters = $state<Chapter[]>([]);
	let editing = $state<Chapter | null | undefined>(undefined);
	let loading = $state(true);
	let pending = $state(false);
	let errorMessage = $state('');
	onMount(async () => {
		try {
			[story, chapters] = await Promise.all([getStory(storyId), listChapters(storyId)]);
		} catch (reason) {
			errorMessage = reason instanceof Error ? reason.message : 'Không thể tải trình quản lý.';
		} finally {
			loading = false;
		}
	});
	async function saveStory() {
		if (!story) return;
		if (!['draft', 'ongoing', 'hiatus', 'completed'].includes(story.status)) return;
		pending = true;
		errorMessage = '';
		try {
			story = await updateStory(story.id, {
				title: story.title,
				description: story.description,
				cover: story.cover,
				tags: story.tags,
				status: story.status as 'draft' | 'ongoing' | 'hiatus' | 'completed'
			});
		} catch (reason) {
			errorMessage = reason instanceof Error ? reason.message : 'Không thể lưu truyện.';
		} finally {
			pending = false;
		}
	}
	function done(chapter: Chapter) {
		const index = chapters.findIndex((c) => c.id === chapter.id);
		chapters =
			index < 0 ? [...chapters, chapter] : chapters.map((c) => (c.id === chapter.id ? chapter : c));
		chapters.sort((a, b) => a.chapterNumber - b.chapterNumber);
		editing = undefined;
		if (story && index < 0) story = { ...story, chapterCount: story.chapterCount + 1 };
	}
	async function remove(chapter: Chapter) {
		if (!confirm(`Gỡ chương ${chapter.chapterNumber}?`)) return;
		await removeChapter(storyId, chapter.id);
		chapters = chapters.filter((c) => c.id !== chapter.id);
		if (story) story = { ...story, chapterCount: Math.max(0, story.chapterCount - 1) };
	}
</script>

<div class="mx-auto w-full max-w-6xl py-6">
	{#if loading}<p class="flex items-center gap-2 text-text-muted">
			<LoaderCircle class="size-4 animate-spin" /> Đang mở bản thảo…
		</p>{:else if !story}<p role="alert" class="text-error">
			{errorMessage || 'Không tìm thấy truyện.'}
		</p>{:else}<header
			class="mb-6 flex flex-col gap-4 border-b border-border pb-5 sm:flex-row sm:items-end sm:justify-between"
		>
			<div>
				<p class="text-xs tracking-[.2em] text-red uppercase">Xưởng truyện</p>
				<h1 class="font-editorial text-4xl text-text">Quản lý tác phẩm</h1>
				<p class="text-sm text-text-muted">
					{story.format === 'short' ? 'Truyện ngắn' : 'Truyện dài'} · {story.contentFormat ===
					'audio'
						? 'Audio'
						: story.contentFormat === 'interactive'
							? 'Nhập vai'
							: story.contentFormat === 'mixed'
								? 'Hỗn hợp'
								: 'Văn bản'} · Trạng thái: {story.status}{story.format === 'serial'
						? ` · ${story.chapterCount} chương`
						: ''}
				</p>
			</div>
			<a
				href={`/story/${story.slug}`}
				class="inline-flex items-center gap-2 text-sm text-text-secondary hover:text-red"
				><BookOpen class="size-4" /> Xem trang truyện</a
			>
		</header>
		{#if editing !== undefined}<ChapterEditor
				{storyId}
				chapter={editing}
				short={story.format === 'short'}
				ondone={done}
				oncancel={() => (editing = undefined)}
			/>{:else}<div class="grid gap-6 lg:grid-cols-[minmax(0,1fr)_20rem]">
				<section class="border border-border bg-surface p-5 sm:p-7">
					<div class="mb-4 flex items-center justify-between">
						<h2 class="font-editorial text-2xl text-text">
							{story.format === 'short' ? 'Nội dung truyện' : 'Các chương'}
						</h2>
						{#if story.format === 'serial'}<Button size="sm" onclick={() => (editing = null)}
								><Plus class="size-4" /> Thêm chương</Button
							>{/if}
					</div>
					{#if chapters.length}{#each chapters as chapter (chapter.id)}<article
								class="flex items-center gap-3 border-t border-border py-4"
							>
								<span class="w-8 font-editorial text-xl text-red"
									>{String(chapter.chapterNumber).padStart(2, '0')}</span
								>
								<div class="min-w-0 flex-1">
									<p class="flex items-center gap-2 truncate text-text">
										{#if chapter.contentFormat === 'audio'}<Headphones
												class="size-4 shrink-0 text-red"
											/>{:else if chapter.contentFormat === 'interactive'}<MessageCircle
												class="size-4 shrink-0 text-red"
											/>{/if}{chapter.title}
									</p>
									<p class="text-xs text-text-muted">
										{chapter.status === 'published' ? 'Đã xuất bản' : 'Bản nháp'} · {chapter.contentFormat ===
										'audio'
											? `${Math.ceil((chapter.audio?.duration ?? 0) / 60)} phút`
											: chapter.contentFormat === 'interactive'
												? 'Nhập vai'
												: `${chapter.wordCount} từ`}
									</p>
								</div>
								<button
									onclick={() => (editing = chapter)}
									class="p-2 text-text-muted hover:text-text"
									aria-label={story.format === 'short' ? 'Sửa nội dung truyện' : 'Sửa chương'}
									><Edit3 class="size-4" /></button
								>{#if story.format === 'serial'}<button
										onclick={() => remove(chapter)}
										class="p-2 text-text-muted hover:text-error"
										aria-label="Gỡ chương"><Trash2 class="size-4" /></button
									>{/if}
							</article>{/each}{:else}<div
							class="border border-dashed border-border p-8 text-center text-sm text-text-muted"
						>
							Chưa có chương nào. Hãy viết tiếng gõ cửa đầu tiên.
						</div>{/if}
				</section>
				<aside class="space-y-5 border border-border bg-surface p-5">
					<StoryCoverUploader storyId={story.id} bind:cover={story.cover} /><label class="block"
						><span class="label">Tên truyện</span><input
							bind:value={story.title}
							class="field"
						/></label
					><label class="block"
						><span class="label">Mô tả</span><textarea
							bind:value={story.description}
							class="field min-h-28 py-2"></textarea></label
					>
					<div><span class="label">Thẻ</span><StoryTagEditor bind:tags={story.tags} /></div>
					<label class="block"
						><span class="label">Trạng thái</span><select bind:value={story.status} class="field"
							><option value="draft">Bản nháp</option>{#if story.format === 'serial'}<option
									value="ongoing">Đang ra</option
								><option value="hiatus">Tạm dừng</option>{/if}<option value="completed"
								>Hoàn thành</option
							></select
						></label
					>{#if errorMessage}<p class="text-sm text-error">{errorMessage}</p>{/if}<Button
						class="w-full"
						onclick={saveStory}
						disabled={pending}>{pending ? 'Đang lưu…' : 'Lưu thông tin'}</Button
					>
				</aside>
			</div>{/if}{/if}
</div>

<style>
	.label {
		display: block;
		margin-bottom: 0.5rem;
		font-size: 0.7rem;
		font-weight: 600;
		letter-spacing: 0.1em;
		text-transform: uppercase;
		color: var(--color-text-muted);
	}
	.field {
		width: 100%;
		min-height: 2.5rem;
		border: 1px solid var(--color-border);
		background: var(--color-surface-2);
		padding: 0 0.75rem;
		color: var(--color-text);
		outline: none;
	}
	.field:focus {
		border-color: var(--color-red);
	}
</style>
