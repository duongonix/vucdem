<script lang="ts">
	import { page } from '$app/state';
	import { Menu } from '@lucide/svelte';
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
			<LeftSidebar showRankings onNavigate={() => (open = false)} />
			{#if !isFocusedRoute}<div class="mt-8 border-t border-border pt-8">
					<h2 class="mb-4 text-xs tracking-[0.14em] text-red uppercase">Khám phá thêm</h2>
					<RightSidebar compact />
				</div>{/if}
		</div>
	</DialogContent>
</Dialog>
