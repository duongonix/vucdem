<script lang="ts">
	/* eslint-disable svelte/no-navigation-without-resolve -- dynamic management destination */
	import { beforeNavigate, goto } from '$app/navigation';
	import { Check, LoaderCircle, Save } from '@lucide/svelte';
	import { onMount } from 'svelte';
	import { Button } from '$lib/components/ui/button';
	import { Textarea } from '$lib/components/ui/textarea';
	import { createStory, createStoryId } from '$lib/services/stories';
	import type { CloudinaryAsset, InteractiveStoryContent } from '$lib/types';
	import { createEmptyInteractiveContent } from '$lib/types/interactive-story';
	import { STORY_DESCRIPTION_MAX_LENGTH, STORY_TITLE_MAX_LENGTH } from '$lib/validation/story';
	import { CHAPTER_CONTENT_MAX_LENGTH } from '$lib/validation/chapter';
	import type { AudioAsset } from '$lib/types';
	import AudioUploader from '$lib/components/audio/AudioUploader.svelte';
	import StoryCoverUploader from './StoryCoverUploader.svelte';
	import StoryContentFormatSelector from './StoryContentFormatSelector.svelte';
	import StoryTagEditor from './StoryTagEditor.svelte';
	import InteractiveStoryEditor from './interactive/InteractiveStoryEditor.svelte';
	let storyId = $state('');
	let title = $state('');
	let description = $state('');
	let tags = $state<string[]>([]);
	let cover = $state<CloudinaryAsset | null>(null);
	let format = $state<'serial' | 'short'>('serial');
	let shortContent = $state('');
	let contentFormat = $state<'text' | 'audio' | 'interactive'>('text');
	let shortAudio = $state<AudioAsset | null>(null);
	let interactive = $state<InteractiveStoryContent>(createEmptyInteractiveContent());
	let interactiveUploading = $state(false);
	let pending = $state(false);
	let errorMessage = $state('');
	let dirty = $state(false);
	let uploader = $state<{ isUploading(): boolean }>();
	let audioUploader = $state<{ isUploading(): boolean }>();
	onMount(() => {
		try {
			storyId = createStoryId();
		} catch {
			errorMessage = 'Firebase chưa được cấu hình để tạo truyện.';
		}
	});
	$effect(() => {
		void [title, description, tags, cover, format, shortContent, contentFormat, shortAudio];
		if (title.trim() || description.trim() || tags.length || cover || shortContent.trim())
			dirty = true;
	});
	beforeNavigate(({ cancel }) => {
		if (dirty && !confirm('Bạn có thay đổi chưa lưu. Rời khỏi trang?')) cancel();
	});
	async function submit() {
		if (!storyId || pending) return;
		if (title.trim().length < 1) {
			errorMessage = 'Truyện cần có tiêu đề.';
			return;
		}
		if (format === 'short' && contentFormat === 'text' && !shortContent.trim()) {
			errorMessage = 'Truyện ngắn cần có nội dung.';
			return;
		}
		if (format === 'short' && contentFormat === 'audio' && !shortAudio) {
			errorMessage = 'Truyện audio cần một file audio.';
			return;
		}
		if (format === 'short' && contentFormat === 'interactive' && interactive.events.length < 1) {
			errorMessage = 'Kịch bản nhập vai cần ít nhất một sự kiện.';
			return;
		}
		if (uploader?.isUploading() || audioUploader?.isUploading() || interactiveUploading) {
			errorMessage = 'Hãy đợi media tải xong.';
			return;
		}
		pending = true;
		errorMessage = '';
		try {
			const story = await createStory(
				format === 'short' && contentFormat === 'text'
					? {
							id: storyId,
							title,
							description,
							cover,
							tags,
							format,
							contentFormat,
							shortContent,
							shortAudio: null
						}
					: format === 'short' && contentFormat === 'audio'
						? {
								id: storyId,
								title,
								description,
								cover,
								tags,
								format,
								contentFormat: 'audio',
								shortContent: '',
								shortAudio: shortAudio!
							}
						: format === 'short'
							? {
									id: storyId,
									title,
									description,
									cover,
									tags,
									format,
									contentFormat: 'interactive',
									shortContent: '',
									shortAudio: null,
									interactive
								}
							: { id: storyId, title, description, cover, tags, format, contentFormat }
			);
			dirty = false;
			await goto(`/story/${story.id}/manage`);
		} catch (reason) {
			errorMessage = reason instanceof Error ? reason.message : 'Không thể tạo truyện.';
		} finally {
			pending = false;
		}
	}
</script>

<div class="mx-auto w-full max-w-6xl py-5 sm:py-8">
	<header class="mb-6 border-b border-border pb-5">
		<p class="text-[.68rem] font-semibold tracking-[.25em] text-red uppercase">Khởi tạo tác phẩm</p>
		<h1 class="mt-2 font-editorial text-4xl font-semibold text-text sm:text-5xl">
			Mở cánh cửa đầu tiên
		</h1>
		<p class="mt-1 text-sm text-text-muted">
			Chọn truyện dài nhiều chương hoặc truyện ngắn một phần.
		</p>
	</header>
	<div class="">
		<aside class="border border-border bg-surface p-5">
			<StoryCoverUploader bind:this={uploader} {storyId} bind:cover />
		</aside>
		<section class="space-y-6 border border-border bg-surface p-5 sm:p-7">
			<fieldset>
				<legend class="mb-2 text-xs font-semibold tracking-wider text-text-muted uppercase"
					>Loại truyện</legend
				>
				<div class="grid gap-2 sm:grid-cols-2">
					<label
						class:border-red={format === 'serial'}
						class:bg-surface-hover={format === 'serial'}
						class="relative cursor-pointer overflow-hidden border border-border bg-surface-2 p-4 pl-5 transition-colors focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-red hover:border-border-red hover:bg-surface-hover"
					>
						{#if format === 'serial'}<span
								class="absolute inset-y-0 left-0 w-1 bg-red"
								aria-hidden="true"
							></span>{/if}
						<input
							class="sr-only"
							type="radio"
							name="story-format"
							value="serial"
							bind:group={format}
						/>
						<strong
							class="flex items-center justify-between gap-3 font-editorial text-xl"
							class:text-red-bright={format === 'serial'}
							class:text-text={format !== 'serial'}
							>Truyện dài {#if format === 'serial'}<span
									class="grid size-6 place-items-center border border-red bg-red-dark text-text"
									aria-hidden="true"><Check class="size-4" /></span
								>{/if}</strong
						>
						<span class="mt-1 block text-xs text-text-muted"
							>Nhiều chương, có thể xuất bản tiếp theo thời gian.</span
						>
					</label>
					<label
						class:border-red={format === 'short'}
						class:bg-surface-hover={format === 'short'}
						class="relative cursor-pointer overflow-hidden border border-border bg-surface-2 p-4 pl-5 transition-colors focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-red hover:border-border-red hover:bg-surface-hover"
					>
						{#if format === 'short'}<span
								class="absolute inset-y-0 left-0 w-1 bg-red"
								aria-hidden="true"
							></span>{/if}
						<input
							class="sr-only"
							type="radio"
							name="story-format"
							value="short"
							bind:group={format}
						/>
						<strong
							class="flex items-center justify-between gap-3 font-editorial text-xl"
							class:text-red-bright={format === 'short'}
							class:text-text={format !== 'short'}
							>Truyện ngắn {#if format === 'short'}<span
									class="grid size-6 place-items-center border border-red bg-red-dark text-text"
									aria-hidden="true"><Check class="size-4" /></span
								>{/if}</strong
						>
						<span class="mt-1 block text-xs text-text-muted"
							>Một phần nội dung hoàn chỉnh, không thêm chương.</span
						>
					</label>
				</div>
			</fieldset>
			<label class="block"
				><span class="mb-2 block text-xs font-semibold tracking-wider text-text-muted uppercase"
					>Tên truyện</span
				><input
					bind:value={title}
					maxlength={STORY_TITLE_MAX_LENGTH}
					class="w-full border-0 border-b border-border bg-transparent pb-3 font-editorial text-3xl text-text outline-none focus:border-red"
					placeholder="Tên của nỗi ám ảnh…"
				/></label
			><label class="block"
				><span class="mb-2 block text-xs font-semibold tracking-wider text-text-muted uppercase"
					>Mô tả</span
				><Textarea
					bind:value={description}
					maxlength={STORY_DESCRIPTION_MAX_LENGTH}
					class="min-h-48 bg-surface-2 leading-7"
					placeholder="Điều gì đang chờ người đọc phía sau cánh cửa?"
				/></label
			>
			<StoryContentFormatSelector bind:value={contentFormat} />
			{#if format === 'short'}
				{#if contentFormat === 'text'}<label class="block">
						<span class="mb-2 block text-xs font-semibold tracking-wider text-text-muted uppercase"
							>Nội dung truyện</span
						>
						<Textarea
							bind:value={shortContent}
							maxlength={CHAPTER_CONTENT_MAX_LENGTH}
							class="min-h-[30rem] bg-background px-5 py-4 text-base leading-8"
							placeholder="Bóng tối bắt đầu cựa mình…"
						/>
						<p class="mt-2 text-right text-xs text-text-muted">
							{shortContent.trim() ? shortContent.trim().split(/\s+/).length : 0} từ
						</p>
					</label>{:else if contentFormat === 'audio'}<AudioUploader
						bind:this={audioUploader}
						{storyId}
						chapterId="short-story"
						bind:audio={shortAudio}
					/>{:else}<InteractiveStoryEditor
						{storyId}
						chapterId="short-story"
						bind:value={interactive}
						bind:uploading={interactiveUploading}
					/>{/if}
			{:else if contentFormat === 'audio'}
				<p
					class="border-l-2 border-red-dark bg-red-dark/10 px-4 py-3 text-sm leading-6 text-text-secondary"
				>
					Audio của truyện dài được tải riêng cho từng chương trong trang quản lý truyện.
				</p>
			{:else if contentFormat === 'interactive'}<p
					class="border-l-2 border-red-dark bg-red-dark/10 px-4 py-3 text-sm leading-6 text-text-secondary"
				>
					Tạo truyện trước, sau đó mở trang quản lý để xây kịch bản nhập vai cho từng chương.
				</p>
			{/if}
			<div>
				<p class="mb-2 text-xs font-semibold tracking-wider text-text-muted uppercase">Thẻ</p>
				<StoryTagEditor bind:tags />
			</div>
			{#if errorMessage}<p
					role="alert"
					class="border-l-2 border-error bg-error/10 px-3 py-2 text-sm text-error"
				>
					{errorMessage}
				</p>{/if}<Button onclick={submit} disabled={pending || !storyId}
				>{#if pending}<LoaderCircle class="size-4 animate-spin" />{:else}<Save
						class="size-4"
					/>{/if} Tạo truyện</Button
			>
		</section>
	</div>
</div>
