<script lang="ts">
	import ProfilePage from '$lib/components/profile/ProfilePage.svelte';
	import type { PublicUserProfile } from '$lib/types';
	let { data }: { data: { profile: PublicUserProfile } } = $props();
</script>

<svelte:head
	><title>{data.profile.displayName} (@{data.profile.username}) — VỰC ĐÊM</title></svelte:head
>
<ProfilePage initialProfile={data.profile} />
