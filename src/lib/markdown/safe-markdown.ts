export const MARKDOWN_UNSUPPORTED_MESSAGE =
	'Markdown không hỗ trợ ảnh, HTML thô hoặc liên kết không an toàn.';

const linkPattern = /!?\[[^\]]*]\(([^)\s]+)(?:\s+"[^"]*")?\)/g;
const htmlTagPattern = /<\/?[a-z][^>]*>/i;

function escapeHtml(value: string): string {
	return value
		.replaceAll('&', '&amp;')
		.replaceAll('<', '&lt;')
		.replaceAll('>', '&gt;')
		.replaceAll('"', '&quot;')
		.replaceAll("'", '&#39;');
}

function isSafeUrl(value: string): boolean {
	try {
		const url = new URL(value, 'https://vucdem.local');
		return ['http:', 'https:', 'mailto:'].includes(url.protocol);
	} catch {
		return false;
	}
}

export function findUnsupportedMarkdownIssues(markdown: string): string[] {
	const issues = new Set<string>();
	if (/!\[[^\]]*]\([^)]+\)/.test(markdown)) issues.add('Không hỗ trợ ảnh Markdown.');
	if (htmlTagPattern.test(markdown)) issues.add('Không hỗ trợ HTML thô.');
	for (const match of markdown.matchAll(linkPattern)) {
		const full = match[0] ?? '';
		const href = match[1] ?? '';
		if (full.startsWith('!')) continue;
		if (!isSafeUrl(href)) issues.add('Liên kết chỉ được dùng http, https hoặc mailto.');
	}
	return [...issues];
}

export function assertSafeMarkdown(markdown: string): string {
	const issues = findUnsupportedMarkdownIssues(markdown);
	if (issues.length) return `${MARKDOWN_UNSUPPORTED_MESSAGE} ${issues[0]}`;
	return '';
}

function renderInline(value: string): string {
	const codeParts = value.split(/(`[^`]+`)/g);
	return codeParts
		.map((part) => {
			if (part.startsWith('`') && part.endsWith('`'))
				return `<code>${escapeHtml(part.slice(1, -1))}</code>`;
			let html = escapeHtml(part);
			html = html.replace(
				/\[([^\]]+)]\((https?:\/\/[^)\s]+|mailto:[^)\s]+)(?:\s+&quot;[^&]*&quot;)?\)/g,
				(_, label: string, href: string) =>
					`<a href="${href}" target="_blank" rel="nofollow noreferrer noopener">${label}</a>`
			);
			html = html.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
			html = html.replace(/__([^_]+)__/g, '<strong>$1</strong>');
			html = html.replace(/(^|[^*])\*([^*]+)\*/g, '$1<em>$2</em>');
			html = html.replace(/(^|[^_])_([^_]+)_/g, '$1<em>$2</em>');
			html = html.replace(/~~([^~]+)~~/g, '<s>$1</s>');
			return html;
		})
		.join('');
}

function flushParagraph(lines: string[], output: string[]) {
	if (!lines.length) return;
	output.push(`<p>${renderInline(lines.join(' '))}</p>`);
	lines.length = 0;
}

function flushList(items: string[], ordered: boolean, output: string[]) {
	if (!items.length) return;
	const tag = ordered ? 'ol' : 'ul';
	output.push(`<${tag}>${items.map((item) => `<li>${renderInline(item)}</li>`).join('')}</${tag}>`);
	items.length = 0;
}

export function renderSafeMarkdown(markdown: string): string {
	const source = markdown.replace(/\r\n?/g, '\n').trim();
	if (!source) return '';
	const output: string[] = [];
	const paragraph: string[] = [];
	const listItems: string[] = [];
	let orderedList = false;
	let inCode = false;
	let codeLanguage = '';
	let codeLines: string[] = [];

	for (const line of source.split('\n')) {
		const trimmed = line.trim();
		const fence = trimmed.match(/^```([a-z0-9_-]+)?\s*$/i);
		if (fence) {
			if (inCode) {
				output.push(
					`<pre><code${codeLanguage ? ` data-language="${escapeHtml(codeLanguage)}"` : ''}>${escapeHtml(codeLines.join('\n'))}</code></pre>`
				);
				inCode = false;
				codeLanguage = '';
				codeLines = [];
			} else {
				flushParagraph(paragraph, output);
				flushList(listItems, orderedList, output);
				inCode = true;
				codeLanguage = fence[1] ?? '';
			}
			continue;
		}
		if (inCode) {
			codeLines.push(line);
			continue;
		}
		if (!trimmed) {
			flushParagraph(paragraph, output);
			flushList(listItems, orderedList, output);
			continue;
		}
		if (/^---+$/.test(trimmed)) {
			flushParagraph(paragraph, output);
			flushList(listItems, orderedList, output);
			output.push('<hr>');
			continue;
		}
		const heading = trimmed.match(/^(#{1,3})\s+(.+)$/);
		if (heading) {
			flushParagraph(paragraph, output);
			flushList(listItems, orderedList, output);
			const level = heading[1].length + 1;
			output.push(`<h${level}>${renderInline(heading[2])}</h${level}>`);
			continue;
		}
		const quote = trimmed.match(/^>\s?(.+)$/);
		if (quote) {
			flushParagraph(paragraph, output);
			flushList(listItems, orderedList, output);
			output.push(`<blockquote><p>${renderInline(quote[1])}</p></blockquote>`);
			continue;
		}
		const unordered = trimmed.match(/^[-*]\s+(.+)$/);
		const ordered = trimmed.match(/^\d+[.)]\s+(.+)$/);
		if (unordered || ordered) {
			flushParagraph(paragraph, output);
			const nextOrdered = Boolean(ordered);
			if (listItems.length && orderedList !== nextOrdered)
				flushList(listItems, orderedList, output);
			orderedList = nextOrdered;
			listItems.push((unordered?.[1] ?? ordered?.[1] ?? '').trim());
			continue;
		}
		flushList(listItems, orderedList, output);
		paragraph.push(trimmed);
	}
	if (inCode) {
		output.push(`<pre><code>${escapeHtml(codeLines.join('\n'))}</code></pre>`);
	}
	flushParagraph(paragraph, output);
	flushList(listItems, orderedList, output);
	return output.join('');
}

export function markdownToPlainText(markdown: string): string {
	return markdown
		.replace(/```[\s\S]*?```/g, ' ')
		.replace(/!\[[^\]]*]\([^)]+\)/g, ' ')
		.replace(/\[([^\]]+)]\([^)]+\)/g, '$1')
		.replace(/[#>*_~`-]/g, ' ')
		.replace(/\d+[.)]\s+/g, ' ')
		.replace(/\s+/g, ' ')
		.trim();
}
