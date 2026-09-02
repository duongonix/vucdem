import { requireFirebaseUser } from '$lib/server/auth';
import { getCloudinaryServer } from '$lib/server/cloudinary';
import { assertResourceOwnership, parseAssetTarget } from '$lib/server/media-authorization';
import { deleteAssetRequestSchema } from '$lib/validation/media';
import { error, json, type RequestHandler } from '@sveltejs/kit';

export const POST: RequestHandler = async (event) => {
	const identity = await requireFirebaseUser(event);
	const parsed = deleteAssetRequestSchema.safeParse(await event.request.json().catch(() => null));
	if (!parsed.success) error(400, parsed.error.issues[0]?.message ?? 'Invalid delete request.');

	const target = parseAssetTarget(parsed.data.publicId);
	if (parsed.data.publicId.startsWith('vucdem/avatars/')) {
		if (target.resourceId !== identity.uid) error(403, 'Asset ownership denied.');
	} else {
		await assertResourceOwnership(target, identity.uid);
		const isAudio = parsed.data.publicId.endsWith('/audio');
		const resource = await getCloudinaryServer().api.resource(parsed.data.publicId, {
			resource_type: isAudio ? 'video' : 'image',
			context: true
		});
		const ownerId = resource.context?.custom?.ownerId;
		if (ownerId !== identity.uid) error(403, 'Asset ownership denied.');
	}

	const result = await getCloudinaryServer().uploader.destroy(parsed.data.publicId, {
		resource_type: parsed.data.publicId.endsWith('/audio') ? 'video' : 'image',
		invalidate: true
	});
	return json({ deleted: result.result === 'ok' || result.result === 'not found' });
};
