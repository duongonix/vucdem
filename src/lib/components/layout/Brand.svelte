<script lang="ts">
	import { resolve } from '$app/paths';
</script>

<a
	href={resolve('/')}
	class="group flex shrink-0 items-center gap-3 outline-none"
	aria-label="VỰC ĐÊM — Trang chủ"
>
	<span
		class="relative grid size-10 place-items-center border border-border-red text-red transition-colors group-hover:border-red"
		aria-hidden="true"
	>
		<img src="/images/logo.png" alt="" />
	</span>
</a>
