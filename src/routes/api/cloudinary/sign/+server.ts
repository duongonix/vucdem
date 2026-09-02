import { requireFirebaseUser } from '$lib/server/auth';
import { getCloudinaryApiSecret, getCloudinaryServer } from '$lib/server/cloudinary';
import { assertResourceOwnership, resolveAssetTarget } from '$lib/server/media-authorization';
import { uploadSignRequestSchema } from '$lib/validation/media';
import { env } from '$env/dynamic/private';
import { env as publicEnv } from '$env/dynamic/public';
import { error, json, type RequestHandler } from '@sveltejs/kit';

export const POST: RequestHandler = async (event) => {
	const identity = await requireFirebaseUser(event);
	const parsed = uploadSignRequestSchema.safeParse(await event.request.json().catch(() => null));
	if (!parsed.success) error(400, parsed.error.issues[0]?.message ?? 'Invalid upload request.');

	const target = resolveAssetTarget(
		parsed.data.kind,
		identity.uid,
		parsed.data.resourceId,
		parsed.data.slot,
		parsed.data.chapterId
	);
	const resourceExists = await assertResourceOwnership(target, identity.uid);

	const timestamp = Math.floor(Date.now() / 1000);
	const parameters = {
		timestamp,
		public_id: target.publicId,
		context: `ownerId=${identity.uid}|kind=${parsed.data.kind}`,
		allowed_formats: ['story-audio', 'interactive-audio'].includes(parsed.data.kind)
			? 'mp3,m4a,aac,ogg,wav'
			: 'jpg,png,webp',
		overwrite: resourceExists,
		invalidate: true
	};
	const cloudinary = getCloudinaryServer();
	const signature = cloudinary.utils.api_sign_request(parameters, getCloudinaryApiSecret());

	return json({
		cloudName: publicEnv.PUBLIC_CLOUDINARY_CLOUD_NAME,
		apiKey: env.CLOUDINARY_API_KEY,
		resourceType: ['story-audio', 'interactive-audio'].includes(parsed.data.kind)
			? 'video'
			: 'image',
		signature,
		...parameters
	});
};
