export interface CloudinaryAsset {
	url: string;
	publicId: string;
}

export interface AudioAsset extends CloudinaryAsset {
	duration: number | null;
	format: string | null;
	bytes: number | null;
}
