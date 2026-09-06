<script lang="ts">
	/* eslint-disable svelte/no-at-html-tags -- renderSafeMarkdown escapes raw HTML and only emits a fixed Markdown whitelist. */
	import { renderSafeMarkdown } from '$lib/markdown/safe-markdown';

	let { content, reading = false }: { content: string; reading?: boolean } = $props();
	const html = $derived(renderSafeMarkdown(content));
</script>

<div class:reading class="markdown-content">
	{@html html}
</div>

<style>
	.markdown-content {
		max-width: 52rem;
		color: var(--color-text-secondary);
		font-size: 1.05rem;
		line-height: 1.9;
		overflow-wrap: anywhere;
	}
	.markdown-content :global(p) {
		margin: 0 0 1.35em;
	}
	.markdown-content :global(h2),
	.markdown-content :global(h3),
	.markdown-content :global(h4) {
		margin: 1.65em 0 0.65em;
		font-family: var(--font-editorial);
		line-height: 1.12;
		font-weight: 600;
		color: var(--color-text);
	}
	.markdown-content :global(h2) {
		font-size: 2rem;
	}
	.markdown-content :global(h3) {
		font-size: 1.55rem;
	}
	.markdown-content :global(h4) {
		font-size: 1.25rem;
		color: var(--color-red);
	}
	.markdown-content :global(blockquote) {
		margin: 1.6rem 0;
		border-left: 2px solid var(--color-red-dark);
		background: linear-gradient(90deg, rgb(122 16 16 / 18%), transparent), var(--color-surface);
		padding: 1rem 1.2rem;
		font-family: var(--font-editorial);
		font-size: 1.18em;
		color: var(--color-text);
	}
	.markdown-content :global(blockquote p) {
		margin: 0;
	}
	.markdown-content :global(a) {
		color: var(--color-red-bright);
		text-decoration: underline;
		text-decoration-color: var(--color-red-dark);
		text-underline-offset: 0.2em;
	}
	.markdown-content :global(strong) {
		color: var(--color-text);
		font-weight: 650;
	}
	.markdown-content :global(em) {
		color: var(--color-text);
	}
	.markdown-content :global(ul),
	.markdown-content :global(ol) {
		margin: 0 0 1.45em 1.25rem;
		padding: 0;
	}
	.markdown-content :global(li) {
		margin: 0.45em 0;
		padding-left: 0.25rem;
	}
	.markdown-content :global(li::marker) {
		color: var(--color-red);
	}
	.markdown-content :global(code) {
		border: 1px solid var(--color-border);
		background: var(--color-surface-2);
		padding: 0.1rem 0.35rem;
		font-size: 0.9em;
		color: var(--color-text);
	}
	.markdown-content :global(pre) {
		margin: 1.5rem 0;
		overflow-x: auto;
		border: 1px solid var(--color-border-red);
		background: #050505;
		padding: 1rem;
	}
	.markdown-content :global(pre code) {
		border: 0;
		background: transparent;
		padding: 0;
	}
	.markdown-content :global(hr) {
		margin: 2rem 0;
		border: 0;
		border-top: 1px solid var(--color-border-red);
	}
	.markdown-content.reading {
		max-width: none;
		font-size: inherit;
		line-height: inherit;
		color: inherit;
	}
</style>
