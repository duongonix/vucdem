import { requireFirebaseUser } from '$lib/server/auth';
import { serializeComment } from '$lib/server/comments';
import { getFirebaseAdminDb } from '$lib/server/firebase-admin';
import { updateCommentSchema } from '$lib/validation/comment';
import { error, json, type RequestHandler } from '@sveltejs/kit';
import { FieldValue } from 'firebase-admin/firestore';
import { commentTargetRefs } from '$lib/server/comment-targets';
import type { CommentTargetType } from '$lib/types';
function id(value?: string) {
	if (!value || value.includes('/')) error(400, 'ID bình luận không hợp lệ.');
	return value;
}
export const PATCH: RequestHandler = async (event) => {
	const identity = await requireFirebaseUser(event);
	const parsed = updateCommentSchema.safeParse(await event.request.json().catch(() => null));
	if (!parsed.success) error(400, parsed.error.issues[0]?.message ?? 'Bình luận không hợp lệ.');
	const ref = getFirebaseAdminDb().collection('comments').doc(id(event.params.id));
	await getFirebaseAdminDb().runTransaction(async (transaction) => {
		const comment = await transaction.get(ref);
		if (!comment.exists) error(404, 'Không tìm thấy bình luận.');
		if (comment.get('authorId') !== identity.uid) error(403, 'Bạn không thể sửa bình luận này.');
		if (comment.get('status') !== 'published') error(409, 'Bình luận không còn khả dụng.');
		transaction.update(ref, {
			content: parsed.data.content,
			updatedAt: FieldValue.serverTimestamp()
		});
	});
	return json({ comment: serializeComment(await ref.get()) });
};
export const DELETE: RequestHandler = async (event) => {
	const identity = await requireFirebaseUser(event);
	const db = getFirebaseAdminDb();
	const ref = db.collection('comments').doc(id(event.params.id));
	await db.runTransaction(async (transaction) => {
		const comment = await transaction.get(ref);
		if (!comment.exists) error(404, 'Không tìm thấy bình luận.');
		if (comment.get('authorId') !== identity.uid) error(403, 'Bạn không thể xóa bình luận này.');
		if (comment.get('status') !== 'published') error(409, 'Bình luận đã được gỡ.');
		const { targetRef } = commentTargetRefs(
			db,
			comment.get('targetType') as CommentTargetType,
			comment.get('targetId')
		);
		const parentId = comment.get('parentId');
		const parentRef = parentId ? db.collection('comments').doc(parentId) : null;
		const [target, parent] = await Promise.all([
			transaction.get(targetRef),
			parentRef ? transaction.get(parentRef) : Promise.resolve(null)
		]);
		if (!target.exists) error(404, 'Không tìm thấy nội dung.');
		transaction.update(ref, {
			content: '',
			status: 'removed',
			updatedAt: FieldValue.serverTimestamp()
		});
		transaction.update(targetRef, {
			commentCount: Math.max(0, Number(target.get('commentCount') ?? 0) - 1)
		});
		if (parentRef && parent)
			transaction.update(parentRef, {
				replyCount: Math.max(0, Number(parent.get('replyCount') ?? 0) - 1)
			});
	});
	return json({ comment: serializeComment(await ref.get()) });
};
