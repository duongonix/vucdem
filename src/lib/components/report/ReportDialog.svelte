<script lang="ts">
	import { Flag, LoaderCircle } from '@lucide/svelte';
	import { Button, buttonVariants } from '$lib/components/ui/button';
	import {
		Dialog,
		DialogContent,
		DialogDescription,
		DialogHeader,
		DialogTitle,
		DialogTrigger
	} from '$lib/components/ui/dialog';
	import { Textarea } from '$lib/components/ui/textarea';
	import { createReport } from '$lib/services/reports';
	import type { ReportReason, ReportTargetType } from '$lib/types';
	let {
		targetType,
		targetId,
		triggerClass = buttonVariants({ variant: 'ghost', size: 'sm' })
	}: { targetType: ReportTargetType; targetId: string; triggerClass?: string } = $props();
	let reason = $state<ReportReason>('spam');
	let explanation = $state('');
	let pending = $state(false);
	let sent = $state(false);
	let errorMessage = $state('');
	async function submit() {
		pending = true;
		errorMessage = '';
		try {
			await createReport({ targetType, targetId, reason, explanation });
			sent = true;
		} catch (r) {
			errorMessage = r instanceof Error ? r.message : 'Không thể gửi báo cáo.';
		} finally {
			pending = false;
		}
	}
</script>

<Dialog
	><DialogTrigger class={triggerClass}><Flag class="size-4" /> Báo cáo</DialogTrigger><DialogContent
		class="max-w-md"
		><DialogHeader
			><DialogTitle>Báo cáo nội dung</DialogTitle><DialogDescription
				>Báo cáo được gửi riêng tới đội ngũ kiểm duyệt.</DialogDescription
			></DialogHeader
		>{#if sent}<p class="border border-success/30 p-5 text-sm text-success">
				Đã gửi báo cáo. Cảm ơn bạn đã bảo vệ cộng đồng.
			</p>{:else}<div class="space-y-4">
				<label class="block text-sm text-text-secondary"
					>Lý do<select
						bind:value={reason}
						class="mt-1 h-10 w-full border border-border bg-surface-2 px-3 text-text"
						><option value="spam">Spam</option><option value="harassment">Quấy rối</option><option
							value="nsfw">Nội dung nhạy cảm</option
						><option value="stolen_content">Đánh cắp nội dung</option><option value="other"
							>Khác</option
						></select
					></label
				><label class="block text-sm text-text-secondary"
					>Giải thích (không bắt buộc)<Textarea
						bind:value={explanation}
						maxlength={1000}
						class="mt-1 min-h-28"
					/></label
				>{#if errorMessage}<p class="text-sm text-error">{errorMessage}</p>{/if}<Button
					class="w-full"
					onclick={submit}
					disabled={pending}
					>{#if pending}<LoaderCircle class="size-4 animate-spin" />{/if} Gửi báo cáo</Button
				>
			</div>{/if}</DialogContent
	></Dialog
>
