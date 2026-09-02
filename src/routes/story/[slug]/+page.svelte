<script lang="ts">
	import { page } from '$app/state';
	import StoryDetail from '$lib/components/story/StoryDetail.svelte';
</script>

<StoryDetail slug={page.params.slug!} />
