import { error } from '@sveltejs/kit';
import type { CommentTargetType } from '$lib/types';

export interface CommentTargetRefs {
	targetRef: FirebaseFirestore.DocumentReference;
	ownerRef: FirebaseFirestore.DocumentReference;
}

function validId(value: string): string {
	if (!value || value.includes('/')) error(400, 'ID nội dung bình luận không hợp lệ.');
	return value;
}

export function commentTargetRefs(
	db: FirebaseFirestore.Firestore,
	targetType: CommentTargetType,
	targetId: string
): CommentTargetRefs {
	if (targetType === 'post') {
		const targetRef = db.collection('posts').doc(validId(targetId));
		return { targetRef, ownerRef: targetRef };
	}
	if (targetType === 'story') {
		const targetRef = db.collection('stories').doc(validId(targetId));
		return { targetRef, ownerRef: targetRef };
	}
	const [storyId, chapterId, extra] = targetId.split(':');
	if (!storyId || !chapterId || extra) error(400, 'ID chương bình luận không hợp lệ.');
	const ownerRef = db.collection('stories').doc(validId(storyId));
	return { targetRef: ownerRef.collection('chapters').doc(validId(chapterId)), ownerRef };
}

export function assertCommentTargetReadable(
	targetType: CommentTargetType,
	target: FirebaseFirestore.DocumentSnapshot,
	owner: FirebaseFirestore.DocumentSnapshot
) {
	if (!target.exists || !owner.exists) error(404, 'Không tìm thấy nội dung.');
	if (targetType === 'post' && target.get('status') !== 'published')
		error(404, 'Không tìm thấy nội dung.');
	if (targetType === 'story' && !['ongoing', 'hiatus', 'completed'].includes(target.get('status')))
		error(404, 'Không tìm thấy nội dung.');
	if (
		targetType === 'chapter' &&
		(target.get('status') !== 'published' ||
			!['ongoing', 'hiatus', 'completed'].includes(owner.get('status')))
	)
		error(404, 'Không tìm thấy nội dung.');
}
