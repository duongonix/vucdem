<script lang="ts">
	import { Headphones, LoaderCircle, Trash2, Upload, X } from '@lucide/svelte';
	import { uploadAudio } from '$lib/cloudinary/client';
	import type { AudioAsset } from '$lib/types';
	import AudioPlayer from './AudioPlayer.svelte';
	let {
		storyId,
		chapterId,
		audio = $bindable(null)
	}: { storyId: string; chapterId: string; audio?: AudioAsset | null } = $props();
	let progress = $state(0);
	let uploading = $state(false);
	let errorMessage = $state('');
	let controller: AbortController | null = null;
	let fileName = $state('');
	export function isUploading() {
		return uploading;
	}
	async function choose(event: Event) {
		const file = (event.currentTarget as HTMLInputElement).files?.[0];
		if (!file) return;
		fileName = file.name;
		progress = 0;
		uploading = true;
		errorMessage = '';
		controller = new AbortController();
		try {
			audio = await uploadAudio(file, {
				storyId,
				chapterId,
				onProgress: (value) => (progress = value),
				signal: controller.signal
			});
		} catch (reason) {
			if ((reason as DOMException)?.name !== 'AbortError')
				errorMessage = reason instanceof Error ? reason.message : 'Không thể tải audio.';
		} finally {
			uploading = false;
			controller = null;
		}
	}
</script>

<div class="border border-border bg-background p-4 sm:p-5">
	{#if audio}<AudioPlayer asset={audio} title={fileName || 'Bản audio'} compact />
		<button
			class="mt-3 inline-flex items-center gap-2 text-xs text-error"
			onclick={() => (audio = null)}><Trash2 size={15} /> Gỡ audio</button
		>
	{:else}<label
			class="grid min-h-56 cursor-pointer place-items-center border border-border-red bg-surface/60 p-6 text-center hover:bg-surface-hover"
		>
			<input
				type="file"
				class="sr-only"
				accept="audio/mpeg,audio/mp4,audio/aac,audio/ogg,audio/wav"
				onchange={choose}
				disabled={uploading}
			/>
			<span
				><Headphones class="mx-auto size-9 text-red" /><strong
					class="mt-3 block font-editorial text-2xl text-text">Tải lên truyện audio</strong
				>
				<span class="mt-2 block text-xs text-text-muted"
					>MP3, M4A, AAC, OGG hoặc WAV · tối đa 100 MB</span
				>
				<span
					class="mt-5 inline-flex min-h-10 items-center gap-2 border border-border-red bg-red-muted/20 px-4 text-xs text-red uppercase"
					>{#if uploading}<LoaderCircle class="animate-spin" size={16} /> Đang tải…{:else}<Upload
							size={16}
						/> Chọn file audio{/if}</span
				></span
			>
		</label>{/if}
	{#if uploading}<div class="mt-4">
			<div class="flex justify-between text-xs text-text-muted">
				<span class="truncate">{fileName}</span><span>{progress}%</span>
			</div>
			<div class="mt-2 h-1.5 bg-surface-2">
				<div class="h-full bg-red transition-[width]" style:width={`${progress}%`}></div>
			</div>
			<button
				class="mt-2 inline-flex items-center gap-1 text-xs text-text-muted hover:text-error"
				onclick={() => controller?.abort()}><X size={14} /> Hủy tải</button
			>
		</div>{/if}
	{#if errorMessage}<p class="mt-3 text-sm text-error" role="alert">{errorMessage}</p>{/if}
</div>
