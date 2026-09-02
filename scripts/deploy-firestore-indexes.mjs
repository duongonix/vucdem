import fs from 'node:fs';
import { cert, deleteApp, initializeApp } from 'firebase-admin/app';

const serviceAccount = JSON.parse(
	fs.readFileSync('vucdem-firebase-adminsdk-fbsvc-7d24fe7fbc.json', 'utf8')
);
const definition = JSON.parse(fs.readFileSync('firestore.indexes.json', 'utf8'));
const app = initializeApp({ credential: cert(serviceAccount) });

function signature(index) {
	return JSON.stringify({
		queryScope: index.queryScope,
		fields: index.fields.map(({ fieldPath, order, arrayConfig }) => ({
			fieldPath,
			...(order ? { order } : {}),
			...(arrayConfig ? { arrayConfig } : {})
		}))
	});
}

try {
	const token = await app.options.credential.getAccessToken();
	const headers = {
		authorization: `Bearer ${token.access_token}`,
		'content-type': 'application/json'
	};
	const base = `https://firestore.googleapis.com/v1/projects/${serviceAccount.project_id}/databases/(default)/collectionGroups`;

	for (const collectionGroup of [
		...new Set(definition.indexes.map((item) => item.collectionGroup))
	]) {
		const endpoint = `${base}/${encodeURIComponent(collectionGroup)}/indexes`;
		const listResponse = await fetch(endpoint, { headers });
		if (!listResponse.ok) throw new Error(`INDEX_LIST ${collectionGroup}=${listResponse.status}`);
		const deployed = (await listResponse.json()).indexes ?? [];
		const signatures = new Set(deployed.map(signature));

		for (const index of definition.indexes.filter(
			(item) => item.collectionGroup === collectionGroup
		)) {
			if (signatures.has(signature(index))) continue;
			const response = await fetch(endpoint, {
				method: 'POST',
				headers,
				body: JSON.stringify({ queryScope: index.queryScope, fields: index.fields })
			});
			if (!response.ok) throw new Error(`INDEX_CREATE ${collectionGroup}=${response.status}`);
			console.log(`INDEX_CREATE=${collectionGroup}`);
		}
	}
} finally {
	await deleteApp(app);
}
