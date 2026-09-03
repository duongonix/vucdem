<script lang="ts">
	/* eslint-disable svelte/no-navigation-without-resolve -- discovery destinations contain database identifiers */
	import { onMount } from 'svelte';
	import { getSidebarDiscovery, type TopAuthor, type TrendingTopic } from '$lib/services/discovery';
	import VerifiedBadge from '$lib/components/profile/VerifiedBadge.svelte';
	let { compact = false }: { compact?: boolean } = $props();
	let topics = $state<TrendingTopic[]>([]);
	let authors = $state<TopAuthor[]>([]);
	let loading = $state(true);
	let topicsFailed = $state(false);
	let authorsFailed = $state(false);
	const formatCount = (value: number) => new Intl.NumberFormat('vi-VN').format(value);
	onMount(async () => {
		try {
			const result = await getSidebarDiscovery();
			topics = result.topics;
			authors = result.authors;
			topicsFailed = result.topicsFailed;
			authorsFailed = result.authorsFailed;
		} catch {
			topicsFailed = true;
			authorsFailed = true;
		} finally {
			loading = false;
		}
	});
</script>

<aside class="space-y-4" aria-label="Nội dung bổ sung">
	<section
		class="border border-border bg-cover bg-right"
		class:min-h-80={!compact}
		class:p-6={!compact}
		class:p-4={compact}
		style="background-image: linear-gradient(90deg, rgb(5 5 5 / 96%) 0%, rgb(5 5 5 / 84%) 52%, rgb(5 5 5 / 28%) 100%), url('/images/ui/home-right-gothic.png')"
	>
		<div class="mb-5 flex items-center justify-between">
			<h2 class="font-editorial text-lg tracking-wide text-red uppercase">Chủ đề thịnh hành</h2>
		</div>
		{#if loading}<div class="grid gap-3" aria-label="Đang tải chủ đề">
				{#each [1, 2, 3, 4] as item (item)}<div class="h-9 animate-pulse bg-surface-2"></div>{/each}
			</div>
		{:else if topics.length}<ul class="space-y-3">
				{#each topics as topic (topic.id)}
					<li class="grid grid-cols-[1rem_1fr] gap-2 text-sm">
						<span class="font-editorial text-lg leading-5 text-red">#</span>
						<a href={`/tag/${encodeURIComponent(topic.name)}`} class="min-w-0 hover:text-red">
							<p class="truncate text-text">{topic.name}</p>
							<p class="text-xs text-text-muted">{formatCount(topic.count)} nội dung</p>
						</a>
					</li>
				{/each}
			</ul>{:else}<p class="text-sm text-text-muted">
				{topicsFailed ? 'Không thể tải chủ đề.' : 'Chưa có chủ đề.'}
			</p>{/if}
	</section>

	<section class="border border-border bg-surface/80" class:p-6={!compact} class:p-4={compact}>
		<div class="mb-5 flex items-center justify-between">
			<h2 class="font-editorial text-lg tracking-wide text-red uppercase">Top tác giả</h2>
		</div>
		{#if loading}<div class="grid gap-3" aria-label="Đang tải tác giả">
				{#each [1, 2, 3, 4] as item (item)}<div
						class="h-10 animate-pulse bg-surface-2"
					></div>{/each}
			</div>
		{:else if authors.length}<ol class="space-y-3">
				{#each authors as author, index (author.id)}
					<li
						class={`grid items-center gap-2 ${compact ? 'grid-cols-[1.5rem_2.5rem_minmax(0,1fr)]' : 'grid-cols-[1.5rem_2.5rem_minmax(0,1fr)_auto]'}`}
					>
						<span class="font-editorial text-xl text-red">{String(index + 1).padStart(2, '0')}</span
						>
						<span
							class="grid size-10 place-items-center overflow-hidden rounded-full border border-border-red bg-surface-2 font-editorial text-red"
							>{#if author.avatarUrl}<img
									src={author.avatarUrl}
									alt=""
									class="size-full object-cover"
								/>{:else}{author.displayName.slice(0, 1).toUpperCase()}{/if}</span
						>
						<div class="min-w-0">
							<div class="flex items-center gap-1">
								<a href={`/u/${author.username}`} class="truncate text-sm text-text hover:text-red"
									>{author.displayName}</a
								>{#if author.verify}<VerifiedBadge size="sm" />{/if}
							</div>
							<p class="truncate text-xs text-text-muted">
								{formatCount(author.followersCount)} người theo dõi
							</p>
						</div>
						{#if !compact}<a
								href={`/u/${author.username}`}
								class="border border-border-red bg-red-muted/10 px-3 py-1.5 text-xs text-red hover:bg-red-muted/25"
								>Xem</a
							>{/if}
					</li>
				{/each}
			</ol>{:else}<p class="text-sm text-text-muted">
				{authorsFailed ? 'Không thể tải tác giả.' : 'Chưa có tác giả.'}
			</p>{/if}
	</section>

	<section class="border border-border bg-surface/70" class:p-6={!compact} class:p-1={compact}>
		<blockquote
			class="relative flex min-h-56 items-center justify-center overflow-hidden bg-cover bg-center px-6 py-10 text-center font-editorial text-lg leading-7 text-red"
			style="background-image: linear-gradient(rgb(5 5 5 / 20%), rgb(5 5 5 / 28%)), url('/images/ui/home-left-candle.png')"
		>
			<span class="relative z-1 max-w-36 italic"
				>Có những câu chuyện không nên được kể ra ánh sáng.</span
			>
		</blockquote>
		<div class="mt-2 flex items-center justify-center gap-3 text-red-muted" aria-hidden="true">
			<span class="h-px w-14 bg-red-muted"></span><span class="text-red">◉</span><span
				class="h-px w-14 bg-red-muted"
			></span>
		</div>
	</section>
</aside>
