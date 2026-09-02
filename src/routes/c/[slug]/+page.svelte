<script lang="ts">
	import { page } from '$app/state';
	import CommunityPage from '$lib/components/community/CommunityPage.svelte';
</script>

<CommunityPage slug={page.params.slug!} />
