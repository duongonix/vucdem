<script lang="ts">
	import { Braces, PanelsTopLeft } from '@lucide/svelte';
	import type { InteractiveStoryContent } from '$lib/types';
	import InteractiveJsonEditor from './InteractiveJsonEditor.svelte';
	import InteractiveStoryEditor from './InteractiveStoryEditor.svelte';

	let {
		storyId,
		chapterId,
		fallbackTitle = '',
		value = $bindable(),
		uploading = $bindable(false)
	}: {
		storyId: string;
		chapterId: string;
		fallbackTitle?: string;
		value: InteractiveStoryContent;
		uploading?: boolean;
	} = $props();
	let tab = $state<'editor' | 'json'>('editor');
	let jsonDraft = $state('');
</script>

<section>
	<div
		class="mb-3 flex border-b border-border"
		role="tablist"
		aria-label="Cách soạn truyện nhập vai"
	>
		<button
			type="button"
			role="tab"
			aria-selected={tab === 'editor'}
			class:active={tab === 'editor'}
			class="authoring-tab"
			onclick={() => (tab = 'editor')}
		>
			<PanelsTopLeft class="size-4" /> Trình chỉnh sửa
		</button>
		<button
			type="button"
			role="tab"
			aria-selected={tab === 'json'}
			class:active={tab === 'json'}
			class="authoring-tab"
			onclick={() => (tab = 'json')}
		>
			<Braces class="size-4" /> Nhập JSON
		</button>
	</div>
	{#if tab === 'editor'}
		<InteractiveStoryEditor {storyId} {chapterId} bind:value bind:uploading />
	{:else}
		<InteractiveJsonEditor
			{storyId}
			{chapterId}
			{fallbackTitle}
			bind:value
			bind:raw={jsonDraft}
			onimport={() => (tab = 'editor')}
		/>
	{/if}
</section>

<style>
	.authoring-tab {
		display: inline-flex;
		min-height: 2.75rem;
		align-items: center;
		gap: 0.45rem;
		border-bottom: 2px solid transparent;
		padding: 0 1rem;
		font-size: 0.75rem;
		font-weight: 600;
		letter-spacing: 0.04em;
		color: var(--color-text-muted);
	}
	.authoring-tab:hover {
		color: var(--color-text);
	}
	.authoring-tab.active {
		border-color: var(--color-red);
		color: var(--color-red-bright);
	}
	.authoring-tab:focus-visible {
		outline: 1px solid var(--color-red);
		outline-offset: -3px;
	}
	@media (max-width: 420px) {
		.authoring-tab {
			flex: 1;
			justify-content: center;
			padding-inline: 0.5rem;
		}
	}
</style>
