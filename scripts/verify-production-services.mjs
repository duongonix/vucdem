import fs from 'node:fs';
import { cert, deleteApp, initializeApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { v2 as cloudinary } from 'cloudinary';

function readLocalEnvironment() {
	const source = fs.readFileSync('.env', 'utf8');
	return Object.fromEntries(
		source
			.split(/\r?\n/)
			.filter((line) => /^[A-Za-z_][A-Za-z0-9_]*=/.test(line))
			.map((line) => {
				const separator = line.indexOf('=');
				const value = line.slice(separator + 1).replace(/^"|"$/g, '');
				return [line.slice(0, separator), value];
			})
	);
}

const env = readLocalEnvironment();
const firebaseApp = initializeApp({
	credential: cert({
		projectId: env.FIREBASE_ADMIN_PROJECT_ID,
		clientEmail: env.FIREBASE_ADMIN_CLIENT_EMAIL,
		privateKey: env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, '\n')
	})
});

try {
	const collections = await getFirestore(firebaseApp).listCollections();
	console.log(`FIRESTORE_CONNECTIVITY=OK COLLECTIONS=${collections.length}`);

	const token = await firebaseApp.options.credential.getAccessToken();
	const authResponse = await fetch(
		`https://identitytoolkit.googleapis.com/admin/v2/projects/${env.FIREBASE_ADMIN_PROJECT_ID}/config`,
		{ headers: { authorization: `Bearer ${token.access_token}` } }
	);
	if (!authResponse.ok) {
		throw new Error(`FIREBASE_AUTH_CONFIG=${authResponse.status}`);
	}
	const authConfig = await authResponse.json();
	const googleResponse = await fetch(
		`https://identitytoolkit.googleapis.com/admin/v2/projects/${env.FIREBASE_ADMIN_PROJECT_ID}/defaultSupportedIdpConfigs/google.com`,
		{ headers: { authorization: `Bearer ${token.access_token}` } }
	);
	const googleConfig = googleResponse.ok ? await googleResponse.json() : {};
	console.log(
		`FIREBASE_AUTH_CONFIG=OK EMAIL=${Boolean(authConfig.signIn?.email?.enabled)} GOOGLE=${Boolean(googleConfig.enabled)} AUTHORIZED_DOMAINS=${authConfig.authorizedDomains?.length ?? 0}`
	);

	cloudinary.config({
		cloud_name: env.PUBLIC_CLOUDINARY_CLOUD_NAME,
		api_key: env.CLOUDINARY_API_KEY,
		api_secret: env.CLOUDINARY_API_SECRET
	});
	const response = await cloudinary.api.ping();
	console.log(`CLOUDINARY_CONNECTIVITY=${String(response.status).toUpperCase()}`);
} finally {
	await deleteApp(firebaseApp);
}
