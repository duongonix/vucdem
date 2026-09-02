import { getFirebaseAdminDb } from './firebase-admin';
import { error } from '@sveltejs/kit';
import { MAX_AUDIO_UPLOAD_BYTES, type UploadKind } from '$lib/validation/media';
import type { AudioAsset, CloudinaryAsset } from '$lib/types';
import { env as publicEnv } from '$env/dynamic/public';

interface AssetTarget {
	publicId: string;
	collection?: 'posts' | 'stories' | 'communities';
	resourceId?: string;
	ownerField?: 'authorId' | 'ownerId';
}

function requireResourceId(value: string | undefined): string {
	if (!value || value.includes('/') || value === '.' || value === '..') {
		error(400, 'A valid resourceId is required for this upload type.');
	}
	return value;
}

export function resolveAssetTarget(
	kind: UploadKind,
	uid: string,
	resourceId?: string,
	slot?: number,
	chapterId?: string
): AssetTarget {
	if (kind === 'avatar') return { publicId: `vucdem/avatars/${uid}/avatar` };
	const id = requireResourceId(resourceId);
	if (kind === 'post-thumbnail') {
		return {
			publicId: `vucdem/posts/${id}/thumbnail`,
			collection: 'posts',
			resourceId: id,
			ownerField: 'authorId'
		};
	}
	if (kind === 'post-image') {
		if (!slot) error(400, 'A numbered image slot is required.');
		return {
			publicId: `vucdem/posts/${id}/image-${slot}`,
			collection: 'posts',
			resourceId: id,
			ownerField: 'authorId'
		};
	}
	if (kind === 'story-cover') {
		return {
			publicId: `vucdem/stories/${id}/cover`,
			collection: 'stories',
			resourceId: id,
			ownerField: 'authorId'
		};
	}
	if (kind === 'story-audio') {
		const chapter = requireResourceId(chapterId);
		return {
			publicId: `vucdem/stories/${id}/chapters/${chapter}/audio`,
			collection: 'stories',
			resourceId: id,
			ownerField: 'authorId'
		};
	}
	if (kind === 'interactive-image' || kind === 'interactive-audio') {
		const chapter = requireResourceId(chapterId);
		if (!slot) error(400, 'A numbered interactive event slot is required.');
		return {
			publicId: `vucdem/stories/${id}/chapters/${chapter}/interactive/event-${slot}/${kind === 'interactive-image' ? 'image' : 'audio'}`,
			collection: 'stories',
			resourceId: id,
			ownerField: 'authorId'
		};
	}
	if (kind === 'interactive-avatar') {
		if (!slot) error(400, 'A numbered character slot is required.');
		return {
			publicId: `vucdem/stories/${id}/characters/character-${slot}/avatar`,
			collection: 'stories',
			resourceId: id,
			ownerField: 'authorId'
		};
	}
	return {
		publicId: `vucdem/communities/${id}/${kind === 'community-icon' ? 'icon' : 'banner'}`,
		collection: 'communities',
		resourceId: id,
		ownerField: 'ownerId'
	};
}

export async function assertResourceOwnership(target: AssetTarget, uid: string): Promise<boolean> {
	if (!target.collection || !target.resourceId || !target.ownerField) return true;
	const snapshot = await getFirebaseAdminDb()
		.collection(target.collection)
		.doc(target.resourceId)
		.get();
	// New Post/Story IDs are allocated before their document exists. Ownership is then bound
	// into the signed Cloudinary context and verified again on deletion.
	if (!snapshot.exists && target.collection !== 'communities') return false;
	if (!snapshot.exists || snapshot.get(target.ownerField) !== uid)
		error(403, 'Asset ownership denied.');
	return true;
}

export function parseAssetTarget(publicId: string): AssetTarget {
	const parts = publicId.split('/');
	if (parts[0] !== 'vucdem' || parts.length < 4) error(400, 'Invalid managed asset path.');
	if (parts[1] === 'avatars') return { publicId, resourceId: parts[2] };
	if (parts[1] === 'posts')
		return { publicId, collection: 'posts', resourceId: parts[2], ownerField: 'authorId' };
	if (parts[1] === 'stories')
		return { publicId, collection: 'stories', resourceId: parts[2], ownerField: 'authorId' };
	if (parts[1] === 'communities')
		return { publicId, collection: 'communities', resourceId: parts[2], ownerField: 'ownerId' };
	error(400, 'Asset is outside an allowed VỰC ĐÊM namespace.');
}

export function assertCloudinaryAssetMetadata(
	asset: CloudinaryAsset,
	expectedPublicId: string
): void {
	if (asset.publicId !== expectedPublicId) error(400, 'Cloudinary publicId không đúng tài nguyên.');
	let url: URL;
	try {
		url = new URL(asset.url);
	} catch {
		error(400, 'Cloudinary URL không hợp lệ.');
	}
	const cloudName = publicEnv.PUBLIC_CLOUDINARY_CLOUD_NAME;
	if (
		url.protocol !== 'https:' ||
		url.hostname !== 'res.cloudinary.com' ||
		!cloudName ||
		!url.pathname.startsWith(`/${cloudName}/image/upload/`)
	) {
		error(400, 'Ảnh không thuộc Cloudinary cloud của VỰC ĐÊM.');
	}
}

export function assertCloudinaryAudioMetadata(asset: AudioAsset, expectedPublicId: string): void {
	if (asset.publicId !== expectedPublicId) error(400, 'Audio publicId không đúng tài nguyên.');
	let url: URL;
	try {
		url = new URL(asset.url);
	} catch {
		error(400, 'Cloudinary audio URL không hợp lệ.');
	}
	const cloudName = publicEnv.PUBLIC_CLOUDINARY_CLOUD_NAME;
	if (
		url.protocol !== 'https:' ||
		url.hostname !== 'res.cloudinary.com' ||
		!cloudName ||
		!url.pathname.startsWith(`/${cloudName}/video/upload/`)
	)
		error(400, 'Audio không thuộc Cloudinary cloud của VỰC ĐÊM.');
	if (asset.bytes !== null && asset.bytes > MAX_AUDIO_UPLOAD_BYTES)
		error(400, 'Audio vượt quá giới hạn 100 MB.');
	if (
		asset.format !== null &&
		!['mp3', 'm4a', 'mp4', 'aac', 'ogg', 'wav'].includes(asset.format.toLocaleLowerCase('en-US'))
	)
		error(400, 'Định dạng audio không được hỗ trợ.');
}

export function assertPostMediaMetadata(
	postId: string,
	thumbnail: CloudinaryAsset | null,
	images: CloudinaryAsset[]
): void {
	if (thumbnail) assertCloudinaryAssetMetadata(thumbnail, `vucdem/posts/${postId}/thumbnail`);
	const publicIds = new Set<string>();
	for (const image of images) {
		if (
			!new RegExp(
				`^vucdem/posts/${postId.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}/image-(?:[1-9]|10)$`
			).test(image.publicId)
		) {
			error(400, 'Ảnh bài viết không thuộc đúng Post hoặc slot cho phép.');
		}
		assertCloudinaryAssetMetadata(image, image.publicId);
		if (publicIds.has(image.publicId)) error(400, 'Ảnh bài viết bị trùng lặp.');
		publicIds.add(image.publicId);
	}
}
