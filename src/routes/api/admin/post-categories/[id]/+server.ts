import { requireApplicationRole } from '$lib/server/auth';
import { getFirebaseAdminDb } from '$lib/server/firebase-admin';
import { serializePostCategory } from '$lib/server/post-categories';
import { postCategoryIdSchema, postCategoryUpdateSchema } from '$lib/validation/post-category';
import { error, json, type RequestHandler } from '@sveltejs/kit';
import { FieldValue } from 'firebase-admin/firestore';

function id(value: string | undefined): string {
	const parsed = postCategoryIdSchema.safeParse(value);
	if (!parsed.success) error(400, 'Mã danh mục không hợp lệ.');
	return parsed.data;
}

export const PATCH: RequestHandler = async (event) => {
	await requireApplicationRole(event, ['admin']);
	const parsed = postCategoryUpdateSchema.safeParse(await event.request.json().catch(() => null));
	if (!parsed.success) error(400, parsed.error.issues[0]?.message ?? 'Danh mục không hợp lệ.');
	const reference = getFirebaseAdminDb().collection('postCategories').doc(id(event.params.id));
	if (!(await reference.get()).exists) error(404, 'Không tìm thấy danh mục.');
	await reference.update({ ...parsed.data, updatedAt: FieldValue.serverTimestamp() });
	return json({ category: serializePostCategory(await reference.get()) });
};

export const DELETE: RequestHandler = async (event) => {
	await requireApplicationRole(event, ['admin']);
	const categoryId = id(event.params.id);
	const db = getFirebaseAdminDb();
	const reference = db.collection('postCategories').doc(categoryId);
	if (!(await reference.get()).exists) error(404, 'Không tìm thấy danh mục.');
	const used = await db.collection('posts').where('category', '==', categoryId).limit(1).get();
	if (!used.empty) error(409, 'Danh mục đang được bài viết sử dụng. Hãy tắt danh mục thay vì xóa.');
	await reference.delete();
	return new Response(null, { status: 204 });
};
