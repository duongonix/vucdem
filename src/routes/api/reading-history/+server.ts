import { json } from '@sveltejs/kit';
import { requireFirebaseUser } from '$lib/server/auth';
import { getFirebaseAdminDb } from '$lib/server/firebase-admin';
import type { RequestHandler } from './$types';

const HISTORY_LIMIT = 10;

export const GET: RequestHandler = async (event) => {
	const identity = await requireFirebaseUser(event);
	const snapshot = await getFirebaseAdminDb()
		.collection('users')
		.doc(identity.uid)
		.collection('readingProgress')
		.orderBy('updatedAt', 'desc')
		.limit(HISTORY_LIMIT)
		.get();

	return json({
		items: snapshot.docs.flatMap((document) => {
			const data = document.data();
			if (!data.updatedAt?.toMillis) return [];
			return [{ ...data, updatedAt: data.updatedAt.toMillis() }];
		})
	});
};
