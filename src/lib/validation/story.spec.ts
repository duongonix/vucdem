import { describe, expect, it } from 'vitest';
import { createStorySchema, storySlug, validatePublishableStory } from './story';
describe('storySlug', () => {
	it('normalizes Vietnamese titles deterministically', () => {
		expect(storySlug('  Căn phòng ở tầng 13!  ')).toBe('can-phong-o-tang-13');
		expect(storySlug('Đêm Đen')).toBe('dem-den');
	});
	it('provides a stable fallback', () => {
		expect(storySlug('...')).toBe('truyen-khong-ten');
	});
});
describe('createStorySchema', () => {
	const metadata = { id: 'story-id', title: 'Một truyện', description: '', cover: null, tags: [] };
	it('accepts serial Stories without initial prose', () => {
		expect(createStorySchema.safeParse({ ...metadata, format: 'serial' }).success).toBe(true);
	});
	it('requires prose for short Stories', () => {
		expect(
			createStorySchema.safeParse({ ...metadata, format: 'short', shortContent: '' }).success
		).toBe(false);
		expect(
			createStorySchema.safeParse({ ...metadata, format: 'short', shortContent: 'Nội dung.' })
				.success
		).toBe(true);
	});
	it('accepts audio Stories only with Cloudinary metadata', () => {
		expect(
			createStorySchema.safeParse({ ...metadata, format: 'short', contentFormat: 'audio' }).success
		).toBe(false);
		expect(
			createStorySchema.safeParse({
				...metadata,
				format: 'short',
				contentFormat: 'audio',
				shortAudio: {
					url: 'https://res.cloudinary.com/cloud/video/upload/audio.mp3',
					publicId: 'vucdem/stories/story-id/chapters/short-story/audio',
					duration: 42,
					format: 'mp3',
					bytes: 1024
				}
			}).success
		).toBe(true);
	});
});
describe('validatePublishableStory', () => {
	it('requires complete public metadata and a chapter', () => {
		expect(
			validatePublishableStory({ title: 'Đêm', description: '', cover: null }, 0)
		).toHaveLength(4);
		expect(
			validatePublishableStory(
				{
					title: 'Đêm trong căn nhà hoang',
					description: 'Một lời kể dài hơn hai mươi ký tự trong bóng tối.',
					cover: { url: 'https://example.com/cover.webp', publicId: 'vucdem/stories/id/cover' }
				},
				1
			)
		).toEqual([]);
	});
});
