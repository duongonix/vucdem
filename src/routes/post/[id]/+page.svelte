<script lang="ts">
	import { page } from '$app/state';
	import PostDetailPage from '$lib/components/post/PostDetailPage.svelte';
</script>

<PostDetailPage postId={page.params.id ?? ''} />
