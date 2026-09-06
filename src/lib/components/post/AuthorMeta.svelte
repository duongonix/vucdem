<script lang="ts">
	import { resolve } from '$app/paths';
	import { relativeTime } from '$lib/utils/post';
	import VerifiedBadge from '$lib/components/profile/VerifiedBadge.svelte';
	let {
		name,
		username,
		avatarUrl,
		date,
		verified = false
	}: {
		name: string;
		username: string;
		avatarUrl: string | null;
		date: Date;
		verified?: boolean;
	} = $props();
</script>

<div class="flex min-w-0 items-center gap-2 text-xs text-text-muted">
	<a href={resolve('/u/[username]', { username })} aria-label={`Xem hồ sơ ${name}`}>
		{#if avatarUrl}<img
				class="size-7 rounded-full border border-border object-cover"
				src={avatarUrl}
				alt=""
				loading="lazy"
				decoding="async"
			/>
		{:else}<span
				class="grid size-7 place-items-center rounded-full border border-border bg-surface-2 text-text-secondary"
				>{name.slice(0, 1).toUpperCase()}</span
			>{/if}
	</a>
	<a
		class="truncate font-medium text-text-secondary hover:text-red"
		href={resolve('/u/[username]', { username })}>u/{username}</a
	>{#if verified}<VerifiedBadge size="sm" />{/if}
	<span aria-hidden="true">·</span><time datetime={date.toISOString()}>{relativeTime(date)}</time>
</div>
