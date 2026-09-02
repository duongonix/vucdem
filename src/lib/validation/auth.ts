import { z } from 'zod';
import { cloudinaryAssetSchema } from './media';

export const USERNAME_MIN_LENGTH = 3;
export const USERNAME_MAX_LENGTH = 24;
export const DISPLAY_NAME_MIN_LENGTH = 2;
export const DISPLAY_NAME_MAX_LENGTH = 50;
export const PASSWORD_MIN_LENGTH = 8;
export const PASSWORD_MAX_LENGTH = 128;
export const BIO_MAX_LENGTH = 300;

export function normalizeUsername(value: string): string {
	return value.trim().toLocaleLowerCase('en-US');
}

export const usernameSchema = z
	.string()
	.trim()
	.min(USERNAME_MIN_LENGTH, `Tên người dùng cần ít nhất ${USERNAME_MIN_LENGTH} ký tự.`)
	.max(USERNAME_MAX_LENGTH, `Tên người dùng tối đa ${USERNAME_MAX_LENGTH} ký tự.`)
	.regex(/^[a-zA-Z0-9_]+$/, 'Chỉ dùng chữ cái không dấu, số và dấu gạch dưới.')
	.transform(normalizeUsername);

export const displayNameSchema = z
	.string()
	.trim()
	.min(DISPLAY_NAME_MIN_LENGTH, `Tên hiển thị cần ít nhất ${DISPLAY_NAME_MIN_LENGTH} ký tự.`)
	.max(DISPLAY_NAME_MAX_LENGTH, `Tên hiển thị tối đa ${DISPLAY_NAME_MAX_LENGTH} ký tự.`);

export const emailSchema = z.string().trim().email('Địa chỉ email không hợp lệ.');

export const passwordSchema = z
	.string()
	.min(PASSWORD_MIN_LENGTH, `Mật khẩu cần ít nhất ${PASSWORD_MIN_LENGTH} ký tự.`)
	.max(PASSWORD_MAX_LENGTH, `Mật khẩu tối đa ${PASSWORD_MAX_LENGTH} ký tự.`);

export const profileSetupSchema = z
	.object({
		username: usernameSchema,
		displayName: displayNameSchema
	})
	.strict();

export const profileUpdateSchema = z
	.object({
		displayName: displayNameSchema,
		bio: z.string().trim().max(BIO_MAX_LENGTH, `Tiểu sử tối đa ${BIO_MAX_LENGTH} ký tự.`),
		avatar: cloudinaryAssetSchema.nullable()
	})
	.strict();

export type ProfileUpdateInput = z.input<typeof profileUpdateSchema>;

export type ProfileSetupInput = z.input<typeof profileSetupSchema>;
