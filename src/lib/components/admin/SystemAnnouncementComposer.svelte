<script lang="ts">
	import { BellRing, LoaderCircle, Send } from '@lucide/svelte';
	import { sendSystemAnnouncement } from '$lib/services/system-announcements';

	let title = $state('');
	let message = $state('');
	let destination = $state('');
	let sending = $state(false);
	let errorMessage = $state('');
	let successMessage = $state('');

	async function submit() {
		if (sending) return;
		sending = true;
		errorMessage = '';
		successMessage = '';
		try {
			const count = await sendSystemAnnouncement({
				title,
				message,
				destination: destination || undefined
			});
			successMessage = `Đã gửi thông báo đến ${count} tài khoản đang hoạt động.`;
			title = '';
			message = '';
			destination = '';
		} catch (reason) {
			errorMessage = reason instanceof Error ? reason.message : 'Không thể gửi thông báo.';
		} finally {
			sending = false;
		}
	}
</script>

<section class="border border-border-red bg-surface p-5 sm:p-7">
	<header class="border-b border-border pb-4">
		<p class="flex items-center gap-2 text-xs tracking-[.16em] text-red uppercase">
			<BellRing class="size-4" /> Phát tín hiệu
		</p>
		<h2 class="mt-1 font-editorial text-3xl text-text">Thông báo hệ thống</h2>
		<p class="mt-1 text-sm text-text-muted">
			Gửi một thông báo riêng tư tới mọi tài khoản đang hoạt động.
		</p>
	</header>
	<form
		class="mt-5 grid gap-4"
		onsubmit={(event) => {
			event.preventDefault();
			void submit();
		}}
	>
		<label
			>Tiêu đề<input
				bind:value={title}
				maxlength="100"
				required
				placeholder="Ví dụ: Bảo trì đêm nay"
			/></label
		>
		<label
			>Nội dung<textarea
				bind:value={message}
				maxlength="600"
				required
				placeholder="Nội dung hiển thị trong thông báo…"></textarea></label
		>
		<label
			>Đường dẫn nội bộ (không bắt buộc)<input
				bind:value={destination}
				maxlength="240"
				placeholder="/discussion"
			/></label
		>
		{#if errorMessage}<p role="alert" class="text-sm text-error">{errorMessage}</p>{/if}
		{#if successMessage}<p role="status" class="text-sm text-success">{successMessage}</p>{/if}
		<button type="submit" disabled={sending} class="send-button"
			>{#if sending}<LoaderCircle class="size-4 animate-spin" />{:else}<Send class="size-4" />{/if}
			Gửi thông báo</button
		>
	</form>
</section>

<style>
	label {
		display: grid;
		gap: 0.45rem;
		font-size: 0.78rem;
		color: var(--color-text-secondary);
	}
	input,
	textarea {
		width: 100%;
		border: 1px solid var(--color-border);
		background: var(--color-background);
		padding: 0.7rem 0.8rem;
		color: var(--color-text);
		outline: none;
	}
	textarea {
		min-height: 8rem;
		resize: vertical;
	}
	input:focus,
	textarea:focus {
		border-color: var(--color-red);
	}
	.send-button {
		display: inline-flex;
		min-height: 2.7rem;
		align-items: center;
		justify-content: center;
		gap: 0.5rem;
		border: 1px solid var(--color-red-dark);
		background: var(--color-red-muted);
		color: var(--color-text);
	}
	.send-button:hover:not(:disabled) {
		border-color: var(--color-red);
		background: var(--color-red-dark);
	}
	.send-button:disabled {
		cursor: not-allowed;
		opacity: 0.55;
	}
</style>
