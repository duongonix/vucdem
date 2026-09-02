import { requireApplicationRole } from '$lib/server/auth';
import { getFirebaseAdminDb } from '$lib/server/firebase-admin';
import { error, json, type RequestHandler } from '@sveltejs/kit';
const allowed = ['users', 'posts', 'stories', 'comments', 'communities'] as const;
export const GET: RequestHandler = async (event) => {
	await requireApplicationRole(event, ['admin']);
	const type = event.params.type;
	if (!allowed.includes(type as (typeof allowed)[number])) error(400);
	const snap = await getFirebaseAdminDb().collection(type!).limit(50).get();
	return json({
		items: snap.docs.map((d) => {
			const data = d.data();
			return {
				id: d.id,
				...data,
				createdAt: data.createdAt?.toMillis?.() ?? null,
				updatedAt: data.updatedAt?.toMillis?.() ?? null
			};
		})
	});
};
