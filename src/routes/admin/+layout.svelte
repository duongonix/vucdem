<script lang="ts">
	import ProtectedRoute from '$lib/components/auth/ProtectedRoute.svelte';
	let { children } = $props();
</script>

<ProtectedRoute roles={['admin']}>{@render children()}</ProtectedRoute>
