<script lang="ts">
	import { page } from '$app/state';
	import AppHeader from './AppHeader.svelte';
	import LeftSidebar from './LeftSidebar.svelte';
	import RightSidebar from './RightSidebar.svelte';

	let { children } = $props();
	const isPostDetail = $derived(page.url.pathname.startsWith('/post/'));
	const isPublicStoryPage = $derived(
		page.url.pathname.startsWith('/story/') && !page.url.pathname.endsWith('/manage')
	);
	const isMessages = $derived(page.url.pathname.startsWith('/messages'));
	const isSettings = $derived(page.url.pathname.startsWith('/settings'));
	const hidesRightSidebar = $derived(isPostDetail || isPublicStoryPage || isMessages || isSettings);
</script>

<div
	class={isMessages
		? 'h-dvh overflow-hidden bg-background text-text'
		: 'min-h-screen bg-background text-text'}
>
	<AppHeader />
	<div
		class={isMessages
			? 'mx-auto grid h-[calc(100dvh-4.5rem)] w-full max-w-[1600px] min-w-0 gap-5 overflow-hidden px-4 min-[900px]:grid-cols-[15rem_minmax(0,1fr)] sm:h-[calc(100dvh-5rem)] sm:px-6 lg:px-8'
			: hidesRightSidebar
				? 'mx-auto grid w-full max-w-[1600px] min-w-0 gap-5 px-4 min-[900px]:grid-cols-[15rem_minmax(0,1fr)] sm:px-6 lg:px-8'
				: 'mx-auto grid w-full max-w-[1600px] min-w-0 gap-5 px-4 min-[900px]:grid-cols-[15rem_minmax(0,1fr)] sm:px-6 lg:px-8 xl:grid-cols-[15rem_minmax(0,1fr)_minmax(18rem,22.5rem)]'}
	>
		<div class="hidden min-h-0 border-r border-border py-6 pr-5 min-[900px]:block">
			<div class={isMessages ? 'h-full' : 'xl:sticky xl:top-26'}>
				<LeftSidebar />
				{#if !hidesRightSidebar}<div class="mt-8 border-t border-border pt-8 xl:hidden">
						<RightSidebar compact />
					</div>{/if}
			</div>
		</div>
		<main
			id="main-content"
			class={isMessages ? 'min-h-0 min-w-0 overflow-hidden py-6' : 'min-w-0 py-6'}
		>
			{@render children()}
		</main>
		{#if !hidesRightSidebar}
			<div class="hidden border-l border-border py-6 pl-5 xl:block">
				<div class="sticky top-26"><RightSidebar /></div>
			</div>
		{/if}
	</div>
</div>
