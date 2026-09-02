<script lang="ts">
	import { page } from '$app/state';
	import StoryManager from '$lib/components/story/StoryManager.svelte';
</script>

<svelte:head><title>Quản lý truyện — VỰC ĐÊM</title></svelte:head><StoryManager
	storyId={page.params.id!}
/>
