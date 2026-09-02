const HTML_TAG = /<[^>]*>/g;
const MARKDOWN_IMAGE = /!\[([^\]]*)\]\([^)]*\)/g;
const MARKDOWN_LINK = /\[([^\]]+)\]\([^)]*\)/g;
const MARKDOWN_DECORATION = /(^|\s)(?:#{1,6}|>|[-*+]\s)|[*_~`]{1,3}/gm;

export function toReadableSpeechText(value: string): string {
	return value
		.replace(MARKDOWN_IMAGE, '$1')
		.replace(MARKDOWN_LINK, '$1')
		.replace(HTML_TAG, ' ')
		.replace(MARKDOWN_DECORATION, '$1')
		.replace(/&nbsp;/gi, ' ')
		.replace(/&amp;/gi, '&')
		.replace(/&lt;/gi, '<')
		.replace(/&gt;/gi, '>')
		.replace(/&quot;/gi, '"')
		.replace(/&#39;/gi, "'")
		.replace(/\r/g, '')
		.replace(/[ \t]+/g, ' ')
		.replace(/\n[ \t]+/g, '\n')
		.replace(/\n{3,}/g, '\n\n')
		.trim();
}

function splitLongPart(part: string, maximum: number): string[] {
	const chunks: string[] = [];
	let remaining = part.trim();
	while (remaining.length > maximum) {
		const window = remaining.slice(0, maximum + 1);
		const sentenceBreak = Math.max(
			window.lastIndexOf('. '),
			window.lastIndexOf('? '),
			window.lastIndexOf('! '),
			window.lastIndexOf('; '),
			window.lastIndexOf(', ')
		);
		const wordBreak = window.lastIndexOf(' ');
		const cut = sentenceBreak >= Math.floor(maximum * 0.45) ? sentenceBreak + 1 : wordBreak;
		const safeCut = cut > 0 ? cut : maximum;
		chunks.push(remaining.slice(0, safeCut).trim());
		remaining = remaining.slice(safeCut).trim();
	}
	if (remaining) chunks.push(remaining);
	return chunks;
}

export function splitSpeechText(value: string, maximum = 800): string[] {
	const text = toReadableSpeechText(value);
	if (!text) return [];
	const parts = text.split(/\n{2,}|(?<=[.!?…])\s+(?=[A-ZÀ-Ỹ0-9“"'])/u).filter(Boolean);
	const chunks: string[] = [];
	let current = '';
	for (const part of parts.flatMap((item) => splitLongPart(item, maximum))) {
		if (!current) current = part;
		else if (`${current} ${part}`.length <= maximum) current = `${current} ${part}`;
		else {
			chunks.push(current);
			current = part;
		}
	}
	if (current) chunks.push(current);
	return chunks;
}
