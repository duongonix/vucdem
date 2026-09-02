<script lang="ts">
	import { onMount } from 'svelte';
	import { LoaderCircle, Pencil, Plus, Save, Trash2, X } from '@lucide/svelte';
	import type { PostCategoryDefinition } from '$lib/types';
	import {
		createPostCategory,
		deletePostCategory,
		listAdminPostCategories,
		updatePostCategory
	} from '$lib/services/post-categories';

	let categories = $state<PostCategoryDefinition[]>([]);
	let loading = $state(true);
	let pending = $state(false);
	let errorMessage = $state('');
	let editingId = $state<string | null>(null);
	let id = $state('');
	let name = $state('');
	let description = $state('');
	let order = $state(0);
	let status = $state<'active' | 'inactive'>('active');

	function slugify(value: string) {
		return value
			.normalize('NFD')
			.replace(/[\u0300-\u036f]/g, '')
			.toLowerCase()
			.trim()
			.replace(/đ/g, 'd')
			.replace(/[^a-z0-9]+/g, '-')
			.replace(/^-|-$/g, '');
	}
	function reset() {
		editingId = null;
		id = '';
		name = '';
		description = '';
		order = (categories.at(-1)?.order ?? 0) + 10;
		status = 'active';
	}
	function edit(category: PostCategoryDefinition) {
		editingId = category.id;
		id = category.id;
		name = category.name;
		description = category.description;
		order = category.order;
		status = category.status;
	}
	async function load() {
		loading = true;
		errorMessage = '';
		try {
			categories = await listAdminPostCategories();
			reset();
		} catch (reason) {
			errorMessage = reason instanceof Error ? reason.message : 'Không thể tải danh mục.';
		} finally {
			loading = false;
		}
	}
	async function submit(event: SubmitEvent) {
		event.preventDefault();
		pending = true;
		errorMessage = '';
		try {
			const input = { name, description, order: Number(order), status };
			if (editingId) await updatePostCategory(editingId, input);
			else await createPostCategory(id || slugify(name), input);
			await load();
		} catch (reason) {
			errorMessage = reason instanceof Error ? reason.message : 'Không thể lưu danh mục.';
		} finally {
			pending = false;
		}
	}
	async function remove(category: PostCategoryDefinition) {
		if (!confirm(`Xóa danh mục “${category.name}”?`)) return;
		pending = true;
		errorMessage = '';
		try {
			await deletePostCategory(category.id);
			await load();
		} catch (reason) {
			errorMessage = reason instanceof Error ? reason.message : 'Không thể xóa danh mục.';
		} finally {
			pending = false;
		}
	}
	onMount(load);
</script>

<div class="grid gap-6 lg:grid-cols-[minmax(0,1fr)_22rem]">
	<section class="border border-border bg-surface">
		<header class="border-b border-border px-4 py-3">
			<h2 class="font-editorial text-2xl text-text">Danh mục bài đăng</h2>
			<p class="text-sm text-text-muted">
				Các mục này đồng thời xuất hiện trong phần Chủ đề ở sidebar.
			</p>
		</header>
		{#if loading}<p class="flex items-center gap-2 p-4 text-text-muted">
				<LoaderCircle class="size-4 animate-spin" /> Đang tải…
			</p>
		{:else if categories.length === 0}<p class="p-4 text-text-muted">Chưa có danh mục.</p>
		{:else}<ul class="divide-y divide-border">
				{#each categories as category (category.id)}<li class="flex items-center gap-3 p-4">
						<div class="min-w-0 flex-1">
							<div class="flex items-center gap-2">
								<strong class="text-text">{category.name}</strong><span
									class="border border-border-red px-1.5 py-0.5 text-[.65rem] text-red uppercase"
									>{category.status === 'active' ? 'Đang dùng' : 'Đã tắt'}</span
								>
							</div>
							<p class="truncate text-xs text-text-muted">
								{category.id} · thứ tự {category.order}
							</p>
						</div>
						<button class="icon" aria-label={`Sửa ${category.name}`} onclick={() => edit(category)}
							><Pencil class="size-4" /></button
						><button
							class="icon hover:text-error"
							aria-label={`Xóa ${category.name}`}
							onclick={() => remove(category)}
							disabled={pending}><Trash2 class="size-4" /></button
						>
					</li>{/each}
			</ul>{/if}
	</section>
	<form class="h-fit border border-border-red bg-surface p-5 lg:sticky lg:top-24" onsubmit={submit}>
		<div class="mb-5 flex items-center justify-between">
			<h2 class="font-editorial text-2xl text-red">
				{editingId ? 'Sửa danh mục' : 'Thêm danh mục'}
			</h2>
			{#if editingId}<button type="button" class="icon" aria-label="Hủy chỉnh sửa" onclick={reset}
					><X class="size-4" /></button
				>{/if}
		</div>
		<label class="label"
			>Tên<input
				class="field"
				bind:value={name}
				required
				minlength="2"
				maxlength="80"
				oninput={() => {
					if (!editingId) id = slugify(name);
				}}
			/></label
		>
		<label class="label"
			>Mã danh mục<input
				class="field"
				bind:value={id}
				required
				pattern="[a-z0-9]+(?:-[a-z0-9]+)*"
				disabled={Boolean(editingId)}
			/></label
		>
		<label class="label"
			>Mô tả<textarea class="field min-h-20 py-2" bind:value={description} maxlength="240"
			></textarea></label
		>
		<label class="label"
			>Thứ tự<input class="field" type="number" min="0" max="999" bind:value={order} /></label
		>
		<label class="label"
			>Trạng thái<select class="field" bind:value={status}
				><option value="active">Đang dùng</option><option value="inactive">Tạm tắt</option></select
			></label
		>
		<button
			class="mt-2 flex h-10 w-full items-center justify-center gap-2 border border-red-dark bg-red-muted/40 text-sm text-red-bright hover:bg-red-muted/70"
			disabled={pending}
			>{#if pending}<LoaderCircle class="size-4 animate-spin" />{:else if editingId}<Save
					class="size-4"
				/>{:else}<Plus class="size-4" />{/if}{editingId ? 'Lưu thay đổi' : 'Thêm danh mục'}</button
		>
		{#if errorMessage}<p
				class="mt-3 border-l-2 border-error bg-error/10 p-2 text-sm text-error"
				role="alert"
			>
				{errorMessage}
			</p>{/if}
	</form>
</div>

<style>
	.label {
		display: grid;
		gap: 0.4rem;
		margin-bottom: 1rem;
		color: var(--color-text-muted);
		font-size: 0.75rem;
		text-transform: uppercase;
		letter-spacing: 0.08em;
	}
	.field {
		width: 100%;
		min-height: 2.5rem;
		border: 1px solid var(--color-border);
		background: var(--color-surface-2);
		padding: 0 0.7rem;
		color: var(--color-text);
		outline: none;
		text-transform: none;
		letter-spacing: normal;
	}
	.field:focus {
		border-color: var(--color-red-dark);
	}
	.field:disabled {
		opacity: 0.55;
	}
	.icon {
		display: grid;
		width: 2.25rem;
		height: 2.25rem;
		place-items: center;
		color: var(--color-text-muted);
	}
	.icon:hover {
		color: var(--color-red);
	}
</style>
