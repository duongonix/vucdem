import { page } from 'vitest/browser';
import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';
import DesignSystemPreview from './DesignSystemPreview.svelte';

describe('DesignSystemPreview', () => {
	it('renders the editorial hierarchy and switches accessible tabs', async () => {
		render(DesignSystemPreview);

		await expect
			.element(page.getByRole('heading', { level: 1 }))
			.toHaveTextContent('Những lời thì thầm');

		await page.getByRole('tab', { name: 'Biểu mẫu' }).click();
		await expect
			.element(page.getByPlaceholder('Một tiêu đề khiến người đọc mất ngủ…'))
			.toBeVisible();
	});

	it('opens and closes the accessible dialog', async () => {
		render(DesignSystemPreview);

		await page.getByRole('button', { name: 'Đọc cảnh báo' }).click();
		await expect.element(page.getByRole('dialog')).toBeVisible();
		await expect.element(page.getByText('Rời khỏi vùng an toàn?')).toBeVisible();

		await page.getByRole('button', { name: 'Quay lại' }).click();
		await expect.element(page.getByRole('dialog')).not.toBeInTheDocument();
	});
});
