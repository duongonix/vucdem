import type { FirebasePublicEnvKey } from './config';

export class FirebaseConfigurationError extends Error {
	readonly missing: readonly FirebasePublicEnvKey[];

	constructor(missing: readonly FirebasePublicEnvKey[]) {
		super(`Firebase configuration is incomplete: ${missing.join(', ')}`);
		this.name = 'FirebaseConfigurationError';
		this.missing = missing;
	}
}

export class FirebaseBrowserOnlyError extends Error {
	constructor() {
		super('Firebase client SDK access is only available in the browser.');
		this.name = 'FirebaseBrowserOnlyError';
	}
}
