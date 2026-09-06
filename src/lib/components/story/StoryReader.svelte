<script lang="ts">
	/* eslint-disable svelte/no-navigation-without-resolve -- dynamic chapter routes */
	import { onMount } from 'svelte';
	import { SvelteSet } from 'svelte/reactivity';
	import {
		ArrowLeft,
		ChevronLeft,
		ChevronRight,
		Columns3,
		LoaderCircle,
		Palette,
		Quote,
		Settings2,
		Type
	} from '@lucide/svelte';
	import { getStoryBySlug } from '$lib/services/stories';
	import { getInteractiveContent, listChapters } from '$lib/services/chapters';
	import {
		loadReaderPreferences,
		saveReadingProgress,
		storeReaderPreferences
	} from '$lib/services/reading';
	import type { Chapter, InteractiveStoryContent, Story } from '$lib/types';
	import CommentSection from '$lib/components/comment/CommentSection.svelte';
	import AudioPlayer from '$lib/components/audio/AudioPlayer.svelte';
	import MarkdownContent from '$lib/components/markdown/MarkdownContent.svelte';
	import TextToSpeechPlayer from '$lib/components/speech/TextToSpeechPlayer.svelte';
	import InteractiveStoryPlayer from './interactive/InteractiveStoryPlayer.svelte';
	import { recordChapterView } from '$lib/services/views';
	let { slug, number }: { slug: string; number: number } = $props();
	let story = $state<Story | null>(null);
	let chapters = $state<Chapter[]>([]);
	let loading = $state(true);
	let errorMessage = $state('');
	let fontSize = $state(19);
	let lineHeight = $state(1.85);
	let width = $state(720);
	let settings = $state(false);
	let theme = $state<'night' | 'blood' | 'paper'>('night');
	let preferencesLoaded = $state(false);
	let progressTimer: ReturnType<typeof setTimeout> | undefined;
	let selectedQuote = $state('');
	let interactive = $state<InteractiveStoryContent | null>(null);
	let interactiveLoading = $state(false);
	let interactiveError = $state('');
	let quoteStatus = $state('');
	let chapterElement = $state<HTMLElement>();
	const recordedChapters = new SvelteSet<string>();
	function captureQuote() {
		const selectionObject = getSelection();
		if (!selectionObject?.anchorNode || !chapterElement?.contains(selectionObject.anchorNode)) {
			selectedQuote = '';
			return;
		}
		const selection = selectionObject.toString().trim();
		selectedQuote = selection.length >= 8 ? selection.slice(0, 280) : '';
	}
	async function shareQuote() {
		if (!selectedQuote || !story || !chapter) return;
		const text = `“${selectedQuote}”\n— ${story.title}, chương ${chapter.chapterNumber}`;
		if (navigator.share) await navigator.share({ title: story.title, text, url: location.href });
		else {
			await navigator.clipboard.writeText(`${text}\n${location.href}`);
			quoteStatus = 'Đã sao chép trích đoạn.';
			setTimeout(() => (quoteStatus = ''), 1800);
		}
	}
	onMount(async () => {
		const preferences = loadReaderPreferences();
		fontSize = preferences.fontSize;
		lineHeight = preferences.lineHeight;
		width = preferences.width;
		theme = preferences.theme;
		preferencesLoaded = true;
		try {
			story = await getStoryBySlug(slug);
			chapters = await listChapters(story.id);
		} catch (reason) {
			errorMessage = reason instanceof Error ? reason.message : 'Không thể mở chương.';
		} finally {
			loading = false;
		}
	});
	onMount(() => {
		const track = () => {
			if (!story || !chapter) return;
			clearTimeout(progressTimer);
			progressTimer = setTimeout(() => {
				const scrollable = document.documentElement.scrollHeight - innerHeight;
				const progressPercent = scrollable > 0 ? Math.round((scrollY / scrollable) * 100) : 100;
				void saveReadingProgress({
					storyId: story!.id,
					storySlug: story!.slug,
					storyTitle: story!.title,
					chapterId: chapter!.id,
					chapterNumber: chapter!.chapterNumber,
					chapterTitle: chapter!.title,
					progressPercent: Math.min(100, Math.max(0, progressPercent))
				}).catch(() => undefined);
			}, 500);
		};
		addEventListener('scroll', track, { passive: true });
		document.addEventListener('selectionchange', captureQuote);
		const initialTimer = setTimeout(track, 800);
		return () => {
			removeEventListener('scroll', track);
			document.removeEventListener('selectionchange', captureQuote);
			clearTimeout(initialTimer);
			clearTimeout(progressTimer);
		};
	});
	$effect(() => {
		if (typeof localStorage === 'undefined' || !preferencesLoaded) return;
		storeReaderPreferences({ fontSize, lineHeight, width, theme });
	});
	const chapter = $derived(chapters.find((c) => c.chapterNumber === number));
	const index = $derived(chapter ? chapters.findIndex((c) => c.id === chapter.id) : -1);
	const previous = $derived(index > 0 ? chapters[index - 1] : null);
	const next = $derived(index >= 0 && index < chapters.length - 1 ? chapters[index + 1] : null);
	$effect(() => {
		const currentStory = story;
		const currentChapter = chapter;
		if (!currentStory || !currentChapter || recordedChapters.has(currentChapter.id)) return;
		recordedChapters.add(currentChapter.id);
		void recordChapterView(currentStory.id, currentChapter.id).catch(() => undefined);
	});
	$effect(() => {
		const currentStory = story;
		const currentChapter = chapter;
		if (!currentStory || !currentChapter || currentChapter.contentFormat !== 'interactive') {
			interactive = null;
			return;
		}
		interactiveLoading = true;
		interactiveError = '';
		getInteractiveContent(currentStory.id, currentChapter.id)
			.then((value) => {
				if (chapter?.id === currentChapter.id) interactive = value;
			})
			.catch((reason) => {
				if (chapter?.id === currentChapter.id)
					interactiveError = reason instanceof Error ? reason.message : 'Không thể tải kịch bản.';
			})
			.finally(() => {
				if (chapter?.id === currentChapter.id) interactiveLoading = false;
			});
	});
	const themeOptions: { value: typeof theme; label: string }[] = [
		{ value: 'night', label: 'Đêm sâu' },
		{ value: 'blood', label: 'Crimson' },
		{ value: 'paper', label: 'Giấy cũ' }
	];
</script>

<div class={`reader theme-${theme} min-h-[calc(100vh-5rem)] px-4 py-6 sm:px-6`}>
	<div class="mx-auto flex max-w-5xl items-center justify-between border-b border-border pb-4">
		<a
			href={`/story/${slug}`}
			class="inline-flex items-center gap-2 text-sm text-text-muted hover:text-text"
			><ArrowLeft class="size-4" /> Về trang truyện</a
		><button
			onclick={() => (settings = !settings)}
			class="p-2 text-text-muted hover:text-text"
			aria-label="Tùy chỉnh đọc"><Settings2 class="size-5" /></button
		>
	</div>
	{#if settings}<div class="reader-settings mx-auto mt-4 max-w-3xl" aria-label="Tùy chỉnh đọc">
			<div class="settings-header">
				<div>
					<p>Tùy chỉnh trang đọc</p>
					<span>Điều chỉnh nhịp chữ cho phiên đọc dài</span>
				</div>
				<Settings2 class="size-4" aria-hidden="true" />
			</div>
			<div class="settings-controls">
				<label class="setting-control">
					<span><Type class="size-4" aria-hidden="true" /> Cỡ chữ <b>{fontSize}px</b></span>
					<input type="range" min="16" max="24" bind:value={fontSize} aria-label="Cỡ chữ" />
				</label>
				<label class="setting-control">
					<span
						><Type class="size-4" aria-hidden="true" /> Giãn dòng
						<b>{lineHeight.toFixed(2)}</b></span
					>
					<input
						type="range"
						min="1.5"
						max="2.1"
						step=".05"
						bind:value={lineHeight}
						aria-label="Giãn dòng"
					/>
				</label>
				<label class="setting-control">
					<span><Columns3 class="size-4" aria-hidden="true" /> Độ rộng <b>{width}px</b></span>
					<input
						type="range"
						min="600"
						max="820"
						step="20"
						bind:value={width}
						aria-label="Độ rộng dòng đọc"
					/>
				</label>
			</div>
			<div class="theme-control">
				<span><Palette class="size-4" aria-hidden="true" /> Không khí</span>
				<div class="theme-options" role="radiogroup" aria-label="Không khí trang đọc">
					{#each themeOptions as option (option.value)}<button
							type="button"
							class:active={theme === option.value}
							role="radio"
							aria-checked={theme === option.value}
							onclick={() => (theme = option.value)}>{option.label}</button
						>{/each}
				</div>
			</div>
		</div>{/if}{#if loading}<p
			class="mx-auto mt-20 flex max-w-xl items-center justify-center gap-2 text-text-muted"
		>
			<LoaderCircle class="size-4 animate-spin" /> Đang mở trang sách…
		</p>{:else if !story || !chapter}<p
			class="mx-auto mt-20 max-w-xl border border-border p-10 text-center text-error"
		>
			{errorMessage || 'Chương này không khả dụng.'}
		</p>{:else}<article class="mx-auto py-12" style:max-width={`${width}px`}>
			<header class="mb-12 text-center">
				{#if story.format === 'short'}<p class="text-xs tracking-[.2em] text-red uppercase">
						Truyện ngắn
					</p>{:else}<a href={`/story/${slug}`} class="text-xs tracking-[.2em] text-red uppercase"
						>{story.title}</a
					>
					<p class="mt-5 text-sm text-text-muted">Chương {chapter.chapterNumber}</p>{/if}
				<h1 class="mt-2 font-editorial text-4xl font-semibold text-text sm:text-5xl">
					{story.format === 'short' ? story.title : chapter.title}
				</h1>
			</header>
			{#if chapter.contentFormat === 'audio' && chapter.audio}<AudioPlayer
					asset={chapter.audio}
					title={story.format === 'short' ? story.title : chapter.title}
					subtitle={`${story.authorName} · ${story.format === 'short' ? 'Truyện ngắn' : `Chương ${chapter.chapterNumber}`}`}
					coverUrl={story.cover?.url ?? null}
				/>{:else if chapter.contentFormat === 'interactive'}{#if interactiveLoading}<p
						class="py-16 text-center text-sm text-text-muted"
					>
						<LoaderCircle class="mr-2 inline size-4 animate-spin" /> Đang mở cuộc trò chuyện…
					</p>{:else if interactive}<InteractiveStoryPlayer
						content={interactive}
						title={story.title}
					/>{:else}<p class="border border-error/40 p-8 text-center text-error">
						{interactiveError || 'Kịch bản nhập vai không khả dụng.'}
					</p>{/if}{:else}<div class="mb-8">
					{#key chapter.id}<TextToSpeechPlayer
							text={chapter.content}
							title={story.format === 'short' ? story.title : chapter.title}
						/>{/key}
				</div>
				<div
					class="chapter text-[#e8e5e5]"
					bind:this={chapterElement}
					style:font-size={`${fontSize}px`}
					style:line-height={lineHeight}
				>
					<MarkdownContent content={chapter.content} reading />
				</div>{/if}
			{#if selectedQuote}<div
					class="mt-5 flex items-center justify-between gap-3 border-l border-red-dark bg-surface px-4 py-3"
				>
					<p class="min-w-0 truncate text-xs text-text-muted">“{selectedQuote}”</p>
					<button
						class="inline-flex shrink-0 items-center gap-2 text-xs text-red hover:text-red-bright"
						onclick={shareQuote}><Quote class="size-4" /> Chia sẻ trích đoạn</button
					>
				</div>{/if}
			{#if quoteStatus}<p class="mt-2 text-right text-xs text-success" role="status">
					{quoteStatus}
				</p>{/if}
			<nav class="mt-16 grid grid-cols-3 items-center border-t border-border pt-6">
				<div>
					{#if previous}<a
							href={`/story/${slug}/${previous.chapterNumber}`}
							class="inline-flex items-center gap-2 text-sm text-text-secondary hover:text-red"
							><ChevronLeft class="size-4" /> Chương trước</a
						>{/if}
				</div>
				<a href={`/story/${slug}`} class="text-center text-sm text-text-muted hover:text-text"
					>{story.format === 'short' ? 'Về trang truyện' : 'Mục lục'}</a
				>
				<div class="text-right">
					{#if next}<a
							href={`/story/${slug}/${next.chapterNumber}`}
							class="inline-flex items-center gap-2 text-sm text-text hover:text-red"
							>Chương sau <ChevronRight class="size-4" /></a
						>{/if}
				</div>
			</nav>
		</article>
		{#if chapter.status === 'published' && ['ongoing', 'hiatus', 'completed'].includes(story.status)}<div
				class="mx-auto max-w-6xl pb-16"
			>
				<CommentSection
					targetType="chapter"
					targetId={`${story.id}:${chapter.id}`}
					authorId={story.authorId}
					initialCount={chapter.commentCount ?? 0}
				/>
			</div>{/if}{/if}
</div>

<style>
	.chapter p {
		margin: 0 0 1.5em;
		white-space: pre-wrap;
	}
	.reader {
		background: #050505;
		transition:
			background 180ms ease,
			color 180ms ease;
	}
	.reader.theme-blood {
		background: #090303;
	}
	.reader.theme-paper {
		background: #17130f;
	}
	.reader.theme-paper .chapter {
		color: #d8cfbf;
	}
	.reader-settings {
		position: relative;
		overflow: hidden;
		border: 1px solid var(--color-border-red);
		background:
			linear-gradient(135deg, rgb(216 35 35 / 8%), transparent 34%),
			linear-gradient(180deg, rgb(255 255 255 / 2%), transparent), var(--color-surface);
		padding: 1rem;
		box-shadow: inset 0 0 0 1px rgb(255 255 255 / 2%);
	}
	.reader-settings::before {
		content: '';
		position: absolute;
		inset: 0;
		pointer-events: none;
		background:
			linear-gradient(90deg, transparent, rgb(216 35 35 / 22%), transparent) top left / 100% 1px
				no-repeat,
			radial-gradient(circle at 10% 0%, rgb(216 35 35 / 13%), transparent 32rem);
	}
	.settings-header,
	.settings-controls,
	.theme-control {
		position: relative;
		z-index: 1;
	}
	.settings-header {
		display: flex;
		align-items: flex-start;
		justify-content: space-between;
		gap: 1rem;
		border-bottom: 1px solid var(--color-border);
		padding-bottom: 0.85rem;
		color: var(--color-red);
	}
	.settings-header p {
		font-family: var(--font-editorial);
		font-size: 1.05rem;
		line-height: 1.1;
		color: var(--color-text);
	}
	.settings-header span {
		margin-top: 0.25rem;
		display: block;
		font-size: 0.75rem;
		color: var(--color-text-muted);
	}
	.settings-controls {
		display: grid;
		grid-template-columns: repeat(3, minmax(0, 1fr));
		gap: 0.8rem;
		padding-top: 0.9rem;
	}
	.setting-control {
		min-width: 0;
		border: 1px solid var(--color-border);
		background: rgb(5 5 5 / 55%);
		padding: 0.8rem;
	}
	.setting-control span,
	.theme-control > span {
		display: flex;
		align-items: center;
		gap: 0.45rem;
		font-size: 0.75rem;
		color: var(--color-text-secondary);
	}
	.setting-control b {
		margin-left: auto;
		font-weight: 500;
		color: var(--color-red);
	}
	.reader input[type='range'] {
		display: block;
		width: 100%;
		height: 1.6rem;
		margin-top: 0.55rem;
		accent-color: var(--color-red);
		cursor: pointer;
	}
	.reader input[type='range']:focus-visible,
	.theme-options button:focus-visible {
		outline: 1px solid var(--color-red);
		outline-offset: 3px;
	}
	.theme-control {
		display: grid;
		grid-template-columns: auto minmax(0, 1fr);
		align-items: center;
		gap: 0.85rem;
		border-top: 1px solid var(--color-border);
		margin-top: 0.9rem;
		padding-top: 0.9rem;
	}
	.theme-options {
		display: grid;
		grid-template-columns: repeat(3, minmax(0, 1fr));
		gap: 0.4rem;
		border: 1px solid var(--color-border);
		background: var(--color-background);
		padding: 0.25rem;
	}
	.theme-options button {
		min-width: 0;
		padding: 0.5rem 0.65rem;
		font-size: 0.75rem;
		color: var(--color-text-muted);
		transition:
			background-color 160ms ease,
			color 160ms ease,
			border-color 160ms ease;
	}
	.theme-options button.active {
		border: 1px solid var(--color-border-red);
		background: rgb(77 18 18 / 62%);
		color: var(--color-text);
	}
	.theme-options button:not(.active):hover {
		color: var(--color-text-secondary);
		background: var(--color-surface-2);
	}
	@media (max-width: 720px) {
		.reader-settings {
			padding: 0.85rem;
		}
		.settings-controls,
		.theme-control {
			grid-template-columns: 1fr;
		}
		.theme-options {
			grid-template-columns: repeat(3, minmax(0, 1fr));
		}
		.theme-options button {
			padding-inline: 0.35rem;
			font-size: 0.68rem;
		}
	}
</style>
