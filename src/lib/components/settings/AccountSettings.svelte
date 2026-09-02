<script lang="ts">
	import { Camera, LoaderCircle, Pencil, Trash2, UserRound, X } from '@lucide/svelte';
	import { deleteImage, uploadImage } from '$lib/cloudinary';
	import { updateProfile } from '$lib/services/users';
	import { authStore } from '$lib/stores/auth.svelte';
	import type { CloudinaryAsset } from '$lib/types';
	let editing = $state(false),
		saving = $state(false),
		uploading = $state(false),
		progress = $state(0);
	let displayName = $state(authStore.user?.displayName ?? ''),
		bio = $state(authStore.user?.bio ?? '');
	let avatar = $state<CloudinaryAsset | null>(authStore.user?.avatar ?? null);
	let message = $state(''),
		errorMessage = $state('');
	const joined = $derived(
		authStore.user?.createdAt
			?.toDate?.()
			.toLocaleDateString('vi-VN', { day: '2-digit', month: 'long', year: 'numeric' }) ?? '—'
	);
	async function selectAvatar(event: Event) {
		const file = (event.currentTarget as HTMLInputElement).files?.[0];
		if (!file) return;
		uploading = true;
		errorMessage = '';
		try {
			avatar = await uploadImage(file, {
				kind: 'avatar',
				onProgress: (value) => (progress = value)
			});
			editing = true;
		} catch (reason) {
			errorMessage = reason instanceof Error ? reason.message : 'Không thể tải ảnh.';
		} finally {
			uploading = false;
		}
	}
	async function save() {
		if (!authStore.user || saving) return;
		saving = true;
		message = '';
		errorMessage = '';
		try {
			await updateProfile(authStore.user.username, { displayName, bio, avatar });
			await authStore.refresh();
			editing = false;
			message = 'Đã lưu thay đổi.';
		} catch (reason) {
			errorMessage = reason instanceof Error ? reason.message : 'Không thể lưu thay đổi.';
		} finally {
			saving = false;
		}
	}
	async function removeAvatar() {
		const old = avatar;
		avatar = null;
		await save();
		if (!errorMessage && old) await deleteImage(old.publicId).catch(() => undefined);
	}
</script>

<div class="grid gap-5 p-5 sm:grid-cols-[8rem_minmax(0,1fr)] sm:p-6">
	<div class="flex flex-col items-center">
		<label
			class="group relative grid size-27 cursor-pointer place-items-center overflow-hidden rounded-full border border-red-dark bg-background"
			>{#if avatar}<img
					class="size-full object-cover"
					src={avatar.url}
					alt="Ảnh đại diện hiện tại"
				/>{:else}<UserRound class="size-10 text-text-muted" />{/if}<span
				class="absolute right-0 bottom-1 grid size-8 place-items-center rounded-full border border-border-red bg-surface-2 text-red"
				><Camera class="size-4" /></span
			><input
				class="sr-only"
				type="file"
				accept="image/jpeg,image/png,image/webp"
				onchange={selectAvatar}
				disabled={uploading}
			/></label
		>{#if uploading}<small class="mt-2 text-text-muted">Đang tải {progress}%</small
			>{/if}{#if avatar && editing}<button
				class="mt-2 flex items-center gap-1 text-xs text-text-muted hover:text-error"
				onclick={removeAvatar}><Trash2 class="size-3" /> Xóa ảnh</button
			>{/if}
	</div>
	<div class="min-w-0 divide-y divide-border border-l-0 sm:border-l sm:pl-5">
		<div class="grid min-h-17 items-center gap-2 py-2 sm:grid-cols-[8rem_minmax(0,1fr)_auto]">
			<span class="text-sm text-text-muted">Tên hiển thị</span>{#if editing}<input
					class="field"
					bind:value={displayName}
					maxlength="50"
				/>{:else}<strong class="font-normal text-text">{authStore.user?.displayName}</strong
				>{/if}<button class="edit-button" onclick={() => (editing = !editing)}
				>{#if editing}<X class="size-3.5" /> Hủy{:else}<Pencil class="size-3.5" /> Chỉnh sửa{/if}</button
			>
		</div>
		<div class="grid min-h-17 items-center gap-2 py-2 sm:grid-cols-[8rem_minmax(0,1fr)_auto]">
			<span class="text-sm text-text-muted">Email</span><span class="break-all text-text"
				>{authStore.firebaseUser?.email ?? 'Không có email'}</span
			><span class="hidden sm:block"></span>
		</div>
		<div class="grid min-h-17 items-center gap-2 py-2 sm:grid-cols-[8rem_minmax(0,1fr)_auto]">
			<span class="text-sm text-text-muted">Ngày tham gia</span><span class="text-text"
				>{joined}</span
			><span class="hidden sm:block"></span>
		</div>
		{#if editing}<div class="py-3">
				<label class="text-xs text-text-muted"
					>Tiểu sử<textarea class="field mt-1 min-h-20 py-2" bind:value={bio} maxlength="300"
					></textarea></label
				><button class="save-button" onclick={save} disabled={saving || uploading}
					>{#if saving}<LoaderCircle class="size-4 animate-spin" />{/if} Lưu thay đổi</button
				>
			</div>{/if}
	</div>
</div>
{#if errorMessage}<p class="border-t border-error/30 p-3 text-sm text-error" role="alert">
		{errorMessage}
	</p>{/if}{#if message}<p
		class="border-t border-success/30 p-3 text-sm text-success"
		role="status"
	>
		{message}
	</p>{/if}

<style>
	.field {
		width: 100%;
		border: 1px solid var(--color-border);
		background: var(--color-background);
		padding: 0.55rem 0.7rem;
		color: var(--color-text);
		outline: none;
	}
	.field:focus {
		border-color: var(--color-red-dark);
	}
	.edit-button {
		display: flex;
		align-items: center;
		gap: 0.35rem;
		border: 1px solid var(--color-border-red);
		padding: 0.4rem 0.7rem;
		color: var(--color-red);
		font-size: 0.75rem;
		white-space: nowrap;
	}
	.edit-button:hover,
	.save-button:hover {
		background: color-mix(in srgb, var(--color-red-muted) 30%, transparent);
	}
	.save-button {
		margin-top: 0.7rem;
		display: flex;
		align-items: center;
		gap: 0.4rem;
		border: 1px solid var(--color-red-dark);
		padding: 0.5rem 0.9rem;
		color: var(--color-red-bright);
		font-size: 0.8rem;
	}
</style>
