<script lang="ts">
	import ProtectedRoute from '$lib/components/auth/ProtectedRoute.svelte';
	let { children } = $props();
</script>

<ProtectedRoute roles={['moderator', 'admin']}>{@render children()}</ProtectedRoute>
