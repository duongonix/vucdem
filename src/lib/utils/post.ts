import type { PostCategory } from '$lib/types';

export const postCategoryLabels: Record<PostCategory, string> = {
	'thong-bao': 'Thông báo',
	'dong-gop': 'Đóng góp',
	'thac-mac': 'Thắc mắc',
	'chia-se': 'Chia sẻ',
	'ke-chuyen': 'Kể chuyện',
	true_story: 'Chuyện thật',
	creepypasta: 'Creepypasta',
	discussion: 'Thảo luận',
	paranormal: 'Tâm linh',
	mystery: 'Bí ẩn',
	psychological_horror: 'Kinh dị tâm lý',
	urban_legend: 'Truyền thuyết đô thị'
};

export function postCategoryLabel(category: PostCategory): string {
	return (
		postCategoryLabels[category] ??
		category.replace(/[-_]+/g, ' ').replace(/^./, (letter) => letter.toLocaleUpperCase('vi-VN'))
	);
}

export function compactNumber(value: number): string {
	return new Intl.NumberFormat('vi-VN', { notation: 'compact', maximumFractionDigits: 1 }).format(
		value
	);
}

export function relativeTime(date: Date): string {
	const seconds = Math.round((date.getTime() - Date.now()) / 1000);
	const formatter = new Intl.RelativeTimeFormat('vi', { numeric: 'auto' });
	for (const [unit, size] of [
		['year', 31_536_000],
		['month', 2_592_000],
		['day', 86_400],
		['hour', 3_600],
		['minute', 60]
	] as const)
		if (Math.abs(seconds) >= size) return formatter.format(Math.round(seconds / size), unit);
	return 'vừa xong';
}

export function cloudinaryThumbnail(url: string, width = 520): string {
	if (!url.includes('/upload/')) return url;
	return url.replace('/upload/', `/upload/f_auto,q_auto:eco,c_fill,w_${width}/`);
}
