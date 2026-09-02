import { requireApplicationRole } from '$lib/server/auth';
import { getFirebaseAdminDb } from '$lib/server/firebase-admin';
import { ensureDefaultPostCategories, serializePostCategory } from '$lib/server/post-categories';
import { postCategoryInputSchema } from '$lib/validation/post-category';
import { error, json, type RequestHandler } from '@sveltejs/kit';
import { FieldValue } from 'firebase-admin/firestore';

export const GET: RequestHandler = async (event) => {
	await requireApplicationRole(event, ['admin']);
	await ensureDefaultPostCategories();
	const snapshot = await getFirebaseAdminDb().collection('postCategories').get();
	return json({
		categories: snapshot.docs.map(serializePostCategory).sort((a, b) => a.order - b.order)
	});
};

export const POST: RequestHandler = async (event) => {
	await requireApplicationRole(event, ['admin']);
	const parsed = postCategoryInputSchema.safeParse(await event.request.json().catch(() => null));
	if (!parsed.success) error(400, parsed.error.issues[0]?.message ?? 'Danh mục không hợp lệ.');
	const { id, ...input } = parsed.data;
	const reference = getFirebaseAdminDb().collection('postCategories').doc(id);
	if ((await reference.get()).exists) error(409, 'Mã danh mục đã tồn tại.');
	await reference.create({
		...input,
		createdAt: FieldValue.serverTimestamp(),
		updatedAt: FieldValue.serverTimestamp()
	});
	return json({ category: serializePostCategory(await reference.get()) }, { status: 201 });
};
