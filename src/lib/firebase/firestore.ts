import { dev } from '$app/environment';
import { env } from '$env/dynamic/public';
import { connectFirestoreEmulator, getFirestore, type Firestore } from 'firebase/firestore';
import { getFirebaseApp } from './client';
import { parseEmulatorAddress, useFirebaseEmulators } from './emulators';

let firestore: Firestore | undefined;
let emulatorConnected = false;

export function getFirestoreDb(): Firestore {
	if (firestore) return firestore;

	firestore = getFirestore(getFirebaseApp());

	if (dev && useFirebaseEmulators(env) && !emulatorConnected) {
		const { host, port } = parseEmulatorAddress(env.PUBLIC_FIRESTORE_EMULATOR_HOST, 8080);
		connectFirestoreEmulator(firestore, host, port);
		emulatorConnected = true;
	}

	return firestore;
}
