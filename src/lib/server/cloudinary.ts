import { env } from '$env/dynamic/private';
import { env as publicEnv } from '$env/dynamic/public';
import { error } from '@sveltejs/kit';
import { v2 as cloudinary, type ConfigOptions } from 'cloudinary';

let configured = false;

export function getCloudinaryServer() {
	if (!configured) {
		const config: ConfigOptions = {
			cloud_name: publicEnv.PUBLIC_CLOUDINARY_CLOUD_NAME,
			api_key: env.CLOUDINARY_API_KEY,
			api_secret: env.CLOUDINARY_API_SECRET,
			secure: true
		};
		if (!config.cloud_name || !config.api_key || !config.api_secret) {
			error(503, 'Cloudinary server configuration is incomplete.');
		}
		cloudinary.config(config);
		configured = true;
	}
	return cloudinary;
}

export function getCloudinaryApiSecret(): string {
	const secret = env.CLOUDINARY_API_SECRET;
	if (!secret) error(503, 'Cloudinary server configuration is incomplete.');
	return secret;
}
