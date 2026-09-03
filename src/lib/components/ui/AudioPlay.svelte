<script lang="ts">
	import { onMount } from 'svelte';

	let audio: HTMLAudioElement;

	onMount(() => {
		const startAudio = async () => {
			try {
				audio.volume = 0.3;
				await audio.play();
			} catch {
				// Browser vẫn chặn autoplay.
			}

			window.removeEventListener('click', startAudio);
			window.removeEventListener('keydown', startAudio);
		};

		window.addEventListener('click', startAudio);
		window.addEventListener('keydown', startAudio);

		return () => {
			window.removeEventListener('click', startAudio);
			window.removeEventListener('keydown', startAudio);
		};
	});
</script>

<audio bind:this={audio} src="/music/bg.mp3" loop preload="auto"></audio>
