<script lang="ts">
	import { onMount } from 'svelte';
	import { Check, LoaderCircle, Save, X } from '@lucide/svelte';
	import { Button } from '$lib/components/ui/button';
	import { Textarea } from '$lib/components/ui/textarea';
	import {
		createChapter,
		createChapterId,
		getInteractiveCharacters,
		getInteractiveContent,
		updateChapter
	} from '$lib/services/chapters';
	import type { AudioAsset, Chapter, InteractiveStoryContent } from '$lib/types';
	import { createEmptyInteractiveContent } from '$lib/types/interactive-story';
	import { CHAPTER_CONTENT_MAX_LENGTH, CHAPTER_TITLE_MAX_LENGTH } from '$lib/validation/chapter';
	import type { ChapterInput } from '$lib/validation/chapter';
	import { interactiveStoryContentSchema } from '$lib/validation/interactive-story';
	import AudioUploader from '$lib/components/audio/AudioUploader.svelte';
	import { deleteImage } from '$lib/cloudinary/client';
	import StoryContentFormatSelector from './StoryContentFormatSelector.svelte';
	import InteractiveStoryAuthoring from './interactive/InteractiveStoryAuthoring.svelte';
	let {
		storyId,
		chapter = null,
		short = false,
		ondone,
		oncancel
	}: {
		storyId: string;
		chapter?: Chapter | null;
		short?: boolean;
		ondone: (chapter: Chapter) => void;
		oncancel: () => void;
	} = $props();
	// svelte-ignore state_referenced_locally
	let title = $state(chapter?.title ?? '');
	// svelte-ignore state_referenced_locally
	let content = $state(chapter?.content ?? '');
	// svelte-ignore state_referenced_locally
	let contentFormat = $state<'text' | 'audio' | 'interactive'>(chapter?.contentFormat ?? 'text');
	// svelte-ignore state_referenced_locally
	let audio = $state<AudioAsset | null>(chapter?.audio ?? null);
	// svelte-ignore state_referenced_locally
	let chapterId = $state(chapter?.id ?? createChapterId(storyId));
	let audioUploader = $state<{ isUploading(): boolean }>();
	let interactive = $state<InteractiveStoryContent>(createEmptyInteractiveContent());
	let interactiveUploading = $state(false);
	let pending = $state(false);
	let errorMessage = $state('');
	let autosaveState = $state<'idle' | 'saving' | 'saved'>('idle');
	const draftKey = $derived(`vucdem:chapter-draft:${storyId}:${chapter?.id ?? 'new'}`);
	onMount(() => {
		const raw = localStorage.getItem(draftKey);
		if (!raw) return;
		try {
			const draft = JSON.parse(raw) as {
				title?: string;
				content?: string;
				contentFormat?: 'text' | 'audio' | 'interactive';
				audio?: AudioAsset | null;
				interactive?: InteractiveStoryContent;
			};
			if ((draft.title || draft.content) && confirm('Khôi phục bản thảo tự động chưa được lưu?')) {
				title = draft.title ?? title;
				content = draft.content ?? content;
				contentFormat = draft.contentFormat ?? contentFormat;
				audio = draft.audio ?? audio;
				interactive = draft.interactive ?? interactive;
			}
		} catch {
			localStorage.removeItem(draftKey);
		}
	});
	onMount(async () => {
		if (!chapter) {
			try {
				const characters = await getInteractiveCharacters(storyId);
				if (characters.length) interactive = { ...interactive, characters };
			} catch {
				/* Story may not have interactive characters yet. */
			}
			return;
		}
		try {
			const savedInteractive = await getInteractiveContent(storyId, chapter.id);
			if (savedInteractive.events.length || chapter.contentFormat === 'interactive')
				interactive = savedInteractive;
		} catch {
			if (chapter.contentFormat === 'interactive')
				errorMessage = 'Không thể tải kịch bản nhập vai.';
		}
	});
	$effect(() => {
		if (typeof localStorage === 'undefined') return;
		const snapshot = JSON.stringify({
			title,
			content,
			contentFormat,
			audio,
			interactive,
			savedAt: Date.now()
		});
		autosaveState = 'saving';
		const timer = setTimeout(() => {
			localStorage.setItem(draftKey, snapshot);
			autosaveState = 'saved';
		}, 800);
		return () => clearTimeout(timer);
	});
	async function save(status: 'draft' | 'published') {
		if (audioUploader?.isUploading() || interactiveUploading) {
			errorMessage = 'Hãy đợi audio tải xong.';
			return;
		}
		if (contentFormat === 'audio' && !audio) {
			errorMessage = 'Chương audio cần một file audio.';
			return;
		}
		pending = true;
		errorMessage = '';
		try {
			const input: ChapterInput =
				contentFormat === 'text'
					? {
							id: chapter ? undefined : chapterId,
							title,
							content,
							status,
							contentFormat,
							audio: null
						}
					: contentFormat === 'audio'
						? {
								id: chapter ? undefined : chapterId,
								title,
								content: '',
								status,
								contentFormat,
								audio: audio!
							}
						: {
								id: chapter ? undefined : chapterId,
								title,
								content: '',
								status,
								contentFormat: 'interactive',
								audio: null,
								interactive: interactiveStoryContentSchema.parse(interactive)
							};
			const savedChapter = chapter
				? await updateChapter(storyId, chapter.id, input)
				: await createChapter(storyId, input);
			ondone(savedChapter);
			if (chapter?.audio && chapter.audio.publicId !== savedChapter.audio?.publicId) {
				void deleteImage(chapter.audio.publicId).catch(() => undefined);
			}
			localStorage.removeItem(draftKey);
		} catch (reason) {
			errorMessage = reason instanceof Error ? reason.message : 'Không thể lưu chương.';
		} finally {
			pending = false;
		}
	}
</script>

<section class="border border-border bg-surface p-5 sm:p-7">
	<div class="mb-5 flex items-center justify-between">
		<p class="text-xs font-semibold tracking-[.2em] text-red uppercase">
			{short ? 'Chỉnh sửa truyện ngắn' : chapter ? 'Chỉnh sửa chương' : 'Chương mới'}
		</p>
		<button onclick={oncancel} aria-label="Đóng trình soạn"><X class="size-5" /></button>
	</div>
	<p class="mb-4 flex items-center gap-1.5 text-xs text-text-muted" aria-live="polite">
		{#if autosaveState === 'saved'}<Check class="size-3.5 text-success" /> Đã tự động lưu trên thiết bị
		{:else if autosaveState === 'saving'}<LoaderCircle class="size-3.5 animate-spin" /> Đang lưu bản thảo…
		{:else}Bản thảo được bảo vệ tự động{/if}
	</p>
	{#if !short}<input
			bind:value={title}
			maxlength={CHAPTER_TITLE_MAX_LENGTH}
			class="w-full border-0 border-b border-border bg-transparent pb-3 font-editorial text-3xl text-text outline-none focus:border-red"
			placeholder="Tiêu đề chương"
		/>{/if}
	<div class="mt-6"><StoryContentFormatSelector bind:value={contentFormat} /></div>
	{#if contentFormat === 'text'}<Textarea
			bind:value={content}
			maxlength={CHAPTER_CONTENT_MAX_LENGTH}
			class="mt-6 min-h-[28rem] bg-background px-5 py-4 text-base leading-8"
			placeholder="Bóng tối bắt đầu cựa mình…"
		/>
		<p class="mt-2 text-right text-xs text-text-muted">
			{content.trim() ? content.trim().split(/\s+/).length : 0} từ
		</p>{:else if contentFormat === 'audio'}<div class="mt-6">
			<AudioUploader bind:this={audioUploader} {storyId} {chapterId} bind:audio />
		</div>{:else}<div class="mt-6">
			<InteractiveStoryAuthoring
				{storyId}
				{chapterId}
				fallbackTitle={title}
				bind:value={interactive}
				bind:uploading={interactiveUploading}
			/>
		</div>{/if}
	{#if errorMessage}<p role="alert" class="mt-3 text-sm text-error">{errorMessage}</p>{/if}
	<div class="mt-5 flex flex-wrap gap-2">
		{#if !short}<Button variant="outline" onclick={() => save('draft')} disabled={pending}
				><Save class="size-4" /> Lưu nháp</Button
			>{/if}<Button onclick={() => save('published')} disabled={pending}
			>{#if pending}<LoaderCircle class="size-4 animate-spin" />{/if}
			{short ? 'Lưu nội dung' : 'Xuất bản'}</Button
		>
	</div>
</section>
