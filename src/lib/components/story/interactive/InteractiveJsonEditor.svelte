<script lang="ts">
	import { onMount } from 'svelte';
	import {
		Braces,
		Check,
		Clipboard,
		Download,
		FileJson,
		RotateCcw,
		Sparkles,
		Trash2,
		Upload
	} from '@lucide/svelte';
	import type { InteractiveStoryContent } from '$lib/types';
	import {
		INTERACTIVE_JSON_MAX_BYTES,
		interactiveJsonText,
		parseInteractiveJson,
		type InteractiveJsonParseResult
	} from '$lib/interactive-json';

	let {
		storyId,
		chapterId,
		fallbackTitle = '',
		value = $bindable(),
		raw = $bindable(''),
		onimport
	}: {
		storyId: string;
		chapterId: string;
		fallbackTitle?: string;
		value: InteractiveStoryContent;
		raw?: string;
		onimport?: () => void;
	} = $props();

	let result = $state<InteractiveJsonParseResult | null>(null);
	let fileError = $state('');
	let copied = $state(false);
	let showHelp = $state(false);
	const template = `{
  "version": 1,
  "characters": [
    { "id": "player", "name": "Bạn", "role": "player" },
    { "id": "character-1", "name": "Nhân vật", "role": "character" }
  ],
  "events": [
    { "type": "message", "sender": "character-1", "text": "..." }
  ]
}`;

	onMount(() => {
		if (!raw.trim() && (value.events.length || value.characters.length > 1))
			raw = interactiveJsonText(value);
	});

	function validate() {
		fileError = '';
		if (!raw.trim()) {
			result = {
				success: false,
				errors: [{ path: '', message: 'Hãy dán JSON hoặc chọn file từ máy.' }]
			};
			return result;
		}
		result = parseInteractiveJson(raw, { storyId, chapterId, fallbackTitle });
		return result;
	}

	function format() {
		try {
			raw = JSON.stringify(JSON.parse(raw), null, 2);
			validate();
		} catch {
			result = {
				success: false,
				errors: [{ path: '', message: 'JSON không hợp lệ nên chưa thể định dạng.' }]
			};
		}
	}

	function importContent() {
		const checked = validate();
		if (!checked.success) return;
		if (
			(value.events.length > 0 || value.characters.length > 1) &&
			!confirm(
				'Truyện hiện tại đã có nội dung. Nhập JSON sẽ thay thế toàn bộ nhân vật và timeline hiện tại.'
			)
		)
			return;
		value = structuredClone(checked.content);
		raw = JSON.stringify(checked.json, null, 2);
		onimport?.();
	}

	async function chooseFile(event: Event) {
		const input = event.currentTarget as HTMLInputElement;
		const file = input.files?.[0];
		if (!file) return;
		fileError = '';
		result = null;
		if (file.size > INTERACTIVE_JSON_MAX_BYTES) {
			fileError = 'File JSON quá lớn. Giới hạn là 2 MB.';
			input.value = '';
			return;
		}
		try {
			raw = await file.text();
			validate();
		} catch {
			fileError = 'Không thể đọc file JSON.';
		} finally {
			input.value = '';
		}
	}

	function refresh() {
		if (
			raw.trim() &&
			raw !== interactiveJsonText(value) &&
			!confirm('Thay nội dung JSON đang chỉnh bằng dữ liệu hiện tại?')
		)
			return;
		raw = interactiveJsonText(value);
		result = null;
	}

	function exportJson() {
		const blob = new Blob([interactiveJsonText(value)], { type: 'application/json;charset=utf-8' });
		const url = URL.createObjectURL(blob);
		const link = document.createElement('a');
		const base = (fallbackTitle || chapterId || 'interactive-story')
			.normalize('NFD')
			.replace(/[\u0300-\u036f]/g, '')
			.toLowerCase()
			.replace(/[^a-z0-9]+/g, '-')
			.replace(/^-|-$/g, '')
			.slice(0, 60);
		link.href = url;
		link.download = `${base || 'interactive-story'}.interactive.json`;
		link.click();
		URL.revokeObjectURL(url);
	}

	async function copyJson() {
		try {
			await navigator.clipboard.writeText(raw || interactiveJsonText(value));
			copied = true;
			setTimeout(() => (copied = false), 1500);
		} catch {
			fileError = 'Không thể sao chép JSON trên trình duyệt này.';
		}
	}
</script>

<section class="border border-border-red bg-surface-2 p-4 sm:p-5">
	<header class="mb-4 border-b border-border pb-4">
		<div class="flex flex-wrap items-start justify-between gap-3">
			<div>
				<p
					class="flex items-center gap-2 text-xs font-semibold tracking-[.18em] text-red uppercase"
				>
					<Braces class="size-4" /> Nhập JSON
				</p>
				<p class="mt-1 text-sm text-text-muted">Tạo nhanh kịch bản nhập vai bằng JSON V1.</p>
			</div>
			<div class="flex flex-wrap gap-2">
				<label class="tool-button cursor-pointer">
					<Upload class="size-4" /> Chọn file JSON
					<input
						type="file"
						accept=".json,application/json"
						class="sr-only"
						onchange={chooseFile}
					/>
				</label>
				<button type="button" class="tool-button" onclick={exportJson}>
					<Download class="size-4" /> Xuất JSON hiện tại
				</button>
			</div>
		</div>
	</header>

	<div class="mb-3 flex flex-wrap gap-2">
		<button type="button" class="tool-button" onclick={() => (raw = template)}>
			<FileJson class="size-4" /> Dùng mẫu
		</button>
		<button type="button" class="tool-button" onclick={format} disabled={!raw.trim()}>
			<Sparkles class="size-4" /> Định dạng
		</button>
		<button type="button" class="tool-button" onclick={refresh}>
			<RotateCcw class="size-4" /> Tải từ nội dung hiện tại
		</button>
		<button type="button" class="tool-button" onclick={copyJson}>
			{#if copied}<Check class="size-4 text-success" /> Đã sao chép{:else}<Clipboard
					class="size-4"
				/> Sao chép{/if}
		</button>
		<button
			type="button"
			class="tool-button text-error"
			onclick={() => {
				raw = '';
				result = null;
			}}
		>
			<Trash2 class="size-4" /> Xóa
		</button>
	</div>

	<label class="block">
		<span class="sr-only">Nội dung JSON truyện nhập vai</span>
		<textarea
			bind:value={raw}
			oninput={() => (result = null)}
			spellcheck="false"
			placeholder="Dán JSON vào đây hoặc chọn file từ máy."
			class="json-editor min-h-[28rem] w-full resize-y border border-border bg-[#050505] p-4 font-mono text-[13px] leading-6 text-text outline-none focus:border-red"
		></textarea>
	</label>

	{#if fileError}<p class="mt-3 text-sm text-error" role="alert">{fileError}</p>{/if}
	{#if result}
		{#if result.success}
			<div class="mt-3 border-l-2 border-success bg-success/5 px-4 py-3" role="status">
				<p class="flex items-center gap-2 text-sm font-medium text-success">
					<Check class="size-4" /> JSON hợp lệ
				</p>
				<p class="mt-1 text-xs text-text-muted">
					{result.summary.characters} nhân vật · {result.summary.events} sự kiện · {result.summary
						.counts.message ?? 0} tin nhắn · {result.summary.counts.choice ?? 0} lựa chọn
				</p>
				{#if result.warnings.length}<ul class="mt-2 list-disc pl-5 text-xs text-warning">
						{#each result.warnings.slice(0, 5) as warning, index (`${warning.path}:${index}`)}<li>
								{warning.path}: {warning.message}
							</li>{/each}
					</ul>{/if}
			</div>
		{:else}
			<div class="mt-3 border-l-2 border-error bg-error/5 px-4 py-3" role="alert">
				<p class="text-sm font-medium text-error">Không thể nhập truyện</p>
				<ul class="mt-2 list-disc space-y-1 pl-5 text-xs text-error">
					{#each result.errors.slice(0, 8) as error, index (`${error.path}:${index}`)}<li>
							{error.path ? `${error.path}: ` : ''}{error.message}
						</li>{/each}
				</ul>
				{#if result.errors.length > 8}<p class="mt-2 text-xs text-error">
						+ {result.errors.length - 8} lỗi khác
					</p>{/if}
			</div>
		{/if}
	{/if}

	<div class="mt-4 flex flex-wrap items-center gap-2">
		<button type="button" class="secondary-button" onclick={validate}>Kiểm tra</button>
		<button type="button" class="primary-button" onclick={importContent} disabled={!raw.trim()}>
			Nhập vào truyện
		</button>
		<button
			type="button"
			class="ml-auto text-xs text-text-muted underline-offset-4 hover:text-red hover:underline"
			onclick={() => (showHelp = !showHelp)}
		>
			{showHelp ? 'Ẩn định dạng JSON' : 'Xem định dạng JSON'}
		</button>
	</div>

	{#if showHelp}<div
			class="mt-4 border border-border bg-background p-4 text-xs leading-6 text-text-secondary"
		>
			<p><strong class="text-text">Root:</strong> version, conversation, characters, events.</p>
			<p>
				<strong class="text-text">Events:</strong> message, choice, system, typing, delay, image, audio.
			</p>
			<p>Typing/delay dùng mili giây, từ 250 đến 10.000. Choice cần 2–4 phương án.</p>
			<p>
				Media phải là asset Cloudinary đã tải lên đúng Story/Chapter; file JSON không được tải lên
				server.
			</p>
		</div>{/if}
</section>

<style>
	.tool-button,
	.secondary-button,
	.primary-button {
		display: inline-flex;
		min-height: 2.5rem;
		align-items: center;
		justify-content: center;
		gap: 0.4rem;
		border: 1px solid var(--color-border);
		padding: 0.45rem 0.7rem;
		font-size: 0.75rem;
		color: var(--color-text-secondary);
	}
	.tool-button:hover,
	.secondary-button:hover {
		border-color: var(--color-border-red);
		color: var(--color-text);
	}
	.primary-button {
		border-color: var(--color-red-dark);
		background: var(--color-red-muted);
		color: var(--color-text);
	}
	button:disabled {
		cursor: not-allowed;
		opacity: 0.5;
	}
	.json-editor {
		tab-size: 2;
	}
	@media (max-width: 639px) {
		.tool-button,
		.secondary-button,
		.primary-button {
			min-height: 2.75rem;
		}
		.json-editor {
			min-height: 22rem;
			font-size: 0.75rem;
		}
	}
</style>
