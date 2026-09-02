import { z } from 'zod';
import { cloudinaryAssetSchema } from './media';
import { storySlug } from './story';
export const communityInputSchema = z.object({
	name: z.string().trim().min(3, 'Tên cộng đồng cần ít nhất 3 ký tự.').max(60),
	description: z.string().trim().min(10).max(1000),
	icon: cloudinaryAssetSchema.nullable(),
	banner: cloudinaryAssetSchema.nullable()
});
export const createCommunitySchema = communityInputSchema.extend({
	id: z.string().min(1).max(128)
});
export const communitySlug = storySlug;
export type CommunityInput = z.infer<typeof communityInputSchema>;
export type CreateCommunityInput = z.infer<typeof createCommunitySchema>;
