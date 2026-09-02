import { describe, expect, it } from 'vitest';
import { splitSpeechText, toReadableSpeechText } from './text';

describe('speech text', () => {
	it('removes HTML and common Markdown without losing readable labels', () => {
		expect(toReadableSpeechText('<strong>Đêm</strong> [trở về](/home) &amp; im lặng.')).toBe(
			'Đêm trở về & im lặng.'
		);
	});

	it('splits long Vietnamese prose into bounded non-empty chunks', () => {
		const chunks = splitSpeechText(`${'Bóng tối tràn về. '.repeat(80)}\n\nCánh cửa mở ra.`, 180);
		expect(chunks.length).toBeGreaterThan(2);
		expect(chunks.every((chunk) => chunk.length > 0 && chunk.length <= 180)).toBe(true);
		expect(chunks.join(' ')).toContain('Cánh cửa mở ra.');
	});

	it('returns no chunks for empty markup', () => {
		expect(splitSpeechText(' <div> </div> ')).toEqual([]);
	});
});
