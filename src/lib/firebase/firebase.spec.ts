import { Timestamp } from 'firebase/firestore';
import { describe, expect, it } from 'vitest';
import { readFirebasePublicConfig } from './config';
import { assertFirestoreDocumentId, isValidFirestoreDocumentId } from './document-id';
import { parseEmulatorAddress, useFirebaseEmulators } from './emulators';
import { timestampToDate, timestampToMillis } from './timestamps';

describe('Firebase public configuration', () => {
	it('reports every missing or blank required value', () => {
		const result = readFirebasePublicConfig({ PUBLIC_FIREBASE_API_KEY: '   ' });

		expect(result).toEqual({
			configured: false,
			missing: [
				'PUBLIC_FIREBASE_API_KEY',
				'PUBLIC_FIREBASE_AUTH_DOMAIN',
				'PUBLIC_FIREBASE_PROJECT_ID',
				'PUBLIC_FIREBASE_APP_ID'
			]
		});
	});

	it('returns a trimmed Firebase config when complete', () => {
		const result = readFirebasePublicConfig({
			PUBLIC_FIREBASE_API_KEY: ' key ',
			PUBLIC_FIREBASE_AUTH_DOMAIN: ' local.firebaseapp.com ',
			PUBLIC_FIREBASE_PROJECT_ID: ' vucdem-test ',
			PUBLIC_FIREBASE_APP_ID: ' app-id '
		});

		expect(result).toEqual({
			configured: true,
			config: {
				apiKey: 'key',
				authDomain: 'local.firebaseapp.com',
				projectId: 'vucdem-test',
				appId: 'app-id'
			}
		});
	});
});

describe('Firebase emulator configuration', () => {
	it('is opt-in and parses explicit or default addresses', () => {
		expect(useFirebaseEmulators({ PUBLIC_FIREBASE_USE_EMULATORS: 'TRUE' })).toBe(true);
		expect(useFirebaseEmulators({ PUBLIC_FIREBASE_USE_EMULATORS: 'false' })).toBe(false);
		expect(parseEmulatorAddress('localhost:9199', 9099)).toEqual({
			host: 'localhost',
			port: 9199
		});
		expect(parseEmulatorAddress(undefined, 8080)).toEqual({ host: '127.0.0.1', port: 8080 });
	});

	it('rejects malformed ports', () => {
		expect(() => parseEmulatorAddress('localhost:invalid', 9099)).toThrow(
			'Invalid Firebase emulator address'
		);
	});
});

describe('Firestore utilities', () => {
	it('validates document IDs at provider boundaries', () => {
		expect(assertFirestoreDocumentId(' user-id ', 'user ID')).toBe('user-id');
		expect(isValidFirestoreDocumentId('contains/slash')).toBe(false);
		expect(isValidFirestoreDocumentId('a'.repeat(1_501))).toBe(false);
		expect(() => assertFirestoreDocumentId('..')).toThrow('Invalid document ID');
	});

	it('normalizes Timestamp and Date values', () => {
		const timestamp = Timestamp.fromMillis(1_700_000_000_000);
		const date = new Date(1_700_000_000_000);

		expect(timestampToMillis(timestamp)).toBe(date.getTime());
		expect(timestampToDate(timestamp)).toEqual(date);
		expect(timestampToDate(date)).toBe(date);
	});
});
