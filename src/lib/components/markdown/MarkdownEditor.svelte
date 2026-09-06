<script lang="ts">
	import { Eye, Heading2, List, PencilLine, Quote, ShieldAlert } from '@lucide/svelte';
	import { assertSafeMarkdown } from '$lib/markdown/safe-markdown';
	import MarkdownContent from './MarkdownContent.svelte';

	let {
		id,
		value = $bindable(),
		maxlength,
		placeholder,
		minHeight = '28rem'
	}: {
		id: string;
		value: string;
		maxlength: number;
		placeholder: string;
		minHeight?: string;
	} = $props();

	let mode = $state<'write' | 'preview'>('write');
	const issue = $derived(assertSafeMarkdown(value));

	function wrap(before: string, after = before) {
		const addition = `${before}văn bản${after}`;
		value = value ? `${value}\n${addition}` : addition;
	}
</script>

<div class="markdown-editor">
	<div class="markdown-toolbar" aria-label="Công cụ Markdown">
		<div class="toolbar-actions">
			<button type="button" aria-label="Thêm tiêu đề" onclick={() => wrap('## ', '')}
				><Heading2 class="size-4" /></button
			>
			<button type="button" aria-label="Thêm trích dẫn" onclick={() => wrap('> ', '')}
				><Quote class="size-4" /></button
			>
			<button type="button" aria-label="Thêm danh sách" onclick={() => wrap('- ', '')}
				><List class="size-4" /></button
			>
		</div>
		<div class="mode-switch">
			<button type="button" class:active={mode === 'write'} onclick={() => (mode = 'write')}
				><PencilLine class="size-4" /> Viết</button
			>
			<button type="button" class:active={mode === 'preview'} onclick={() => (mode = 'preview')}
				><Eye class="size-4" /> Xem trước</button
			>
		</div>
	</div>
	{#if mode === 'write'}<textarea
			{id}
			bind:value
			{maxlength}
			style:min-height={minHeight}
			class="markdown-textarea"
			{placeholder}></textarea>{:else}<div class="markdown-preview" style:min-height={minHeight}>
			{#if value.trim()}<MarkdownContent content={value} />{:else}<p class="preview-empty">
					Chưa có nội dung để xem trước.
				</p>{/if}
		</div>{/if}
	<div class="markdown-footer">
		<p class:invalid={Boolean(issue)}>
			{#if issue}<ShieldAlert class="size-3.5" /> {issue}{:else}Hỗ trợ tiêu đề, trích dẫn, danh
				sách, in đậm/nghiêng, code và liên kết an toàn. Ảnh Markdown và HTML thô bị chặn.{/if}
		</p>
		<span>{value.length.toLocaleString('vi-VN')} / {maxlength.toLocaleString('vi-VN')}</span>
	</div>
</div>

<style>
	.markdown-editor {
		overflow: hidden;
		border: 1px solid var(--color-border);
		background: var(--color-background);
	}
	.markdown-toolbar {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 0.75rem;
		border-bottom: 1px solid var(--color-border);
		background: linear-gradient(90deg, rgb(122 16 16 / 14%), transparent), var(--color-surface);
		padding: 0.55rem;
	}
	.toolbar-actions,
	.mode-switch {
		display: flex;
		align-items: center;
		gap: 0.35rem;
	}
	.toolbar-actions button,
	.mode-switch button {
		display: inline-flex;
		min-height: 2rem;
		align-items: center;
		gap: 0.35rem;
		border: 1px solid transparent;
		padding: 0 0.65rem;
		color: var(--color-text-muted);
		font-size: 0.75rem;
		transition:
			border-color 160ms ease,
			color 160ms ease,
			background-color 160ms ease;
	}
	.toolbar-actions button:hover,
	.mode-switch button:hover,
	.mode-switch button.active {
		border-color: var(--color-border-red);
		background: rgb(77 18 18 / 45%);
		color: var(--color-text);
	}
	.markdown-textarea {
		width: 100%;
		resize: vertical;
		border: 0;
		background: transparent;
		padding: 1.25rem;
		color: var(--color-text);
		font-size: 1rem;
		line-height: 1.85;
		outline: none;
	}
	.markdown-textarea::placeholder {
		color: var(--color-text-muted);
	}
	.markdown-preview {
		overflow: auto;
		padding: 1.25rem;
	}
	.preview-empty {
		color: var(--color-text-muted);
		font-size: 0.875rem;
	}
	.markdown-footer {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 1rem;
		border-top: 1px solid var(--color-border);
		background: var(--color-surface);
		padding: 0.65rem 0.8rem;
		font-size: 0.72rem;
		color: var(--color-text-muted);
	}
	.markdown-footer p {
		display: flex;
		min-width: 0;
		align-items: center;
		gap: 0.35rem;
	}
	.markdown-footer p.invalid {
		color: var(--color-error);
	}
	.markdown-footer span {
		flex: 0 0 auto;
		color: var(--color-text-secondary);
	}
	@media (max-width: 640px) {
		.markdown-toolbar,
		.markdown-footer {
			align-items: stretch;
			flex-direction: column;
		}
		.mode-switch {
			display: grid;
			grid-template-columns: 1fr 1fr;
		}
		.mode-switch button {
			justify-content: center;
		}
		.markdown-textarea,
		.markdown-preview {
			padding: 1rem;
		}
	}
</style>
