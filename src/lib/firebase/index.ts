export { getFirebaseAuth } from './auth';
export { getFirebaseApp, isFirebaseConfigured } from './client';
export { FIRESTORE_COLLECTIONS, type FirestoreCollectionName } from './collections';
export {
	FIREBASE_PUBLIC_ENV_KEYS,
	readFirebasePublicConfig,
	type FirebaseConfigResult,
	type FirebasePublicConfig,
	type FirebasePublicEnvKey
} from './config';
export { assertFirestoreDocumentId, isValidFirestoreDocumentId } from './document-id';
export { parseEmulatorAddress, useFirebaseEmulators, type EmulatorAddress } from './emulators';
export { FirebaseBrowserOnlyError, FirebaseConfigurationError } from './errors';
export { getFirestoreDb } from './firestore';
export {
	createServerTimestamp,
	timestampToDate,
	timestampToMillis,
	type FirestoreServerTimestamp,
	type FirestoreTimestamp
} from './timestamps';
