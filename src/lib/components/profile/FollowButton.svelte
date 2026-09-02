<script lang="ts">
	import { resolve } from '$app/paths';
	import { LoaderCircle, UserMinus, UserPlus } from '@lucide/svelte';
	import { followUser, getFollowState, unfollowUser } from '$lib/services/follows';
	import { authStore } from '$lib/stores/auth.svelte';
	let { username, oncountchange }: { username: string; oncountchange?: (count: number) => void } =
		$props();
	let following = $state(false);
	let busy = $state(false);
	let error = $state('');
	$effect(() => {
		if (authStore.initialized && authStore.firebaseUser)
			void getFollowState(username)
				.then((state) => {
					following = state.following;
					oncountchange?.(state.followersCount);
				})
				.catch(() => {});
	});
	async function toggle() {
		if (!authStore.firebaseUser) {
			location.href = `${resolve('/auth/login')}?redirect=${encodeURIComponent(location.pathname)}`;
			return;
		}
		if (busy) return;
		const previous = following;
		following = !following;
		busy = true;
		error = '';
		try {
			const state = following ? await followUser(username) : await unfollowUser(username);
			following = state.following;
			oncountchange?.(state.followersCount);
		} catch (cause) {
			following = previous;
			error = cause instanceof Error ? cause.message : 'Không thể cập nhật theo dõi.';
		} finally {
			busy = false;
		}
	}
</script>

<div class="relative">
	<button
		class:border-border={following}
		class:bg-red-dark={!following}
		class="inline-flex min-h-10 items-center gap-2 border border-red-dark px-4 text-sm text-text hover:border-red hover:bg-surface-hover disabled:opacity-50"
		disabled={busy}
		aria-pressed={following}
		onclick={toggle}
		>{#if busy}<LoaderCircle class="animate-spin" size={16} />{:else if following}<UserMinus
				size={16}
			/>{:else}<UserPlus size={16} />{/if}{following ? 'Đang theo dõi' : 'Theo dõi'}</button
	>{#if error}<p
			class="absolute top-full right-0 z-dropdown mt-1 w-56 border border-error/30 bg-surface p-2 text-xs text-error"
			role="status"
		>
			{error}
		</p>{/if}
</div>
