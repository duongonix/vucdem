<script lang="ts">
	let {
		name,
		url = null,
		online = false,
		size = 'md'
	}: { name: string; url?: string | null; online?: boolean; size?: 'sm' | 'md' | 'lg' } = $props();
	const initials = $derived(
		name
			.split(/\s+/)
			.slice(-2)
			.map((part) => part[0])
			.join('')
			.toLocaleUpperCase('vi-VN')
	);
</script>

<span class={`avatar avatar-${size}`} aria-hidden="true">
	{#if url}<img src={url} alt="" />{:else}<span>{initials}</span>{/if}
	{#if online}<i title="Đang hoạt động"></i>{/if}
</span>

<style>
	.avatar {
		position: relative;
		display: grid;
		flex: none;
		place-items: center;
		border: 1px solid var(--color-border-red);
		border-radius: 999px;
		background: var(--color-surface-2);
		color: var(--color-red);
		font-family: var(--font-editorial);
	}
	.avatar-sm {
		width: 2.25rem;
		height: 2.25rem;
		font-size: 0.72rem;
	}
	.avatar-md {
		width: 2.75rem;
		height: 2.75rem;
		font-size: 0.82rem;
	}
	.avatar-lg {
		width: 3.25rem;
		height: 3.25rem;
		font-size: 0.9rem;
	}
	.avatar img {
		width: 100%;
		height: 100%;
		border-radius: inherit;
		object-fit: cover;
	}
	.avatar i {
		position: absolute;
		right: 0;
		bottom: 0.1rem;
		width: 0.55rem;
		height: 0.55rem;
		border: 2px solid var(--color-background);
		border-radius: 999px;
		background: var(--color-success);
	}
</style>
