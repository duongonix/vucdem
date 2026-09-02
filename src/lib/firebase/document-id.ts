const FIRESTORE_DOCUMENT_ID_MAX_BYTES = 1_500;

export function isValidFirestoreDocumentId(value: string): boolean {
	const normalized = value.trim();
	if (!normalized || normalized.includes('/') || normalized === '.' || normalized === '..') {
		return false;
	}

	return new TextEncoder().encode(normalized).byteLength <= FIRESTORE_DOCUMENT_ID_MAX_BYTES;
}

export function assertFirestoreDocumentId(value: string, label = 'document ID'): string {
	const normalized = value.trim();
	if (!isValidFirestoreDocumentId(normalized)) {
		throw new Error(`Invalid ${label}.`);
	}

	return normalized;
}
