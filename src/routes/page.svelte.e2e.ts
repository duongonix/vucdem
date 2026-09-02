import { expect, test } from '@playwright/test';

test('renders the production discovery surface on desktop', async ({ page }) => {
	await page.goto('/');

	await expect(page.getByRole('heading', { level: 1 })).toContainText('Bài viết mới');
	await expect(page.getByRole('searchbox', { name: 'Tìm kiếm trên VỰC ĐÊM' })).toBeVisible();
	await expect(page.getByRole('link', { name: 'Đăng bài' })).toBeVisible();
});

test('uses a single mobile column without horizontal overflow', async ({ page }) => {
	await page.setViewportSize({ width: 390, height: 844 });
	await page.goto('/');

	await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
	const widths = await page.evaluate(() => ({
		client: document.documentElement.clientWidth,
		scroll: document.documentElement.scrollWidth
	}));

	expect(widths.scroll).toBe(widths.client);
	await expect(page.getByRole('navigation', { name: 'Điều hướng di động' })).toBeVisible();
	await expect(page.getByRole('link', { name: 'Tìm kiếm' })).toBeVisible();
});

test('switches the application shell across all layout modes', async ({ page }) => {
	await page.setViewportSize({ width: 1536, height: 960 });
	await page.goto('/');
	await expect(page.getByRole('navigation', { name: 'Điều hướng chính' })).toBeVisible();
	await expect(page.getByRole('complementary', { name: 'Khám phá nội dung' })).toBeVisible();
	await expect(page.getByRole('complementary', { name: 'Nội dung bổ sung' })).toBeVisible();

	await page.setViewportSize({ width: 1100, height: 900 });
	await expect(page.getByRole('complementary', { name: 'Khám phá nội dung' })).toBeVisible();
	await expect(page.getByRole('complementary', { name: 'Nội dung bổ sung' })).toBeHidden();

	await page.setViewportSize({ width: 800, height: 900 });
	await expect(page.getByRole('complementary', { name: 'Khám phá nội dung' })).toBeHidden();
	await expect(page.getByRole('button', { name: 'Mở điều hướng' })).toBeVisible();
	await expect(page.getByRole('navigation', { name: 'Điều hướng di động' })).toBeVisible();

	await page.getByRole('button', { name: 'Mở điều hướng' }).click();
	await expect(page.getByRole('dialog')).toBeVisible();
	await expect(page.getByRole('heading', { name: 'Đi trong bóng tối' })).toBeVisible();
});
