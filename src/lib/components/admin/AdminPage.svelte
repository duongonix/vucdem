<script lang="ts">
	import { onMount } from 'svelte';
	import {
		BadgeCheck,
		ClipboardCheck,
		FileStack,
		Flag,
		LayoutList,
		LoaderCircle,
		Pin,
		PinOff,
		ShieldCheck,
		Users
	} from '@lucide/svelte';
	import {
		listAdminResources,
		updateAdminResourcePin,
		updateAdminResourceStatus,
		updateAdminUser
	} from '$lib/services/moderation';
	import ModerationPage from '$lib/components/moderation/ModerationPage.svelte';
	import PostCategoryManager from './PostCategoryManager.svelte';
	import ApprovalQueue from './ApprovalQueue.svelte';
	import { listApprovalQueue } from '$lib/services/approvals';
	let tab = $state<'reports' | 'approvals' | 'users' | 'content' | 'categories'>('reports');
	let type = $state('users');
	let items = $state<Record<string, unknown>[]>([]);
	let loading = $state(false);
	let errorMessage = $state('');
	let approvalCount = $state(0);
	const tabs = [
		{ id: 'reports' as const, label: 'Báo cáo', description: 'Hàng đợi kiểm duyệt', icon: Flag },
		{
			id: 'approvals' as const,
			label: 'Phê duyệt',
			description: 'Duyệt trước xuất bản',
			icon: ClipboardCheck
		},
		{ id: 'users' as const, label: 'Người dùng', description: 'Vai trò và xác minh', icon: Users },
		{
			id: 'content' as const,
			label: 'Nội dung',
			description: 'Bài viết và truyện',
			icon: FileStack
		},
		{
			id: 'categories' as const,
			label: 'Danh mục',
			description: 'Phân loại thảo luận',
			icon: LayoutList
		}
	];
	async function load(next = type) {
		type = next;
		loading = true;
		errorMessage = '';
		try {
			items = await listAdminResources(type);
		} catch (r) {
			errorMessage = r instanceof Error ? r.message : 'Không thể tải dữ liệu.';
		} finally {
			loading = false;
		}
	}
	onMount(() => {
		void listApprovalQueue()
			.then(
				(queue) =>
					(approvalCount =
						queue.posts.length +
						queue.shortStories.length +
						queue.serialStories.length +
						queue.serialChapters.length)
			)
			.catch(() => (approvalCount = 0));
	});
	async function userAction(
		id: string,
		field: 'role' | 'status' | 'verify',
		value: string | boolean
	) {
		if (!confirm(`Xác nhận thay đổi ${field} của tài khoản này?`)) return;
		try {
			await updateAdminUser(id, { [field]: value });
			await load('users');
		} catch (r) {
			errorMessage = r instanceof Error ? r.message : 'Không thể cập nhật.';
		}
	}
	async function contentAction(id: string, status: string) {
		if (!confirm(`Xác nhận chuyển trạng thái nội dung thành “${status}”?`)) return;
		try {
			await updateAdminResourceStatus(type, id, status);
			await load(type);
		} catch (r) {
			errorMessage = r instanceof Error ? r.message : 'Không thể cập nhật.';
		}
	}
	async function pinAction(id: string, pinned: boolean) {
		if (!confirm(pinned ? 'Ghim nội dung này lên trang chủ?' : 'Bỏ ghim nội dung này?')) return;
		try {
			await updateAdminResourcePin(type as 'posts' | 'stories', id, pinned);
			await load(type);
		} catch (r) {
			errorMessage = r instanceof Error ? r.message : 'Không thể cập nhật ghim.';
		}
	}
	function statusOptions() {
		if (type === 'stories') return ['ongoing', 'hiatus', 'completed', 'hidden', 'removed'];
		if (type === 'communities') return ['active', 'hidden', 'removed'];
		return ['published', 'hidden', 'removed'];
	}
</script>

<div class="mx-auto max-w-7xl py-6 sm:py-10">
	<header class="admin-hero mb-6 border border-border-red px-5 py-6 sm:px-8">
		<p class="flex items-center gap-2 text-xs tracking-[.2em] text-red uppercase">
			<ShieldCheck class="size-4" /> Quản trị
		</p>
		<h1 class="mt-2 font-editorial text-4xl text-text sm:text-5xl">Bảng điều khiển Vực Đêm</h1>
		<p class="mt-2 max-w-2xl text-sm leading-6 text-text-muted">
			Quản lý thành viên, kiểm duyệt nội dung và bảo vệ trật tự của cộng đồng.
		</p>
	</header>
	<nav class="mb-7 grid gap-2 sm:grid-cols-2 xl:grid-cols-5" aria-label="Khu vực quản trị">
		{#each tabs as entry (entry.id)}{@const Icon = entry.icon}<button
				class:active-tab={tab === entry.id}
				class="admin-tab group relative flex min-h-20 items-center gap-3 overflow-hidden border border-border bg-surface px-4 text-left transition-colors hover:border-border-red"
				onclick={() => {
					tab = entry.id;
					if (tab === 'users') void load('users');
					if (tab === 'content') void load('posts');
				}}
				><span
					class="tab-icon grid size-10 shrink-0 place-items-center border border-border bg-background text-text-muted"
					><Icon class="size-5" /></span
				><span
					><strong class="flex items-center gap-2 font-editorial text-lg text-text"
						>{entry.label}{#if entry.id === 'approvals' && approvalCount > 0}<span
								class="grid min-w-5 place-items-center bg-red px-1 font-sans text-[.65rem] leading-5 text-white"
								>{approvalCount > 99 ? '99+' : approvalCount}</span
							>{/if}</strong
					><small class="text-xs text-text-muted">{entry.description}</small></span
				></button
			>{/each}
	</nav>
	{#if tab === 'reports'}<ModerationPage />{:else if tab === 'approvals'}<ApprovalQueue
			oncountchange={(count) => (approvalCount = count)}
		/>{:else if tab === 'categories'}<PostCategoryManager />{:else}<div
			class="mb-4 flex flex-wrap gap-2"
		>
			{#if tab === 'content'}{#each ['posts', 'stories', 'comments', 'communities'] as resource (resource)}<button
						class:resource-active={type === resource}
						class="resource-tab border border-border px-4 py-2 text-xs font-semibold tracking-wide text-text-secondary uppercase hover:border-red"
						onclick={() => load(resource)}>{resource}</button
					>{/each}{/if}
		</div>
		{#if loading}<p class="flex gap-2 text-text-muted">
				<LoaderCircle class="size-4 animate-spin" /> Đang tải…
			</p>{:else if errorMessage}<p class="text-error">{errorMessage}</p>{:else}<div
				class="overflow-x-auto border border-border"
			>
				<table class="w-full min-w-2xl text-left text-sm">
					<thead class="bg-surface-2 text-xs text-text-muted uppercase"
						><tr
							><th class="p-3">ID</th><th class="p-3">Tên / tiêu đề</th><th class="p-3"
								>Trạng thái</th
							>{#if tab === 'users'}<th class="p-3">Xác minh</th>{/if}<th class="p-3">Thao tác</th
							></tr
						></thead
					><tbody
						>{#each items as item (String(item.id))}<tr class="border-t border-border"
								><td class="max-w-48 truncate p-3 text-text-muted">{String(item.id)}</td><td
									class="p-3 text-text"
									><span class="inline-flex items-center gap-2"
										>{String(
											item.displayName ?? item.title ?? item.name ?? '—'
										)}{#if item.isPinned === true}<Pin
												class="size-3.5 text-red"
												aria-label="Đã ghim"
											/>{/if}</span
									></td
								><td class="p-3 text-text-secondary">{String(item.status ?? item.role ?? '—')}</td
								>{#if tab === 'users'}<td class="p-3"
										><button
											onclick={() => userAction(String(item.id), 'verify', item.verify !== true)}
											class:verified={item.verify === true}
											class="verify-button inline-flex items-center gap-1.5 border px-2.5 py-1.5 text-xs"
											><BadgeCheck class="size-4" />{item.verify === true
												? 'Đã xác minh'
												: 'Chưa xác minh'}</button
										></td
									>{/if}<td class="p-3"
									>{#if tab === 'users'}<div class="flex gap-2">
											<select
												aria-label="Vai trò"
												value={String(item.role)}
												onchange={(e) => userAction(String(item.id), 'role', e.currentTarget.value)}
												class="field"
												><option value="user">user</option><option value="moderator"
													>moderator</option
												><option value="admin">admin</option></select
											><select
												aria-label="Trạng thái"
												value={String(item.status)}
												onchange={(e) =>
													userAction(String(item.id), 'status', e.currentTarget.value)}
												class="field"
												><option value="active">active</option><option value="suspended"
													>suspended</option
												><option value="banned">banned</option></select
											>
										</div>{:else}<div class="flex items-center gap-2">
											<select
												aria-label="Trạng thái nội dung"
												value={String(item.status)}
												onchange={(e) => contentAction(String(item.id), e.currentTarget.value)}
												class="field"
												>{#each statusOptions() as status (status)}<option value={status}
														>{status}</option
													>{/each}</select
											>{#if type === 'posts' || type === 'stories'}<button
													class:pinned={item.isPinned === true}
													class="pin-button inline-flex items-center gap-1.5 border px-2.5 py-1.5 text-xs"
													onclick={() => pinAction(String(item.id), item.isPinned !== true)}
													>{#if item.isPinned === true}<PinOff class="size-4" /> Bỏ ghim{:else}<Pin
															class="size-4"
														/> Ghim{/if}</button
												>{/if}
										</div>{/if}</td
								></tr
							>{/each}</tbody
					>
				</table>
			</div>{/if}{/if}
</div>

<style>
	.admin-hero {
		background:
			radial-gradient(circle at 85% 0%, rgba(145, 18, 25, 0.2), transparent 25rem),
			linear-gradient(115deg, #100708, #070707 58%);
		box-shadow: inset 3px 0 0 var(--color-red-dark);
	}
	.admin-tab::after {
		content: '';
		position: absolute;
		inset: auto 0 0;
		height: 2px;
		background: transparent;
	}
	.admin-tab.active-tab {
		border-color: var(--color-border-red);
		background: var(--color-surface-hover);
	}
	.admin-tab.active-tab::after {
		background: var(--color-red);
		box-shadow: 0 0 14px rgba(216, 35, 35, 0.65);
	}
	.admin-tab.active-tab .tab-icon {
		border-color: var(--color-red);
		color: var(--color-red-bright);
		background: var(--color-red-muted);
	}
	.resource-tab.resource-active {
		border-color: var(--color-red);
		background: var(--color-red-muted);
		color: var(--color-text);
	}
	.verify-button {
		border-color: var(--color-border);
		color: var(--color-text-muted);
	}
	.verify-button.verified {
		border-color: #145b82;
		background: rgba(22, 128, 190, 0.12);
		color: #32a8ff;
	}
	.field {
		height: 2rem;
		border: 1px solid var(--color-border);
		background: var(--color-surface-2);
		padding: 0 0.4rem;
		color: var(--color-text);
	}
	.pin-button {
		border-color: var(--color-border);
		color: var(--color-text-secondary);
	}
	.pin-button:hover,
	.pin-button.pinned {
		border-color: var(--color-border-red);
		background: var(--color-red-muted);
		color: var(--color-red-bright);
	}
</style>
