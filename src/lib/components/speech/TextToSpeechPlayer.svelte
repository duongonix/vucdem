<script lang="ts">
	import { onMount } from 'svelte';
	import { Gauge, Pause, Play, RotateCcw, Square, Volume2 } from '@lucide/svelte';
	import { createSpeechReader } from '$lib/speech/reader';
	import type { SpeechReader, SpeechReaderState } from '$lib/speech/types';

	let { text, title }: { text: string; title: string } = $props();
	let reader: SpeechReader | null = null;
	let state = $state<SpeechReaderState>({
		status: 'idle',
		voices: [],
		selectedVoiceName: '',
		rate: 1,
		currentChunk: 0,
		totalChunks: 0,
		errorMessage: '',
		hasVietnameseVoice: false
	});

	onMount(() => {
		reader = createSpeechReader(text, (next) => (state = next));
		reader.initialize();
		return () => reader?.destroy();
	});
</script>

<section class="speech-player" aria-label={`Đọc truyện ${title} bằng giọng nói`}>
	<div class="flex min-w-0 items-center gap-3 border-b border-border-red px-4 py-3 sm:px-5">
		<span class="grid size-9 shrink-0 place-items-center border border-border-red text-red">
			<Volume2 class="size-4" />
		</span>
		<div class="min-w-0">
			<p class="font-editorial text-lg font-semibold tracking-[.12em] text-text uppercase">
				Đọc truyện
			</p>
			<p class="truncate text-xs text-text-muted">Giọng đọc trực tiếp trên thiết bị</p>
		</div>
		{#if state.status === 'playing' || state.status === 'paused'}
			<p class="ml-auto shrink-0 text-xs text-red" aria-live="polite">
				Đoạn {state.currentChunk + 1}/{state.totalChunks}
			</p>
		{/if}
	</div>

	<div class="grid gap-5 p-4 sm:grid-cols-[auto_minmax(0,1fr)] sm:items-center sm:p-5">
		<div class="flex items-center justify-center gap-2 sm:justify-start">
			<button
				type="button"
				class="speech-primary"
				disabled={state.status === 'unsupported' || !state.totalChunks}
				onclick={() => (state.status === 'playing' ? reader?.pause() : reader?.play())}
				aria-label={state.status === 'playing'
					? 'Tạm dừng đọc truyện'
					: state.status === 'paused'
						? 'Tiếp tục đọc truyện'
						: 'Phát truyện'}
			>
				{#if state.status === 'playing'}<Pause class="size-5" />{:else}<Play class="size-5" />{/if}
				<span
					>{state.status === 'playing'
						? 'Tạm dừng'
						: state.status === 'paused'
							? 'Tiếp tục'
							: 'Đọc truyện'}</span
				>
			</button>
			<button
				type="button"
				class="speech-icon"
				disabled={state.status === 'idle' || state.status === 'unsupported'}
				onclick={() => reader?.stop()}
				aria-label="Dừng đọc truyện"><Square class="size-4" /></button
			>
			<button
				type="button"
				class="speech-icon"
				disabled={state.status === 'unsupported' || !state.totalChunks}
				onclick={() => reader?.restart()}
				aria-label="Đọc lại từ đầu"><RotateCcw class="size-4" /></button
			>
		</div>

		<div class="grid min-w-0 gap-3 sm:grid-cols-[minmax(0,1fr)_9rem]">
			<label class="min-w-0 text-xs text-text-muted">
				<span class="mb-1.5 block">Giọng đọc</span>
				<select
					class="speech-select"
					value={state.selectedVoiceName}
					disabled={state.status === 'unsupported' || !state.voices.length}
					onchange={(event) => reader?.setVoice(event.currentTarget.value)}
					aria-label="Chọn giọng đọc"
				>
					{#if !state.voices.length}<option value="">Giọng mặc định của thiết bị</option>{/if}
					{#each state.voices as voice (voice.name)}
						<option value={voice.name}>{voice.name} · {voice.lang}</option>
					{/each}
				</select>
			</label>
			<label class="text-xs text-text-muted">
				<span class="mb-1.5 flex items-center gap-1.5"><Gauge class="size-3.5" /> Tốc độ</span>
				<select
					class="speech-select"
					value={state.rate}
					onchange={(event) => reader?.setRate(Number(event.currentTarget.value))}
					aria-label="Chọn tốc độ đọc"
				>
					{#each [0.75, 1, 1.25, 1.5, 2] as rate (rate)}
						<option value={rate}>{rate}×</option>
					{/each}
				</select>
			</label>
		</div>
	</div>

	{#if state.status === 'unsupported' || state.errorMessage}
		<p class="border-t border-border px-4 py-3 text-xs text-error" role="status">
			{state.errorMessage || 'Trình duyệt của bạn chưa hỗ trợ chức năng đọc truyện.'}
		</p>
	{:else if !state.totalChunks}
		<p class="border-t border-border px-4 py-3 text-xs text-text-muted" role="status">
			Không có nội dung để đọc.
		</p>
	{:else if !state.hasVietnameseVoice}
		<p class="border-t border-border px-4 py-3 text-xs text-text-muted" role="status">
			Thiết bị chưa có giọng tiếng Việt; trình duyệt sẽ dùng giọng mặc định.
		</p>
	{/if}
	{#if state.status === 'playing' || state.status === 'paused'}
		<div class="h-px bg-border" aria-hidden="true">
			<div
				class="h-full bg-red transition-[width] duration-300"
				style:width={`${((state.currentChunk + 1) / state.totalChunks) * 100}%`}
			></div>
		</div>
	{/if}
</section>

<style>
	.speech-player {
		border: 1px solid var(--color-border-red);
		background: linear-gradient(110deg, rgb(56 8 8 / 22%), transparent 42%), var(--color-surface);
	}
	.speech-primary,
	.speech-icon {
		display: inline-flex;
		min-height: 2.75rem;
		align-items: center;
		justify-content: center;
		border: 1px solid var(--color-border-red);
		transition: 150ms ease;
	}
	.speech-primary {
		min-width: 8.75rem;
		gap: 0.5rem;
		background: rgb(122 16 16 / 35%);
		padding: 0 1rem;
		font-size: 0.75rem;
		font-weight: 650;
		letter-spacing: 0.06em;
		color: var(--color-red-bright);
		text-transform: uppercase;
	}
	.speech-icon {
		width: 2.75rem;
		background: transparent;
		color: var(--color-text-muted);
	}
	.speech-primary:hover:not(:disabled),
	.speech-icon:hover:not(:disabled) {
		border-color: var(--color-red);
		color: var(--color-text);
	}
	.speech-primary:focus-visible,
	.speech-icon:focus-visible,
	.speech-select:focus-visible {
		outline: 2px solid var(--color-red);
		outline-offset: 2px;
	}
	.speech-primary:disabled,
	.speech-icon:disabled {
		cursor: not-allowed;
		opacity: 0.4;
	}
	.speech-select {
		min-height: 2.75rem;
		width: 100%;
		min-width: 0;
		border: 1px solid var(--color-border);
		background: var(--color-background);
		padding: 0 0.7rem;
		color: var(--color-text-secondary);
	}
</style>
