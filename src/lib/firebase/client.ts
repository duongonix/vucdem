import { browser } from '$app/environment';
import { env } from '$env/dynamic/public';
import { getApp, getApps, initializeApp, type FirebaseApp } from 'firebase/app';
import { readFirebasePublicConfig } from './config';
import { FirebaseBrowserOnlyError, FirebaseConfigurationError } from './errors';

let firebaseApp: FirebaseApp | undefined;

export function isFirebaseConfigured(source: Record<string, string | undefined> = env): boolean {
	return readFirebasePublicConfig(source).configured;
}

export function getFirebaseApp(source: Record<string, string | undefined> = env): FirebaseApp {
	if (!browser) {
		throw new FirebaseBrowserOnlyError();
	}

	if (firebaseApp) return firebaseApp;

	const result = readFirebasePublicConfig(source);
	if (!result.configured) {
		throw new FirebaseConfigurationError(result.missing);
	}

	firebaseApp = getApps().length > 0 ? getApp() : initializeApp(result.config);
	return firebaseApp;
}
