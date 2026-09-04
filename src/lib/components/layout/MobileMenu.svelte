<script lang="ts">
	import { page } from '$app/state';
	import { Menu, Search } from '@lucide/svelte';
	import { buttonVariants } from '$lib/components/ui/button';
	import {
		Dialog,
		DialogContent,
		DialogDescription,
		DialogHeader,
		DialogTitle,
		DialogTrigger
	} from '$lib/components/ui/dialog';
	import LeftSidebar from './LeftSidebar.svelte';
	import RightSidebar from './RightSidebar.svelte';
	const isFocusedRoute = $derived(
		page.url.pathname.startsWith('/post/') ||
			(page.url.pathname.startsWith('/story/') && !page.url.pathname.endsWith('/manage')) ||
			page.url.pathname.startsWith('/messages') ||
			page.url.pathname.startsWith('/settings')
	);
	let open = $state(false);
</script>

<Dialog bind:open>
	<DialogTrigger
		class={`${buttonVariants({ variant: 'ghost', size: 'icon' })} size-11 min-[900px]:hidden`}
		aria-label="Mở điều hướng"
	>
		<Menu class="size-5" aria-hidden="true" />
	</DialogTrigger>
	<DialogContent
		class="top-0 left-0 h-dvh w-[min(22rem,calc(100%-2rem))] max-w-none translate-x-0 translate-y-0 overflow-y-auto p-0"
	>
		<DialogHeader class="border-b border-border p-5">
			<DialogTitle>Đi trong bóng tối</DialogTitle>
			<DialogDescription>Khám phá nội dung và chủ đề trên VỰC ĐÊM.</DialogDescription>
		</DialogHeader>
		<div class="p-4">
			<form class="relative mb-6 block" action="/search" method="get" role="search">
				<span class="sr-only">Tìm kiếm</span>
				<input
					name="q"
					type="search"
					class="h-11 w-full border border-border bg-surface-2 pr-10 pl-3 text-sm outline-none focus-visible:border-red"
					placeholder="Tìm kiếm…"
				/>
				<Search
					class="absolute top-1/2 right-3 size-4 -translate-y-1/2 text-text-muted"
					aria-hidden="true"
				/>
			</form>
			<LeftSidebar showRankings onNavigate={() => (open = false)} />
			{#if !isFocusedRoute}<div class="mt-8 border-t border-border pt-8">
					<h2 class="mb-4 text-xs tracking-[0.14em] text-red uppercase">Khám phá thêm</h2>
					<RightSidebar compact />
				</div>{/if}
		</div>
	</DialogContent>
</Dialog>
