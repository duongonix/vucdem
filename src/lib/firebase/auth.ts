import { dev } from '$app/environment';
import { env } from '$env/dynamic/public';
import { connectAuthEmulator, getAuth, type Auth } from 'firebase/auth';
import { getFirebaseApp } from './client';
import { parseEmulatorAddress, useFirebaseEmulators } from './emulators';

let auth: Auth | undefined;
let emulatorConnected = false;

export function getFirebaseAuth(): Auth {
	if (auth) return auth;

	auth = getAuth(getFirebaseApp());

	if (dev && useFirebaseEmulators(env) && !emulatorConnected) {
		const { host, port } = parseEmulatorAddress(env.PUBLIC_FIREBASE_AUTH_EMULATOR_HOST, 9099);
		connectAuthEmulator(auth, `http://${host}:${port}`, { disableWarnings: true });
		emulatorConnected = true;
	}

	return auth;
}
