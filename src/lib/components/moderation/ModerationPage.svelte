<script lang="ts">
	import { onMount } from 'svelte';
	import { LoaderCircle, ShieldAlert } from '@lucide/svelte';
	import { listReports, moderateContent, reviewReport } from '$lib/services/moderation';
	import type { Report } from '$lib/types';
	let reports = $state<Report[]>([]);
	let loading = $state(true);
	let errorMessage = $state('');
	onMount(async () => {
		try {
			reports = await listReports();
		} catch (r) {
			errorMessage = r instanceof Error ? r.message : 'Không thể tải hàng đợi.';
		} finally {
			loading = false;
		}
	});
	async function act(report: Report, action: 'hide' | 'restore' | 'remove' | 'dismiss') {
		try {
			if (action === 'dismiss') await reviewReport(report.id, 'dismissed');
			else {
				await moderateContent(report.targetType, report.targetId, action);
				await reviewReport(report.id, 'resolved');
			}
			reports = reports.filter((r) => r.id !== report.id);
		} catch (r) {
			errorMessage = r instanceof Error ? r.message : 'Không thể xử lý.';
		}
	}
</script>

<div class="mx-auto max-w-5xl py-6">
	<header class="mb-6 border-b border-border pb-5">
		<p class="flex items-center gap-2 text-xs tracking-[.2em] text-red uppercase">
			<ShieldAlert class="size-4" /> Kiểm duyệt
		</p>
		<h1 class="font-editorial text-4xl text-text">Hàng đợi báo cáo</h1>
	</header>
	{#if loading}<p class="flex gap-2 text-text-muted">
			<LoaderCircle class="size-4 animate-spin" /> Đang tải…
		</p>{:else if errorMessage}<p class="border border-error/40 p-4 text-error">
			{errorMessage}
		</p>{:else if reports.length}<div class="grid gap-3">
			{#each reports as report (report.id)}<article class="border border-border bg-surface p-5">
					<div class="flex flex-wrap justify-between gap-3">
						<div>
							<p class="text-xs text-red uppercase">{report.targetType} · {report.reason}</p>
							<p class="mt-1 text-sm text-text-muted">{report.targetId}</p>
						</div>
						<div class="flex flex-wrap gap-2">
							<button class="action" onclick={() => act(report, 'hide')}>Ẩn</button><button
								class="action"
								onclick={() => act(report, 'remove')}>Gỡ</button
							><button class="action" onclick={() => act(report, 'dismiss')}>Bỏ qua</button>
						</div>
					</div>
					{#if report.explanation}<p
							class="mt-4 border-l-2 border-border pl-3 text-sm text-text-secondary"
						>
							{report.explanation}
						</p>{/if}
				</article>{/each}
		</div>{:else}<p class="border border-dashed border-border p-10 text-center text-text-muted">
			Không có báo cáo đang mở.
		</p>{/if}
</div>

<style>
	.action {
		min-height: 2.25rem;
		border: 1px solid var(--color-border);
		padding: 0 0.75rem;
		font-size: 0.75rem;
		color: var(--color-text-secondary);
	}
	.action:hover {
		border-color: var(--color-red);
		color: var(--color-text);
	}
</style>
