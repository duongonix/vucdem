<script lang="ts">
	import { Settings } from '@lucide/svelte';
</script>

<header class="border-b border-border pb-5">
	<div class="flex items-center gap-3 text-red">
		<span class="grid size-9 place-items-center border border-border-red bg-red-muted/10">
			<Settings class="size-4" aria-hidden="true" />
		</span>
		<span class="text-xs tracking-[0.18em] uppercase">Tài khoản</span>
	</div>
	<h1 class="mt-3 font-editorial text-4xl font-semibold text-text sm:text-5xl">Cài đặt</h1>
	<p class="mt-1 max-w-2xl text-sm text-text-muted">
		Quản lý những thông tin thiết yếu của tài khoản Vực Đêm.
	</p>
</header>
