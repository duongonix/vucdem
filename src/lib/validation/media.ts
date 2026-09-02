import { z } from 'zod';

export const cloudinaryAssetSchema = z.object({
	url: z.string().url().startsWith('https://'),
	publicId: z.string().startsWith('vucdem/').max(512)
});

export const audioAssetSchema = cloudinaryAssetSchema.extend({
	duration: z.number().nonnegative().finite().nullable(),
	format: z.string().trim().max(16).nullable(),
	bytes: z.number().int().nonnegative().nullable()
});

export const IMAGE_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp'] as const;
export const MAX_IMAGE_BYTES = 10 * 1024 * 1024;
export const MAX_AVATAR_BYTES = 5 * 1024 * 1024;
export const MAX_AUDIO_UPLOAD_BYTES = 100 * 1024 * 1024;
export const AUDIO_MIME_TYPES = [
	'audio/mpeg',
	'audio/mp4',
	'audio/x-m4a',
	'audio/aac',
	'audio/ogg',
	'audio/wav',
	'audio/x-wav'
] as const;

export const uploadKindSchema = z.enum([
	'avatar',
	'post-thumbnail',
	'post-image',
	'story-cover',
	'community-icon',
	'community-banner',
	'story-audio',
	'interactive-image',
	'interactive-audio',
	'interactive-avatar'
]);
export type UploadKind = z.infer<typeof uploadKindSchema>;

export const uploadSignRequestSchema = z
	.object({
		kind: uploadKindSchema,
		resourceId: z.string().trim().min(1).max(256).optional(),
		slot: z.number().int().min(1).max(500).optional(),
		chapterId: z.string().trim().min(1).max(128).optional()
	})
	.strict();

export const deleteAssetRequestSchema = z
	.object({
		publicId: z.string().trim().startsWith('vucdem/').max(512)
	})
	.strict();

export function validateImageFile(file: File, kind: UploadKind): string | null {
	if (!IMAGE_MIME_TYPES.includes(file.type as (typeof IMAGE_MIME_TYPES)[number])) {
		return 'Chỉ chấp nhận ảnh JPEG, PNG hoặc WebP.';
	}
	const limit = kind === 'avatar' ? MAX_AVATAR_BYTES : MAX_IMAGE_BYTES;
	if (file.size > limit) return `Ảnh vượt quá giới hạn ${limit / 1024 / 1024} MB.`;
	if (file.size === 0) return 'Tệp ảnh trống.';
	return null;
}

export function validateAudioFile(file: File): string | null {
	if (!AUDIO_MIME_TYPES.includes(file.type as (typeof AUDIO_MIME_TYPES)[number]))
		return 'Chỉ chấp nhận MP3, M4A, AAC, OGG hoặc WAV.';
	if (!file.size) return 'Tệp audio trống.';
	if (file.size > MAX_AUDIO_UPLOAD_BYTES) return 'Audio vượt quá giới hạn 100 MB.';
	return null;
}
