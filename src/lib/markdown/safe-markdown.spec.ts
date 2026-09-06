import { describe, expect, it } from 'vitest';
import {
	assertSafeMarkdown,
	findUnsupportedMarkdownIssues,
	markdownToPlainText,
	renderSafeMarkdown
} from './safe-markdown';

describe('safe markdown', () => {
	it('renders supported editorial markdown', () => {
		const html = renderSafeMarkdown('# Mở đầu\n\n> Lời thì thầm\n\n**Đậm** và *nghiêng*');
		expect(html).toContain('<h2>Mở đầu</h2>');
		expect(html).toContain('<blockquote><p>Lời thì thầm</p></blockquote>');
		expect(html).toContain('<strong>Đậm</strong>');
		expect(html).toContain('<em>nghiêng</em>');
	});

	it('escapes raw html and rejects sensitive syntax', () => {
		expect(findUnsupportedMarkdownIssues('<script>alert(1)</script>')).toContain(
			'Không hỗ trợ HTML thô.'
		);
		expect(findUnsupportedMarkdownIssues('![x](https://example.com/a.png)')).toContain(
			'Không hỗ trợ ảnh Markdown.'
		);
		expect(assertSafeMarkdown('[x](javascript:alert(1))')).toContain('Liên kết chỉ được dùng');
		expect(renderSafeMarkdown('<b>đêm</b>')).toContain('&lt;b&gt;đêm&lt;/b&gt;');
	});

	it('creates readable plain text for excerpts', () => {
		expect(markdownToPlainText('## Cánh cửa\n\n[đọc tiếp](https://example.com) **ngay**')).toBe(
			'Cánh cửa đọc tiếp ngay'
		);
	});
});
