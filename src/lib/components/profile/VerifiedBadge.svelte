<script lang="ts">
	import { BadgeCheck } from '@lucide/svelte';
	let { label = 'Tài khoản đã xác minh', size = 'md' }: { label?: string; size?: 'sm' | 'md' } =
		$props();
</script>

<span
	class="inline-flex shrink-0 items-center text-[#32a8ff]"
	title={label}
	aria-label={label}
	role="img"
>
	<BadgeCheck class={size === 'sm' ? 'size-3.5' : 'size-5'} strokeWidth={2.4} />
</span>
