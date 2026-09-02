<script lang="ts">
	import { Pause, Play, RotateCcw, RotateCw, Volume2, VolumeX } from '@lucide/svelte';
	import type { AudioAsset } from '$lib/types';

	let {
		asset,
		title,
		subtitle = '',
		coverUrl = null,
		compact = false
	}: {
		asset: AudioAsset;
		title: string;
		subtitle?: string;
		coverUrl?: string | null;
		compact?: boolean;
	} = $props();
	let audio = $state<HTMLAudioElement>();
	let playing = $state(false);
	let current = $state(0);
	// svelte-ignore state_referenced_locally
	let duration = $state(asset.duration ?? 0);
	let volume = $state(1);
	let previousVolume = 1;
	let speed = $state(1);
	const progress = $derived(duration > 0 ? Math.min(1, current / duration) : 0);
	const waveform = $derived(createWaveform(asset.publicId, compact ? 44 : 76));

	function createWaveform(seed: string, count: number): number[] {
		let value = [...seed].reduce(
			(hash, character) => (hash * 31 + character.charCodeAt(0)) >>> 0,
			17
		);
		return Array.from({ length: count }, (_, index) => {
			value = (value * 1664525 + 1013904223 + index * 97) >>> 0;
			const envelope = 0.68 + Math.sin((index / Math.max(1, count - 1)) * Math.PI) * 0.32;
			return Math.round((18 + (value % 70)) * envelope);
		});
	}
	const formatTime = (seconds: number) => {
		if (!Number.isFinite(seconds)) return '0:00';
		const minutes = Math.floor(seconds / 60);
		return `${minutes}:${String(Math.floor(seconds % 60)).padStart(2, '0')}`;
	};
	async function toggle() {
		if (!audio) return;
		if (audio.paused) await audio.play();
		else audio.pause();
	}
	function seek(value: number) {
		current = value;
		if (audio) audio.currentTime = value;
	}
	function skip(delta: number) {
		seek(Math.max(0, Math.min(duration, (audio?.currentTime ?? current) + delta)));
	}
	function changeVolume(value: number) {
		volume = value;
		if (value > 0) previousVolume = value;
		if (audio) audio.volume = value;
	}
	function toggleMute() {
		changeVolume(volume > 0 ? 0 : previousVolume || 1);
	}
	function changeSpeed(value: number) {
		speed = value;
		if (audio) audio.playbackRate = value;
	}
</script>

<section
	class:compact
	class="audio-player overflow-hidden border border-border-red bg-surface"
	aria-label={`Trình phát ${title}`}
>
	<audio
		bind:this={audio}
		src={asset.url}
		preload="metadata"
		onplay={() => (playing = true)}
		onpause={() => (playing = false)}
		onended={() => {
			playing = false;
			current = 0;
		}}
		onloadedmetadata={() => (duration = audio?.duration ?? asset.duration ?? 0)}
		ontimeupdate={() => (current = audio?.currentTime ?? 0)}
	></audio>

	<div class="player-body grid min-w-0 gap-4 p-4 sm:grid-cols-[auto_minmax(0,1fr)] sm:gap-5 sm:p-5">
		{#if coverUrl && !compact}<div class="relative hidden sm:block">
				<img
					src={coverUrl}
					alt=""
					class="size-32 border border-border-red object-cover grayscale-[22%]"
				/>
				<span
					class="absolute inset-x-0 bottom-0 bg-background/85 px-2 py-1 text-center text-[.58rem] tracking-[.15em] text-red uppercase"
					>Audio Story</span
				>
			</div>{/if}

		<div class="min-w-0">
			<div class="flex min-w-0 items-start gap-3">
				<button class="play shrink-0" onclick={toggle} aria-label={playing ? 'Tạm dừng' : 'Phát'}>
					{#if playing}<Pause class="size-5" fill="currentColor" />{:else}<Play
							class="ml-0.5 size-5"
							fill="currentColor"
						/>{/if}
				</button>
				<div class="min-w-0 pt-0.5">
					<p class="truncate font-editorial text-xl leading-tight text-text sm:text-2xl">{title}</p>
					{#if subtitle}<p class="mt-1 truncate text-xs text-text-muted">{subtitle}</p>{/if}
				</div>
			</div>

			<div class="waveform-wrap relative mt-5" class:compact-wave={compact}>
				<div class="waveform pointer-events-none" aria-hidden="true">
					{#each waveform as height, index (index)}
						<span class:played={index / waveform.length <= progress} style:height={`${height}%`}
						></span>
					{/each}
				</div>
				<input
					class="waveform-seek absolute inset-0 z-1 size-full cursor-pointer opacity-0"
					type="range"
					min="0"
					max={duration || 1}
					step=".1"
					value={current}
					oninput={(event) => seek(Number(event.currentTarget.value))}
					aria-label={`Vị trí phát, ${formatTime(current)} trên ${formatTime(duration)}`}
				/>
				<div
					class="playhead pointer-events-none"
					style:left={`${progress * 100}%`}
					aria-hidden="true"
				>
					<span></span>
				</div>
			</div>

			<div class="mt-1.5 flex justify-between font-mono text-[.65rem] text-text-muted">
				<span class="text-red">{formatTime(current)}</span><span>{formatTime(duration)}</span>
			</div>

			<div
				class="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-border pt-3"
			>
				<div class="flex items-center gap-1">
					<button class="control" onclick={() => skip(-10)} aria-label="Lùi 10 giây">
						<RotateCcw class="size-4" /> <span>10</span>
					</button>
					<button class="control" onclick={() => skip(10)} aria-label="Tiến 10 giây">
						<RotateCw class="size-4" /> <span>10</span>
					</button>
				</div>
				<div class="flex min-w-0 items-center gap-2">
					<button
						class="volume-button"
						onclick={toggleMute}
						aria-label={volume ? 'Tắt tiếng' : 'Bật tiếng'}
					>
						{#if volume}<Volume2 class="size-4" />{:else}<VolumeX class="size-4" />{/if}
					</button>
					<input
						class="volume hidden sm:block"
						type="range"
						min="0"
						max="1"
						step=".05"
						value={volume}
						oninput={(event) => changeVolume(Number(event.currentTarget.value))}
						aria-label="Âm lượng"
					/>
					<select
						value={speed}
						onchange={(event) => changeSpeed(Number(event.currentTarget.value))}
						aria-label="Tốc độ phát"
						class="speed-select"
					>
						{#each [0.75, 1, 1.25, 1.5, 2] as rate (rate)}
							<option value={rate}>{rate}×</option>
						{/each}
					</select>
				</div>
			</div>
		</div>
	</div>
</section>

<style>
	.audio-player {
		background:
			radial-gradient(circle at 82% 0%, rgb(122 16 16 / 18%), transparent 34%),
			linear-gradient(145deg, rgb(17 7 7 / 96%), rgb(5 5 5 / 98%));
	}
	.audio-player.compact .player-body {
		padding: 0.9rem;
	}
	.play {
		display: grid;
		width: 2.9rem;
		height: 2.9rem;
		place-items: center;
		border: 1px solid var(--color-red);
		border-radius: 999px;
		background: var(--color-red-dark);
		color: var(--color-text);
		box-shadow: 0 0 18px rgb(122 16 16 / 26%);
		transition: 150ms ease;
	}
	.play:hover {
		background: var(--color-red);
		box-shadow: 0 0 22px rgb(216 35 35 / 28%);
	}
	.waveform-wrap {
		height: 5.5rem;
	}
	.waveform-wrap.compact-wave {
		height: 4rem;
	}
	.waveform {
		display: flex;
		height: 100%;
		align-items: center;
		gap: clamp(1px, 0.22vw, 3px);
		overflow: hidden;
	}
	.waveform span {
		min-width: 1px;
		flex: 1 1 0;
		background: #3a3535;
		transition:
			background 100ms linear,
			filter 100ms linear;
	}
	.waveform span.played {
		background: var(--color-red);
		filter: drop-shadow(0 0 2px rgb(216 35 35 / 38%));
	}
	.playhead {
		position: absolute;
		top: 0;
		bottom: 0;
		width: 1px;
		background: rgb(255 255 255 / 55%);
		transform: translateX(-1px);
	}
	.playhead span {
		position: absolute;
		top: -2px;
		left: 50%;
		width: 5px;
		height: 5px;
		background: var(--color-text);
		transform: translateX(-50%) rotate(45deg);
	}
	.waveform-wrap:has(.waveform-seek:focus-visible) {
		outline: 1px solid var(--color-red);
		outline-offset: 4px;
	}
	.control,
	.volume-button {
		display: inline-flex;
		min-width: 2.75rem;
		height: 2.75rem;
		align-items: center;
		justify-content: center;
		gap: 0.15rem;
		color: var(--color-text-muted);
	}
	.control span {
		font-size: 0.6rem;
	}
	.control:hover,
	.volume-button:hover {
		color: var(--color-red);
	}
	.volume {
		width: 4.75rem;
		accent-color: var(--color-red);
	}
	.speed-select {
		min-height: 2.25rem;
		border: 1px solid var(--color-border);
		background: var(--color-background);
		padding: 0 0.55rem;
		font-size: 0.72rem;
		color: var(--color-text-secondary);
	}
	.play:focus-visible,
	.control:focus-visible,
	.volume-button:focus-visible,
	.speed-select:focus-visible {
		outline: 2px solid var(--color-red);
		outline-offset: 2px;
	}
	@media (max-width: 639px) {
		.waveform-wrap {
			height: 4.25rem;
		}
	}
</style>
