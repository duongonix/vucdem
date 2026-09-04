<script lang="ts">
	import { resolve } from '$app/paths';
	import { page } from '$app/state';
</script>

<nav class="hidden items-stretch self-stretch min-[1080px]:flex" aria-label="Điều hướng chính">
	<a
		class={`flex items-center border-b-2 px-4 text-sm ${page.url.pathname === '/' ? 'border-red text-red' : 'border-transparent text-text-secondary hover:text-text'}`}
		href={resolve('/')}
		aria-current={page.url.pathname === '/' ? 'page' : undefined}
	>
		Khám phá
	</a>
	<a
		class="hidden items-center px-4 text-sm text-text-secondary hover:text-text min-[1360px]:flex"
		href={resolve('/search')}>Cộng đồng</a
	>
	<a
		class={`hidden items-center border-b-2 px-4 text-sm hover:text-text min-[1480px]:flex ${page.url.pathname.startsWith('/ranks') ? 'border-red text-red' : 'border-transparent text-text-secondary'}`}
		href={resolve('/ranks')}
		aria-current={page.url.pathname.startsWith('/ranks') ? 'page' : undefined}>Bảng xếp hạng</a
	>
</nav>
