<script lang="ts">
	import { Search, X } from '@lucide/svelte';
	import { search, type SearchUser } from '$lib/services/search';
	import type { MessageParticipant } from '$lib/types';
	import MessageAvatar from './MessageAvatar.svelte';
	let {
		open = $bindable(false),
		onselect
	}: { open?: boolean; onselect: (participant: MessageParticipant) => void } = $props();
	let query = $state('');
	let users = $state<SearchUser[]>([]);
	let loading = $state(false);
	let errorMessage = $state('');
	let timer: ReturnType<typeof setTimeout> | undefined;
	function updateSearch() {
		clearTimeout(timer);
		if (query.trim().length < 2) {
			users = [];
			errorMessage = '';
			return;
		}
		timer = setTimeout(async () => {
			loading = true;
			errorMessage = '';
			try {
				users = (await search(query.trim())).users;
			} catch {
				errorMessage = 'Không thể tìm người dùng lúc này.';
			} finally {
				loading = false;
			}
		}, 300);
	}
	function choose(participant: MessageParticipant) {
		onselect(participant);
		open = false;
		query = '';
		users = [];
	}
</script>

{#if open}<div
		class="fixed inset-0 z-dialog grid place-items-center bg-black/80 p-4"
		role="presentation"
		onclick={(event) => event.currentTarget === event.target && (open = false)}
	>
		<div
			class="w-full max-w-lg border border-border-red bg-surface shadow-2xl"
			role="dialog"
			aria-modal="true"
			aria-labelledby="new-message-title"
		>
			<header class="flex items-center justify-between border-b border-border px-5 py-4">
				<h2 id="new-message-title" class="font-editorial text-2xl text-text">Tin nhắn mới</h2>
				<button
					class="grid size-11 place-items-center text-text-muted hover:text-red"
					onclick={() => (open = false)}
					aria-label="Đóng"><X class="size-5" /></button
				>
			</header>
			<div class="p-5">
				<label class="relative block"
					><span class="sr-only">Tìm người dùng</span><Search
						class="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-text-muted"
					/><input
						bind:value={query}
						oninput={updateSearch}
						class="h-11 w-full border border-border bg-background pr-3 pl-10 text-sm text-text outline-none focus:border-red-dark"
						placeholder="Tìm theo tên hoặc username…"
					/></label
				>
				<p class="mt-5 text-[.65rem] tracking-[.16em] text-red uppercase">
					{query.trim().length >= 2 ? 'Kết quả tìm kiếm' : 'Tìm người trong Vực Đêm'}
				</p>
				<div class="mt-2 max-h-72 overflow-y-auto border-y border-border">
					{#if loading}<p class="p-5 text-center text-sm text-text-muted">
							Đang tìm trong bóng tối…
						</p>
					{:else if errorMessage}<p class="p-5 text-center text-sm text-error">{errorMessage}</p>
					{:else if query.trim().length >= 2}
						{#each users as user (user.id)}<button
								class="flex w-full items-center gap-3 border-b border-border px-3 py-3 text-left last:border-0 hover:bg-surface-hover"
								onclick={() =>
									choose({
										id: user.id,
										username: user.username,
										displayName: user.displayName,
										avatarUrl: user.avatar?.url ?? null,
										online: false
									})}
								><MessageAvatar name={user.displayName} url={user.avatar?.url} /><span
									><strong class="block text-sm text-text">{user.displayName}</strong><small
										class="text-text-muted">@{user.username}</small
									></span
								></button
							>{/each}
						{#if !users.length}<p class="p-5 text-center text-sm text-text-muted">
								Không tìm thấy người dùng.
							</p>{/if}
					{:else}<p class="p-5 text-center text-sm text-text-muted">
							Nhập ít nhất 2 ký tự để tìm người nhận.
						</p>{/if}
				</div>
			</div>
		</div>
	</div>{/if}
