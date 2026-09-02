<script lang="ts">
	/* eslint-disable svelte/no-navigation-without-resolve -- toast destinations are controlled internal routes */
	import { Bell, MessageSquare, X } from '@lucide/svelte';
	import { dismissToast, toasts } from '$lib/stores/toast';
</script>

<div
	class="pointer-events-none fixed top-20 right-3 z-toast flex w-[min(24rem,calc(100vw-1.5rem))] flex-col gap-2 sm:top-24 sm:right-5"
	aria-live="polite"
	aria-atomic="false"
>
	{#each $toasts as toast (toast.id)}
		<article
			class="toast-enter pointer-events-auto relative overflow-hidden border border-border-red bg-surface shadow-2xl"
			role="status"
		>
			<div class="absolute inset-y-0 left-0 w-0.5 bg-red" aria-hidden="true"></div>
			<div class="flex gap-3 p-4 pr-11">
				<span class="grid size-9 shrink-0 place-items-center border border-border-red text-red">
					{#if toast.kind === 'message'}<MessageSquare class="size-4" />{:else}<Bell
							class="size-4"
						/>{/if}
				</span>
				<div class="min-w-0">
					<p class="font-editorial text-lg leading-5 text-text">{toast.title}</p>
					<p class="mt-1 line-clamp-2 text-sm leading-5 text-text-secondary">{toast.description}</p>
					{#if toast.href}<a
							href={toast.href}
							onclick={() => dismissToast(toast.id)}
							class="mt-2 inline-block text-xs font-medium tracking-wide text-red uppercase hover:text-red-bright"
							>Xem ngay</a
						>{/if}
				</div>
			</div>
			<button
				type="button"
				onclick={() => dismissToast(toast.id)}
				class="absolute top-2 right-2 grid size-8 place-items-center text-text-muted hover:text-text"
				aria-label="Đóng thông báo"><X class="size-4" /></button
			>
		</article>
	{/each}
</div>

<style>
	.toast-enter {
		animation: toast-in 180ms ease-out both;
	}
	@keyframes toast-in {
		from {
			opacity: 0;
			transform: translateX(1rem);
		}
	}
</style>
