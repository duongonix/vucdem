<script lang="ts">
	import { ImagePlus, LoaderCircle, Trash2 } from '@lucide/svelte';
	import { deleteImage, uploadImage } from '$lib/cloudinary';
	import { Button, buttonVariants } from '$lib/components/ui/button';
	import type { CloudinaryAsset } from '$lib/types';

	let {
		postId,
		thumbnail = $bindable<CloudinaryAsset | null>(null),
		images = $bindable<CloudinaryAsset[]>([])
	}: { postId: string; thumbnail?: CloudinaryAsset | null; images?: CloudinaryAsset[] } = $props();

	let thumbnailProgress = $state(0);
	let imageProgress = $state(0);
	let uploadingThumbnail = $state(false);
	let uploadingImage = $state(false);
	let errorMessage = $state('');

	async function uploadThumbnail(event: Event) {
		const file = (event.currentTarget as HTMLInputElement).files?.[0];
		if (!file || !postId) return;
		uploadingThumbnail = true;
		errorMessage = '';
		try {
			thumbnail = await uploadImage(file, {
				kind: 'post-thumbnail',
				resourceId: postId,
				onProgress: (value) => (thumbnailProgress = value)
			});
		} catch (reason) {
			errorMessage = reason instanceof Error ? reason.message : 'Không thể tải ảnh bìa.';
		} finally {
			uploadingThumbnail = false;
		}
	}

	async function uploadAdditional(event: Event) {
		const file = (event.currentTarget as HTMLInputElement).files?.[0];
		if (!file || !postId || images.length >= 10) return;
		uploadingImage = true;
		errorMessage = '';
		try {
			const usedSlots = new Set(
				images
					.map((image) => /\/image-(\d+)$/.exec(image.publicId)?.[1])
					.filter((value): value is string => Boolean(value))
					.map(Number)
			);
			const slot = Array.from({ length: 10 }, (_, index) => index + 1).find(
				(value) => !usedSlots.has(value)
			);
			if (!slot) throw new Error('Đã đạt giới hạn ảnh đính kèm.');
			const asset = await uploadImage(file, {
				kind: 'post-image',
				resourceId: postId,
				slot,
				onProgress: (value) => (imageProgress = value)
			});
			images = [...images, asset];
		} catch (reason) {
			errorMessage = reason instanceof Error ? reason.message : 'Không thể tải ảnh.';
		} finally {
			uploadingImage = false;
		}
	}

	async function remove(asset: CloudinaryAsset, kind: 'thumbnail' | 'image') {
		errorMessage = '';
		try {
			await deleteImage(asset.publicId);
			if (kind === 'thumbnail') thumbnail = null;
			else images = images.filter((item) => item.publicId !== asset.publicId);
		} catch (reason) {
			errorMessage = reason instanceof Error ? reason.message : 'Không thể xóa ảnh.';
		}
	}

	export function isUploading() {
		return uploadingThumbnail || uploadingImage;
	}
</script>

<div class="space-y-5">
	<div>
		<p class="mb-2 text-xs font-semibold tracking-wider text-text-muted uppercase">Ảnh bìa</p>
		{#if thumbnail}
			<div class="relative aspect-[16/9] overflow-hidden border border-border bg-background">
				<img src={thumbnail.url} alt="Ảnh bìa bài viết" class="size-full object-cover" /><Button
					type="button"
					variant="destructive"
					size="icon"
					class="absolute top-2 right-2"
					onclick={() => remove(thumbnail!, 'thumbnail')}
					aria-label="Xóa ảnh bìa"><Trash2 class="size-4" /></Button
				>
			</div>
		{:else}
			<label class={`${buttonVariants({ variant: 'outline' })} w-full cursor-pointer`}
				><ImagePlus class="size-4" />
				{uploadingThumbnail ? `Đang tải ${thumbnailProgress}%` : 'Chọn ảnh bìa'}<input
					class="sr-only"
					type="file"
					accept="image/jpeg,image/png,image/webp"
					onchange={uploadThumbnail}
					disabled={uploadingThumbnail || !postId}
				/></label
			>
		{/if}
	</div>
	<div>
		<div class="mb-2 flex items-center justify-between">
			<p class="text-xs font-semibold tracking-wider text-text-muted uppercase">Ảnh trong bài</p>
			<span class="text-xs text-text-muted">{images.length}/10</span>
		</div>
		<div class="grid grid-cols-3 gap-2">
			{#each images as image (image.publicId)}<div
					class="relative aspect-square overflow-hidden border border-border"
				>
					<img src={image.url} alt="Ảnh đính kèm" class="size-full object-cover" /><button
						type="button"
						class="absolute top-1 right-1 bg-background/85 p-1 text-text-secondary hover:text-red-bright"
						onclick={() => remove(image, 'image')}
						aria-label="Xóa ảnh"><Trash2 class="size-3.5" /></button
					>
				</div>{/each}
			{#if images.length < 10}<label
					class="flex aspect-square cursor-pointer items-center justify-center border border-dashed border-border text-text-muted hover:border-border-red hover:text-red"
					><input
						class="sr-only"
						type="file"
						accept="image/jpeg,image/png,image/webp"
						onchange={uploadAdditional}
						disabled={uploadingImage || !postId}
					/>{#if uploadingImage}<span class="text-xs">{imageProgress}%</span>{:else}<ImagePlus
							class="size-5"
						/><span class="sr-only">Thêm ảnh</span>{/if}</label
				>{/if}
		</div>
	</div>
	{#if uploadingThumbnail || uploadingImage}<p
			class="flex items-center gap-2 text-xs text-text-muted"
		>
			<LoaderCircle class="size-3.5 animate-spin" /> Không rời trang khi ảnh đang tải.
		</p>{/if}
	{#if errorMessage}<p role="alert" class="text-xs text-error">{errorMessage}</p>{/if}
</div>
