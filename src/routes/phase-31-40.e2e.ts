import { expect, test } from '@playwright/test';

test('search and settings routes expose accessible MVP states', async ({ page }) => {
	await page.goto('/search');
	await expect(page.getByRole('heading', { name: 'Tìm trong bóng tối' })).toBeVisible();
	await expect(page.getByRole('searchbox', { name: 'Tìm kiếm trên VỰC ĐÊM' })).toBeVisible();
	await expect(page.getByPlaceholder('Tên người dùng, cộng đồng hoặc thẻ…')).toBeVisible();

	await page.goto('/settings');
	await expect(page).toHaveURL(/\/auth\/login\?redirect=%2Fsettings/);
});

test('core navigation remains usable without horizontal overflow on mobile', async ({ page }) => {
	await page.setViewportSize({ width: 390, height: 844 });
	await page.goto('/search');
	await expect(page.getByRole('navigation', { name: 'Điều hướng di động' })).toBeVisible();
	await expect(page.getByRole('link', { name: 'Tìm kiếm' })).toBeVisible();
	const widths = await page.evaluate(() => ({
		client: document.documentElement.clientWidth,
		scroll: document.documentElement.scrollWidth
	}));
	expect(widths.scroll).toBe(widths.client);
});

test('privileged routes redirect guests before rendering private UI', async ({ page }) => {
	await page.goto('/admin');
	await expect(page).toHaveURL(/\/auth\/login\?redirect=%2Fadmin/);
	await page.goto('/moderation');
	await expect(page).toHaveURL(/\/auth\/login\?redirect=%2Fmoderation/);
});
