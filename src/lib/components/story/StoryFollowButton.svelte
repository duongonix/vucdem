<script lang="ts">
	/* eslint-disable svelte/no-navigation-without-resolve -- dynamic login redirect */
	import { BellPlus, BellOff, LoaderCircle } from '@lucide/svelte';
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { authStore } from '$lib/stores/auth.svelte';
	import { followStory, getStoryFollow, unfollowStory } from '$lib/services/story-follows';
	let { storyId, count = $bindable(0) }: { storyId: string; count?: number } = $props();
	let following = $state(false);
	let pending = $state(false);
	onMount(async () => {
		if (authStore.status === 'authenticated')
			following = await getStoryFollow(storyId).catch(() => false);
	});
	async function toggle() {
		if (authStore.status !== 'authenticated') {
			await goto(`/auth/login?redirect=${encodeURIComponent(location.pathname)}`);
			return;
		}
		const previous = following;
		following = !previous;
		count = Math.max(0, count + (following ? 1 : -1));
		pending = true;
		try {
			if (following) await followStory(storyId);
			else await unfollowStory(storyId);
		} catch {
			following = previous;
			count = Math.max(0, count + (previous ? 1 : -1));
		} finally {
			pending = false;
		}
	}
</script>

<button
	type="button"
	onclick={toggle}
	disabled={pending}
	class="inline-flex min-h-10 items-center gap-2 border border-border px-4 text-sm text-text-secondary hover:border-red hover:text-text"
	>{#if pending}<LoaderCircle class="size-4 animate-spin" />{:else if following}<BellOff
			class="size-4"
		/>{:else}<BellPlus class="size-4" />{/if}{following ? 'Bỏ theo dõi' : 'Theo dõi truyện'}</button
>
