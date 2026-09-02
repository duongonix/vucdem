import { requireFirebaseUser } from '$lib/server/auth';
import { getFirebaseAdminDb } from '$lib/server/firebase-admin';
import { error, json, type RequestHandler } from '@sveltejs/kit';
import { FieldValue } from 'firebase-admin/firestore';
function target(event: Parameters<RequestHandler>[0]) {
	const type = event.params.type;
	const id = event.params.id;
	if (!['post', 'story'].includes(type ?? '') || !id || id.includes('/'))
		error(400, 'Nội dung lưu không hợp lệ.');
	return { type: type as 'post' | 'story', id, bookmarkId: `${type}_${id}` };
}
export const GET: RequestHandler = async (event) => {
	const user = await requireFirebaseUser(event);
	const value = target(event);
	const snapshot = await getFirebaseAdminDb()
		.collection('users')
		.doc(user.uid)
		.collection('bookmarks')
		.doc(value.bookmarkId)
		.get();
	return json({ bookmarked: snapshot.exists });
};
export const POST: RequestHandler = async (event) => {
	const user = await requireFirebaseUser(event);
	const value = target(event);
	const db = getFirebaseAdminDb();
	const contentRef = db.collection(value.type === 'post' ? 'posts' : 'stories').doc(value.id);
	const bookmarkRef = db
		.collection('users')
		.doc(user.uid)
		.collection('bookmarks')
		.doc(value.bookmarkId);
	await db.runTransaction(async (transaction) => {
		const [content, existing] = await Promise.all([
			transaction.get(contentRef),
			transaction.get(bookmarkRef)
		]);
		const readable =
			value.type === 'post'
				? content.get('status') === 'published'
				: ['ongoing', 'completed', 'hiatus'].includes(content.get('status'));
		if (!content.exists || !readable) error(404, 'Không tìm thấy nội dung để lưu.');
		if (!existing.exists)
			transaction.create(bookmarkRef, {
				targetType: value.type,
				targetId: value.id,
				createdAt: FieldValue.serverTimestamp()
			});
	});
	return json({ bookmarked: true });
};
export const DELETE: RequestHandler = async (event) => {
	const user = await requireFirebaseUser(event);
	const value = target(event);
	await getFirebaseAdminDb()
		.collection('users')
		.doc(user.uid)
		.collection('bookmarks')
		.doc(value.bookmarkId)
		.delete();
	return json({ bookmarked: false });
};
