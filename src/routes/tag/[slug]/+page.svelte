<script lang="ts">
	import { page } from '$app/state';
	import TaxonomyFeed from '$lib/components/feed/TaxonomyFeed.svelte';
	const slug = $derived(page.params.slug ?? '');
</script>

<TaxonomyFeed kind="tag" value={slug} />
