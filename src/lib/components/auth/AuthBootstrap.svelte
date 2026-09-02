<script lang="ts">
	import { onMount } from 'svelte';
	import { authStore } from '$lib/stores/auth.svelte';

	onMount(() => authStore.initialize());
</script>
