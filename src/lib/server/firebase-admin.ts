import { env } from '$env/dynamic/private';
import { env as publicEnv } from '$env/dynamic/public';
import { applicationDefault, cert, getApps, initializeApp, type App } from 'firebase-admin/app';
import { getAuth, type Auth } from 'firebase-admin/auth';
import { getFirestore, type Firestore } from 'firebase-admin/firestore';

function privateKey(): string | undefined {
	return env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, '\n');
}

function createAdminApp(): App {
	const projectId = env.FIREBASE_ADMIN_PROJECT_ID || publicEnv.PUBLIC_FIREBASE_PROJECT_ID;
	const clientEmail = env.FIREBASE_ADMIN_CLIENT_EMAIL;
	const key = privateKey();

	return initializeApp({
		credential:
			projectId && clientEmail && key
				? cert({ projectId, clientEmail, privateKey: key })
				: applicationDefault(),
		projectId: projectId || undefined
	});
}

export function getFirebaseAdminApp(): App {
	return getApps()[0] ?? createAdminApp();
}

export function getFirebaseAdminAuth(): Auth {
	return getAuth(getFirebaseAdminApp());
}

export function getFirebaseAdminDb(): Firestore {
	return getFirestore(getFirebaseAdminApp());
}
