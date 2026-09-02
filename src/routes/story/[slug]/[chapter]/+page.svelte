<script lang="ts">
	import { page } from '$app/state';
	import StoryReader from '$lib/components/story/StoryReader.svelte';
	const number = $derived(Number(page.params.chapter));
</script>

<svelte:head><title>Đọc truyện — VỰC ĐÊM</title></svelte:head><StoryReader
	slug={page.params.slug!}
	{number}
/>
