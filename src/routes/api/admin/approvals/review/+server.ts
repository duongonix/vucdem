import { requireApplicationRole } from '$lib/server/auth';
import { getFirebaseAdminDb } from '$lib/server/firebase-admin';
import { error, json, type RequestHandler } from '@sveltejs/kit';
import { FieldValue } from 'firebase-admin/firestore';
import { approvalReviewSchema } from '$lib/validation/approval';

export const PATCH: RequestHandler = async (event) => {
	const { identity, profile } = await requireApplicationRole(event, ['admin']);
	const parsed = approvalReviewSchema.safeParse(await event.request.json().catch(() => null));
	if (!parsed.success)
		error(400, parsed.error.issues[0]?.message ?? 'Yêu cầu xét duyệt không hợp lệ.');
	const db = getFirebaseAdminDb();
	const storyRef = parsed.data.storyId ? db.collection('stories').doc(parsed.data.storyId) : null;
	const targetRef =
		parsed.data.kind === 'post'
			? db.collection('posts').doc(parsed.data.id)
			: parsed.data.kind === 'short_story' || parsed.data.kind === 'serial_story'
				? db.collection('stories').doc(parsed.data.id)
				: storyRef?.collection('chapters').doc(parsed.data.id);
	if (!targetRef) error(400, 'Thiếu Story của chương cần duyệt.');
	let approvedChapter: { storyId: string; chapterId: string; authorId: string } | null = null;
	await db.runTransaction(async (transaction) => {
		const target = await transaction.get(targetRef);
		if (!target.exists) error(404, 'Không tìm thấy nội dung cần duyệt.');
		if (
			target.get('moderationStatus') !== 'pending' ||
			Number(target.get('submissionVersion')) !== parsed.data.expectedSubmissionVersion
		)
			error(409, 'Nội dung này đã được xử lý hoặc đã có phiên bản gửi mới.');
		const now = FieldValue.serverTimestamp();
		const authorId = String(target.get('authorId') ?? '');
		let notificationTarget: 'post' | 'story' | 'chapter' = 'post';
		let destination = `/post/${target.id}`;
		let title = String(target.get('title') ?? 'Nội dung');
		let effectiveAuthorId = authorId;
		let story: FirebaseFirestore.DocumentSnapshot | null = null;
		if (parsed.data.kind !== 'post') {
			const storyTarget = parsed.data.kind === 'short_story' || parsed.data.kind === 'serial_story';
			const ref = storyTarget ? target.ref : storyRef!;
			story = storyTarget ? target : await transaction.get(ref);
			if (!story.exists) error(404, 'Không tìm thấy truyện.');
			effectiveAuthorId = String(story.get('authorId'));
			title =
				parsed.data.kind === 'chapter'
					? `${target.get('title')} — ${story.get('title')}`
					: String(story.get('title'));
			notificationTarget = parsed.data.kind === 'chapter' ? 'chapter' : 'story';
			destination =
				parsed.data.kind === 'chapter'
					? `/story/${story.get('slug')}/${target.id}`
					: `/story/${story.get('slug')}`;
		}
		const reviewRef = target.ref.collection('moderationReviews').doc();
		transaction.create(reviewRef, {
			decision: parsed.data.decision,
			reason: parsed.data.decision === 'rejected' ? parsed.data.reason : null,
			reviewerId: identity.uid,
			reviewerName: String(
				profile.get('displayName') ?? profile.get('username') ?? 'Quản trị viên'
			),
			submissionVersion: parsed.data.expectedSubmissionVersion,
			createdAt: now
		});
		const common = {
			moderationStatus: parsed.data.decision,
			reviewedBy: identity.uid,
			reviewedAt: now,
			rejectionReason: parsed.data.decision === 'rejected' ? parsed.data.reason : null,
			updatedAt: now
		};
		if (parsed.data.kind === 'post') {
			transaction.update(target.ref, {
				...common,
				status: parsed.data.decision === 'approved' ? 'published' : 'draft',
				...(parsed.data.decision === 'approved'
					? { publishedAt: target.get('publishedAt') ?? now }
					: {})
			});
			if (parsed.data.decision === 'approved') {
				transaction.update(db.collection('users').doc(effectiveAuthorId), {
					postCount: FieldValue.increment(1),
					updatedAt: now
				});
				if (target.get('communityId'))
					transaction.update(db.collection('communities').doc(target.get('communityId')), {
						postCount: FieldValue.increment(1),
						updatedAt: now
					});
			}
		} else if (parsed.data.kind === 'short_story') {
			transaction.update(target.ref, {
				...common,
				status: parsed.data.decision === 'approved' ? 'completed' : 'draft',
				...(parsed.data.decision === 'approved'
					? { publishedAt: target.get('publishedAt') ?? now }
					: {})
			});
			transaction.update(target.ref.collection('chapters').doc('short-story'), {
				...common,
				status: parsed.data.decision === 'approved' ? 'published' : 'draft',
				...(parsed.data.decision === 'approved' ? { publishedAt: now } : {})
			});
			if (parsed.data.decision === 'approved')
				transaction.update(db.collection('users').doc(effectiveAuthorId), {
					storyCount: FieldValue.increment(1),
					updatedAt: now
				});
		} else if (parsed.data.kind === 'serial_story') {
			transaction.update(target.ref, {
				...common,
				status:
					parsed.data.decision === 'approved'
						? (target.get('requestedPublicationStatus') ?? 'ongoing')
						: 'draft',
				...(parsed.data.decision === 'approved'
					? { publishedAt: target.get('publishedAt') ?? now }
					: {})
			});
			if (parsed.data.decision === 'approved')
				transaction.update(db.collection('users').doc(effectiveAuthorId), {
					storyCount: FieldValue.increment(1),
					updatedAt: now
				});
		} else {
			transaction.update(target.ref, {
				...common,
				status: parsed.data.decision === 'approved' ? 'published' : 'draft',
				...(parsed.data.decision === 'approved'
					? { publishedAt: target.get('publishedAt') ?? now }
					: {})
			});
			if (story?.get('moderationStatus') === 'pending') {
				transaction.update(story.ref, {
					...common,
					status:
						parsed.data.decision === 'approved'
							? (story.get('requestedPublicationStatus') ?? 'ongoing')
							: 'draft',
					...(parsed.data.decision === 'approved'
						? { publishedAt: story.get('publishedAt') ?? now }
						: {})
				});
				if (parsed.data.decision === 'approved')
					transaction.update(db.collection('users').doc(effectiveAuthorId), {
						storyCount: FieldValue.increment(1),
						updatedAt: now
					});
			}
			if (parsed.data.decision === 'approved')
				approvedChapter = { storyId: story!.id, chapterId: target.id, authorId: effectiveAuthorId };
		}
		const notificationRef = db
			.collection('notifications')
			.doc(`moderation_${parsed.data.kind}_${target.id}_${parsed.data.expectedSubmissionVersion}`);
		transaction.set(notificationRef, {
			userId: effectiveAuthorId,
			actorId: identity.uid,
			actorName: 'Ban quản trị Vực Đêm',
			actorAvatarUrl: null,
			type: parsed.data.decision === 'approved' ? 'content_approved' : 'content_rejected',
			targetType: notificationTarget,
			targetId: target.id,
			message:
				parsed.data.decision === 'approved'
					? `“${title}” đã được phê duyệt.`
					: `“${title}” bị từ chối: ${parsed.data.reason}`,
			destination,
			isRead: false,
			createdAt: now,
			readAt: null
		});
	});
	if (approvedChapter) {
		const approved = approvedChapter as { storyId: string; chapterId: string; authorId: string };
		const [followers, author] = await Promise.all([
			db.collection('stories').doc(approved.storyId).collection('followers').limit(500).get(),
			db.collection('users').doc(approved.authorId).get()
		]);
		if (author.exists && !followers.empty) {
			const avatar = author.get('avatar') as { url?: unknown } | null;
			const batch = db.batch();
			for (const follower of followers.docs) {
				if (follower.id === approved.authorId) continue;
				batch.set(
					db.collection('notifications').doc(`story_update_${approved.chapterId}_${follower.id}`),
					{
						userId: follower.id,
						actorId: approved.authorId,
						actorName: String(author.get('displayName') ?? author.get('username') ?? 'Tác giả'),
						actorAvatarUrl: typeof avatar?.url === 'string' ? avatar.url : null,
						type: 'story_update',
						targetType: 'chapter',
						targetId: `${approved.storyId}:${approved.chapterId}`,
						isRead: false,
						createdAt: FieldValue.serverTimestamp(),
						readAt: null
					}
				);
			}
			await batch.commit();
		}
	}
	return json({ ok: true, decision: parsed.data.decision, approvedChapter });
};
