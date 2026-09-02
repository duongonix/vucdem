import { getFirebaseAuth } from '$lib/firebase/auth';
import type { AudioAsset, CloudinaryAsset } from '$lib/types';
import {
	uploadSignRequestSchema,
	validateAudioFile,
	validateImageFile,
	type UploadKind
} from '$lib/validation/media';

interface SignedUpload {
	cloudName: string;
	apiKey: string;
	signature: string;
	timestamp: number;
	public_id: string;
	context: string;
	allowed_formats: string;
	overwrite: boolean;
	invalidate: boolean;
	resourceType: 'image' | 'video';
}

interface CloudinaryUploadResponse {
	secure_url?: string;
	public_id?: string;
	duration?: number;
	format?: string;
	bytes?: number;
	error?: { message?: string };
}

export interface UploadImageOptions {
	kind: UploadKind;
	resourceId?: string;
	slot?: number;
	chapterId?: string;
	onProgress?: (percentage: number) => void;
	signal?: AbortSignal;
}

export interface UploadAudioOptions {
	storyId: string;
	chapterId: string;
	kind?: 'story-audio' | 'interactive-audio';
	slot?: number;
	onProgress?: (percentage: number) => void;
	signal?: AbortSignal;
}

async function authenticatedRequest(path: string, init: RequestInit): Promise<Response> {
	const user = getFirebaseAuth().currentUser;
	if (!user) throw new Error('Bạn cần đăng nhập để quản lý ảnh.');
	const token = await user.getIdToken();
	return fetch(path, { ...init, headers: { authorization: `Bearer ${token}`, ...init.headers } });
}

export async function uploadAudio(file: File, options: UploadAudioOptions): Promise<AudioAsset> {
	const validationMessage = validateAudioFile(file);
	if (validationMessage) throw new Error(validationMessage);
	const requestBody = uploadSignRequestSchema.parse({
		kind: options.kind ?? 'story-audio',
		resourceId: options.storyId,
		chapterId: options.chapterId,
		slot: options.slot
	});
	const signResponse = await authenticatedRequest('/api/cloudinary/sign', {
		method: 'POST',
		headers: { 'content-type': 'application/json' },
		body: JSON.stringify(requestBody),
		signal: options.signal
	});
	const signed = (await signResponse.json()) as SignedUpload & { message?: string };
	if (!signResponse.ok) throw new Error(signed.message ?? 'Không thể chuẩn bị tải audio.');
	const form = new FormData();
	form.set('file', file);
	for (const key of [
		'signature',
		'timestamp',
		'public_id',
		'context',
		'allowed_formats',
		'overwrite',
		'invalidate'
	] as const)
		form.set(key, String(signed[key]));
	form.set('api_key', signed.apiKey);
	return new Promise((resolve, reject) => {
		const xhr = new XMLHttpRequest();
		xhr.open(
			'POST',
			`https://api.cloudinary.com/v1_1/${encodeURIComponent(signed.cloudName)}/video/upload`
		);
		xhr.upload.onprogress = (event) =>
			event.lengthComputable &&
			options.onProgress?.(Math.round((event.loaded / event.total) * 100));
		xhr.onerror = () => reject(new Error('Mất kết nối trong khi tải audio.'));
		xhr.onabort = () => reject(new DOMException('Upload aborted.', 'AbortError'));
		xhr.onload = () => {
			const body = JSON.parse(xhr.responseText || '{}') as CloudinaryUploadResponse;
			if (xhr.status < 200 || xhr.status >= 300 || !body.secure_url || !body.public_id) {
				reject(new Error(body.error?.message ?? 'Cloudinary không thể xử lý audio.'));
				return;
			}
			resolve({
				url: body.secure_url,
				publicId: body.public_id,
				duration: body.duration ?? null,
				format: body.format ?? null,
				bytes: body.bytes ?? null
			});
		};
		options.signal?.addEventListener('abort', () => xhr.abort(), { once: true });
		xhr.send(form);
	});
}

export async function uploadImage(
	file: File,
	options: UploadImageOptions
): Promise<CloudinaryAsset> {
	const validationMessage = validateImageFile(file, options.kind);
	if (validationMessage) throw new Error(validationMessage);
	// Progress callbacks and abort signals are browser-only controls. Keep them outside the
	// strict signing contract so functions and other runtime state never enter the API payload.
	const request = uploadSignRequestSchema.parse({
		kind: options.kind,
		resourceId: options.resourceId,
		slot: options.slot,
		chapterId: options.chapterId
	});
	const signResponse = await authenticatedRequest('/api/cloudinary/sign', {
		method: 'POST',
		headers: { 'content-type': 'application/json' },
		body: JSON.stringify(request),
		signal: options.signal
	});
	const signed = (await signResponse.json()) as SignedUpload & { message?: string };
	if (!signResponse.ok) throw new Error(signed.message ?? 'Không thể chuẩn bị tải ảnh.');

	const form = new FormData();
	form.set('file', file);
	for (const key of [
		'apiKey',
		'signature',
		'timestamp',
		'public_id',
		'context',
		'allowed_formats',
		'overwrite',
		'invalidate'
	] as const) {
		const formKey = key === 'apiKey' ? 'api_key' : key;
		form.set(formKey, String(signed[key]));
	}

	return new Promise((resolve, reject) => {
		const request = new XMLHttpRequest();
		request.open(
			'POST',
			`https://api.cloudinary.com/v1_1/${encodeURIComponent(signed.cloudName)}/image/upload`
		);
		request.upload.onprogress = (event) => {
			if (event.lengthComputable)
				options.onProgress?.(Math.round((event.loaded / event.total) * 100));
		};
		request.onerror = () => reject(new Error('Mất kết nối trong khi tải ảnh.'));
		request.onabort = () => reject(new DOMException('Upload aborted.', 'AbortError'));
		request.onload = () => {
			const body = JSON.parse(request.responseText || '{}') as CloudinaryUploadResponse;
			if (request.status < 200 || request.status >= 300 || !body.secure_url || !body.public_id) {
				reject(new Error(body.error?.message ?? 'Cloudinary không thể xử lý ảnh.'));
				return;
			}
			resolve({ url: body.secure_url, publicId: body.public_id });
		};
		options.signal?.addEventListener('abort', () => request.abort(), { once: true });
		request.send(form);
	});
}

export async function deleteImage(publicId: string): Promise<void> {
	const response = await authenticatedRequest('/api/cloudinary/delete', {
		method: 'POST',
		headers: { 'content-type': 'application/json' },
		body: JSON.stringify({ publicId })
	});
	const body = (await response.json().catch(() => ({}))) as { deleted?: boolean; message?: string };
	if (!response.ok || !body.deleted) throw new Error(body.message ?? 'Không thể xóa ảnh.');
}
