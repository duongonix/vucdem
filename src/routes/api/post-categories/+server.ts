import { ensureDefaultPostCategories, serializePostCategory } from '$lib/server/post-categories';
import { getFirebaseAdminDb } from '$lib/server/firebase-admin';
import { json, type RequestHandler } from '@sveltejs/kit';

export const GET: RequestHandler = async () => {
	await ensureDefaultPostCategories();
	const query: FirebaseFirestore.Query = getFirebaseAdminDb()
		.collection('postCategories')
		.where('status', '==', 'active');
	const snapshot = await query.get();
	const categories = snapshot.docs
		.map(serializePostCategory)
		.sort((left, right) => left.order - right.order || left.name.localeCompare(right.name, 'vi'));
	return json({ categories });
};
