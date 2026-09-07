<script lang="ts">
	import { resolve } from '$app/paths';
	import { Bell, BellOff, LoaderCircle, UserMinus, UserPlus } from '@lucide/svelte';
	import {
		followUser,
		getFollowState,
		setFollowNotifications,
		unfollowUser
	} from '$lib/services/follows';
	import { authStore } from '$lib/stores/auth.svelte';
	let { username, oncountchange }: { username: string; oncountchange?: (count: number) => void } =
		$props();
	let following = $state(false);
	let notificationsEnabled = $state(false);
	let busy = $state(false);
	let error = $state('');
	$effect(() => {
		if (authStore.initialized && authStore.firebaseUser)
			void getFollowState(username)
				.then((state) => {
					following = state.following;
					notificationsEnabled = state.notificationsEnabled;
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
			notificationsEnabled = state.notificationsEnabled;
			oncountchange?.(state.followersCount);
		} catch (cause) {
			following = previous;
			error = cause instanceof Error ? cause.message : 'Không thể cập nhật theo dõi.';
		} finally {
			busy = false;
		}
	}
	async function toggleNotifications() {
		if (!following || busy) return;
		const previous = notificationsEnabled;
		notificationsEnabled = !notificationsEnabled;
		busy = true;
		error = '';
		try {
			const state = await setFollowNotifications(username, notificationsEnabled);
			notificationsEnabled = state.notificationsEnabled;
		} catch (cause) {
			notificationsEnabled = previous;
			error = cause instanceof Error ? cause.message : 'Không thể cập nhật thông báo theo dõi.';
		} finally {
			busy = false;
		}
	}
</script>

<div class="relative flex items-center gap-2">
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
	{#if following}<button
			onclick={toggleNotifications}
			disabled={busy}
			aria-label={notificationsEnabled
				? 'Tắt thông báo từ người này'
				: 'Bật thông báo từ người này'}
			aria-pressed={notificationsEnabled}
			class={`inline-flex size-10 items-center justify-center border border-border bg-surface text-text-secondary transition-colors hover:border-red-dark hover:text-red disabled:opacity-50 ${notificationsEnabled ? 'border-red bg-red-muted/30 text-red-bright' : ''}`}
			>{#if busy}<LoaderCircle class="size-4 animate-spin" />{:else if notificationsEnabled}<Bell
					class="size-[17px]"
				/>{:else}<BellOff class="size-[17px]" />{/if}</button
		>{/if}
</div>
