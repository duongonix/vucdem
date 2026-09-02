<script lang="ts">
	import { onMount } from 'svelte';
	import { LoaderCircle, Users } from '@lucide/svelte';
	import {
		getCommunity,
		getJoinState,
		joinCommunity,
		leaveCommunity
	} from '$lib/services/communities';
	import { queryPosts } from '$lib/services/posts';
	import { authStore } from '$lib/stores/auth.svelte';
	import type { Community, Post } from '$lib/types';
	import PostCard from '$lib/components/post/PostCard.svelte';
	let { slug }: { slug: string } = $props();
	let community = $state<Community | null>(null);
	let posts = $state<Post[]>([]);
	let loading = $state(true);
	let joined = $state(false);
	let pending = $state(false);
	let errorMessage = $state('');
	onMount(async () => {
		try {
			community = await getCommunity(slug);
			posts = (await queryPosts({ communityId: community.id })).posts;
			if (authStore.status === 'authenticated') joined = await getJoinState(slug);
		} catch (reason) {
			errorMessage = reason instanceof Error ? reason.message : 'Không thể tải cộng đồng.';
		} finally {
			loading = false;
		}
	});
	async function toggle() {
		if (authStore.status !== 'authenticated') {
			location.href = `/auth/login?redirect=/c/${slug}`;
			return;
		}
		pending = true;
		try {
			if (joined) await leaveCommunity(slug);
			else await joinCommunity(slug);
			joined = !joined;
			if (community)
				community = {
					...community,
					memberCount: Math.max(0, community.memberCount + (joined ? 1 : -1))
				};
		} catch (reason) {
			errorMessage = reason instanceof Error ? reason.message : 'Không thể cập nhật.';
		} finally {
			pending = false;
		}
	}
</script>

<div class="mx-auto max-w-5xl py-6">
	{#if loading}<p class="flex items-center gap-2 text-text-muted">
			<LoaderCircle class="size-4 animate-spin" /> Đang bước vào cộng đồng…
		</p>{:else if !community}<p class="border border-border p-10 text-center text-error">
			{errorMessage}
		</p>{:else}<header class="overflow-hidden border border-border bg-surface">
			{#if community.banner}<img
					src={community.banner.url}
					alt=""
					loading="lazy"
					decoding="async"
					class="h-44 w-full object-cover"
				/>{:else}<div class="h-32 bg-gradient-to-b from-red-dark/40 to-background"></div>{/if}
			<div class="flex flex-col gap-4 p-5 sm:flex-row sm:items-end">
				<div class="size-20 shrink-0 overflow-hidden border border-border bg-background">
					{#if community.icon}<img
							src={community.icon.url}
							alt=""
							loading="lazy"
							decoding="async"
							class="size-full object-cover"
						/>{/if}
				</div>
				<div class="flex-1">
					<p class="text-xs tracking-[.2em] text-red uppercase">Cộng đồng</p>
					<h1 class="font-editorial text-4xl text-text">{community.name}</h1>
					<p class="mt-2 max-w-2xl text-sm leading-6 text-text-secondary">
						{community.description}
					</p>
					<p class="mt-3 flex items-center gap-2 text-xs text-text-muted">
						<Users class="size-4" />{community.memberCount} thành viên · {community.postCount} bài viết
					</p>
				</div>
				<button
					onclick={toggle}
					disabled={pending}
					class="min-h-10 border border-red px-5 text-sm text-red hover:bg-red-dark hover:text-text"
					>{joined ? 'Đã tham gia' : 'Tham gia'}</button
				>
			</div>
		</header>
		<section class="mt-6">
			<h2 class="mb-4 font-editorial text-2xl text-text">Bài viết mới</h2>
			{#if posts.length}<div class="grid gap-3">
					{#each posts as post (post.id)}<PostCard {post} />{/each}
				</div>{:else}<p class="border border-dashed border-border p-10 text-center text-text-muted">
					Chưa có tiếng nói nào trong cộng đồng này.
				</p>{/if}
		</section>{/if}
</div>
