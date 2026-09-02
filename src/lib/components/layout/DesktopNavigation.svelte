<script lang="ts">
	/* eslint-disable svelte/no-navigation-without-resolve -- same-origin category query links */
	import { resolve } from '$app/paths';
</script>

<nav class="hidden items-stretch self-stretch min-[1080px]:flex" aria-label="Điều hướng chính">
	<a
		class="flex items-center border-b-2 border-red px-4 text-sm text-red"
		href={resolve('/')}
		aria-current="page"
	>
		Khám phá
	</a>
	<a
		class="hidden items-center px-4 text-sm text-text-secondary hover:text-text min-[1360px]:flex"
		href={resolve('/search')}>Cộng đồng</a
	>
	<a
		class="hidden items-center px-4 text-sm text-text-secondary hover:text-text min-[1480px]:flex"
		href="/?sort=popular">Bảng xếp hạng</a
	>
</nav>
