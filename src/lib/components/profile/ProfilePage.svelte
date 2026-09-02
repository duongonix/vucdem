<script lang="ts">
	/* eslint-disable svelte/no-navigation-without-resolve -- authenticated message recipient is a dynamic query value */
	import { resolve } from '$app/paths';
	import {
		Camera,
		Edit3,
		LoaderCircle,
		MessageSquare,
		ShieldCheck,
		UserRound
	} from '@lucide/svelte';
	import { deleteImage, uploadImage } from '$lib/cloudinary';
	import { Button, buttonVariants } from '$lib/components/ui/button';
	import {
		Dialog,
		DialogContent,
		DialogDescription,
		DialogHeader,
		DialogTitle,
		DialogTrigger
	} from '$lib/components/ui/dialog';
	import { Input } from '$lib/components/ui/input';
	import { Textarea } from '$lib/components/ui/textarea';
	import { updateProfile } from '$lib/services/users';
	import FollowButton from './FollowButton.svelte';
	import { authStore } from '$lib/stores/auth.svelte';
	import type { CloudinaryAsset, PublicUserProfile } from '$lib/types';
	import ProfileContentTabs from './ProfileContentTabs.svelte';
	import VerifiedBadge from './VerifiedBadge.svelte';

	let { initialProfile }: { initialProfile: PublicUserProfile } = $props();
	function initial() {
		return initialProfile;
	}
	let profile = $state(initial());
	let displayName = $state(initial().displayName);
	let bio = $state(initial().bio);
	let avatar = $state<CloudinaryAsset | null>(initial().avatar);
	let saving = $state(false);
	let uploading = $state(false);
	let progress = $state(0);
	let errorMessage = $state('');
	let successMessage = $state('');

	const isOwner = $derived(authStore.user?.id === profile.id);

	async function selectAvatar(event: Event) {
		const file = (event.currentTarget as HTMLInputElement).files?.[0];
		if (!file) return;
		uploading = true;
		errorMessage = '';
		progress = 0;
		try {
			avatar = await uploadImage(file, {
				kind: 'avatar',
				onProgress: (value) => (progress = value)
			});
		} catch (reason) {
			errorMessage = reason instanceof Error ? reason.message : 'Không thể tải ảnh.';
		} finally {
			uploading = false;
		}
	}

	async function save() {
		saving = true;
		errorMessage = '';
		successMessage = '';
		try {
			profile = await updateProfile(profile.username, { displayName, bio, avatar });
			await authStore.refresh();
			successMessage = 'Hồ sơ đã được cập nhật.';
		} catch (reason) {
			errorMessage = reason instanceof Error ? reason.message : 'Không thể cập nhật hồ sơ.';
		} finally {
			saving = false;
		}
	}

	async function removeAvatar() {
		const asset = avatar;
		avatar = null;
		try {
			profile = await updateProfile(profile.username, { displayName, bio, avatar: null });
			await authStore.refresh();
			if (asset) await deleteImage(asset.publicId);
		} catch (reason) {
			errorMessage = reason instanceof Error ? reason.message : 'Không thể xóa ảnh.';
		}
	}
</script>

<article class="mx-auto w-full max-w-5xl py-6 sm:py-10">
	<section class="relative overflow-hidden border border-border bg-surface">
		<div
			class="h-28 border-b border-border-red bg-[radial-gradient(circle_at_20%_10%,rgba(216,35,35,0.2),transparent_28rem),linear-gradient(120deg,#120707,#070707)] sm:h-40"
		></div>
		<div class="px-5 pb-7 sm:px-8">
			<div class="-mt-12 flex flex-col gap-5 sm:-mt-14 sm:flex-row sm:items-end">
				<div
					class="flex size-24 shrink-0 items-center justify-center overflow-hidden border-4 border-surface bg-surface-2 sm:size-28"
				>
					{#if profile.avatar}
						<img
							src={profile.avatar.url}
							alt={`Ảnh đại diện của ${profile.displayName}`}
							decoding="async"
							class="size-full object-cover"
						/>
					{:else}
						<UserRound class="size-10 text-text-muted" aria-hidden="true" />
					{/if}
				</div>
				<div class="min-w-0 flex-1 pb-1">
					<div class="flex flex-wrap items-center gap-2">
						<h1 class="font-editorial text-4xl font-semibold text-text sm:text-5xl">
							{profile.displayName}
						</h1>
						{#if profile.verify}<VerifiedBadge />{/if}
						{#if profile.role !== 'user'}<span
								class="inline-flex items-center gap-1 border border-border-red px-2 py-0.5 text-[0.65rem] font-semibold tracking-wider text-red uppercase"
								><ShieldCheck class="size-3" />{profile.role}</span
							>{/if}
					</div>
					<p class="mt-1 text-sm text-text-muted">@{profile.username}</p>
				</div>
				{#if isOwner}
					<Dialog>
						<DialogTrigger class={buttonVariants({ variant: 'outline' })}
							><Edit3 class="size-4" /> Chỉnh sửa hồ sơ</DialogTrigger
						>
						<DialogContent class="max-w-lg">
							<DialogHeader
								><DialogTitle>Chỉnh sửa hồ sơ</DialogTitle><DialogDescription
									>Chỉ tên hiển thị, tiểu sử và ảnh đại diện có thể thay đổi ở đây.</DialogDescription
								></DialogHeader
							>
							<div class="space-y-4">
								<div class="flex items-center gap-4 border border-border bg-surface-2 p-3">
									<div
										class="flex size-16 items-center justify-center overflow-hidden bg-background"
									>
										{#if avatar}<img
												src={avatar.url}
												alt="Ảnh đại diện mới"
												class="size-full object-cover"
											/>{:else}<UserRound class="size-7 text-text-muted" />{/if}
									</div>
									<div class="space-y-2">
										<label
											class={`${buttonVariants({ variant: 'outline', size: 'sm' })} cursor-pointer`}
											><Camera class="size-4" /> Chọn ảnh<input
												class="sr-only"
												type="file"
												accept="image/jpeg,image/png,image/webp"
												onchange={selectAvatar}
												disabled={uploading}
											/></label
										>{#if avatar}<Button
												type="button"
												size="sm"
												variant="ghost"
												onclick={removeAvatar}>Xóa ảnh</Button
											>{/if}
									</div>
								</div>
								{#if uploading}<p class="text-xs text-text-muted">Đang tải ảnh… {progress}%</p>{/if}
								<label class="block text-sm text-text-secondary"
									>Tên hiển thị<Input class="mt-1.5" bind:value={displayName} /></label
								>
								<label class="block text-sm text-text-secondary"
									>Tiểu sử<Textarea
										class="mt-1.5 min-h-28"
										bind:value={bio}
										maxlength={300}
									/></label
								>
								{#if errorMessage}<p role="alert" class="text-sm text-error">{errorMessage}</p>{/if}
								{#if successMessage}<p role="status" class="text-sm text-success">
										{successMessage}
									</p>{/if}
								<Button class="w-full" onclick={save} disabled={saving || uploading}
									>{#if saving}<LoaderCircle class="size-4 animate-spin" />{/if} Lưu thay đổi</Button
								>
							</div>
						</DialogContent>
					</Dialog>
				{:else if authStore.initialized}<div class="flex flex-wrap items-center gap-2">
						<FollowButton
							username={profile.username}
							oncountchange={(count) => (profile = { ...profile, followersCount: count })}
						/>
						{#if authStore.status === 'authenticated'}<a
								href={`${resolve('/messages')}?with=${encodeURIComponent(profile.id)}`}
								class={buttonVariants({ variant: 'outline' })}
								><MessageSquare class="size-4" /> Nhắn tin</a
							>{/if}
					</div>{/if}
			</div>
			<p class="mt-6 max-w-2xl text-sm leading-7 whitespace-pre-wrap text-text-secondary">
				{profile.bio || 'Người kể chuyện này chưa để lại lời nhắn nào.'}
			</p>
			<dl class="mt-7 grid grid-cols-2 border-t border-border sm:grid-cols-4">
				{#each [['Người theo dõi', profile.followersCount], ['Đang theo dõi', profile.followingCount], ['Bài viết', profile.postCount], ['Truyện', profile.storyCount]] as stat (stat[0])}
					<div class="border-r border-border px-3 py-4 last:border-r-0">
						<dt class="text-xs tracking-wide text-text-muted uppercase">{stat[0]}</dt>
						<dd class="mt-1 font-editorial text-2xl font-semibold text-text">{stat[1]}</dd>
					</div>
				{/each}
			</dl>
		</div>
	</section>
	<ProfileContentTabs username={profile.username} ownerId={profile.id} />
</article>
