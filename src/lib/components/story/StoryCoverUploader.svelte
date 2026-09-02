<script lang="ts">
	import { ImagePlus, LoaderCircle, Trash2 } from '@lucide/svelte';
	import { deleteImage, uploadImage } from '$lib/cloudinary';
	import { Button, buttonVariants } from '$lib/components/ui/button';
	import type { CloudinaryAsset } from '$lib/types';
	let {
		storyId,
		cover = $bindable<CloudinaryAsset | null>(null)
	}: { storyId: string; cover?: CloudinaryAsset | null } = $props();
	let uploading = $state(false);
	let progress = $state(0);
	let errorMessage = $state('');
	async function upload(event: Event) {
		const file = (event.currentTarget as HTMLInputElement).files?.[0];
		if (!file || !storyId) return;
		uploading = true;
		errorMessage = '';
		try {
			cover = await uploadImage(file, {
				kind: 'story-cover',
				resourceId: storyId,
				onProgress: (value) => (progress = value)
			});
		} catch (reason) {
			errorMessage = reason instanceof Error ? reason.message : 'Không thể tải bìa.';
		} finally {
			uploading = false;
		}
	}
	async function remove() {
		if (!cover) return;
		try {
			await deleteImage(cover.publicId);
			cover = null;
		} catch (reason) {
			errorMessage = reason instanceof Error ? reason.message : 'Không thể xóa bìa.';
		}
	}
	export function isUploading() {
		return uploading;
	}
</script>

<div>
	<p class="mb-2 text-xs font-semibold tracking-wider text-text-muted uppercase">Bìa truyện</p>
	{#if cover}<div
			class="relative mx-auto aspect-[2/3] max-w-64 overflow-hidden border border-border bg-background"
		>
			<img src={cover.url} alt="Bìa truyện" class="size-full object-cover" /><Button
				type="button"
				variant="destructive"
				size="icon"
				class="absolute top-2 right-2"
				onclick={remove}
				aria-label="Xóa bìa"><Trash2 class="size-4" /></Button
			>
		</div>
	{:else}<label class={`${buttonVariants({ variant: 'outline' })} w-full cursor-pointer`}
			><ImagePlus class="size-4" />{uploading ? `Đang tải ${progress}%` : 'Chọn ảnh bìa 2:3'}<input
				class="sr-only"
				type="file"
				accept="image/jpeg,image/png,image/webp"
				onchange={upload}
				disabled={uploading || !storyId}
			/></label
		>{/if}
	{#if uploading}<p class="mt-2 flex items-center gap-2 text-xs text-text-muted">
			<LoaderCircle class="size-3.5 animate-spin" /> Không rời trang khi ảnh đang tải.
		</p>{/if}
	{#if errorMessage}<p role="alert" class="mt-2 text-xs text-error">{errorMessage}</p>{/if}
</div>
