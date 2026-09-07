import { requireApplicationRole } from '$lib/server/auth';
import { getFirebaseAdminDb } from '$lib/server/firebase-admin';
import { error, json, type RequestHandler } from '@sveltejs/kit';
import { FieldValue } from 'firebase-admin/firestore';
import { approvalReviewSchema } from '$lib/validation/approval';

type AuthorPublication = {
	id: string;
	authorId: string;
	title: string;
	slug: string;
	submissionVersion: number;
	type: 'author_post' | 'author_story';
};

async function notifyAuthorFollowers(
	db: FirebaseFirestore.Firestore,
	publication: AuthorPublication
) {
	const [author, followers] = await Promise.all([
		db.collection('users').doc(publication.authorId).get(),
		db
			.collection('users')
			.doc(publication.authorId)
			.collection('followers')
			.where('notificationsEnabled', '==', true)
			.get()
	]);
	if (!author.exists || followers.empty) return;
	const avatar = author.get('avatar') as { url?: unknown } | null;
	const actorName = String(author.get('displayName') ?? author.get('username') ?? 'Tác giả');
	const actorAvatarUrl = typeof avatar?.url === 'string' ? avatar.url : null;
	const targetType = publication.type === 'author_post' ? 'post' : 'story';
	const destination =
		publication.type === 'author_post' ? `/post/${publication.id}` : `/story/${publication.slug}`;
	for (let offset = 0; offset < followers.docs.length; offset += 450) {
		const batch = db.batch();
		for (const follower of followers.docs.slice(offset, offset + 450)) {
			if (follower.id === publication.authorId) continue;
			batch.set(
				db
					.collection('notifications')
					.doc(
						`${publication.type}_${publication.id}_${publication.submissionVersion}_${follower.id}`
					),
				{
					userId: follower.id,
					actorId: publication.authorId,
					actorName,
					actorAvatarUrl,
					type: publication.type,
					targetType,
					targetId: publication.id,
					message: `“${publication.title}” vừa được đăng.`,
					destination,
					isRead: false,
					createdAt: FieldValue.serverTimestamp(),
					readAt: null
				}
			);
		}
		await batch.commit();
	}
}

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
	let approvedChapter: {
		storyId: string;
		chapterId: string;
		authorId: string;
		chapterNumber: number;
		storySlug: string;
	} | null = null;
	let changedStoryStatus: {
		storyId: string;
		authorId: string;
		storySlug: string;
		storyTitle: string;
		status: 'ongoing' | 'hiatus' | 'completed';
		submissionVersion: number;
	} | null = null;
	let approvedPublication: AuthorPublication | null = null;
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
				if (!target.get('publishedAt'))
					approvedPublication = {
						id: target.id,
						authorId: effectiveAuthorId,
						title,
						slug: target.id,
						submissionVersion: parsed.data.expectedSubmissionVersion,
						type: 'author_post'
					};
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
				if (!target.get('publishedAt'))
					approvedPublication = {
						id: target.id,
						authorId: effectiveAuthorId,
						title,
						slug: String(target.get('slug')),
						submissionVersion: parsed.data.expectedSubmissionVersion,
						type: 'author_story'
					};
			if (parsed.data.decision === 'approved')
				transaction.update(db.collection('users').doc(effectiveAuthorId), {
					storyCount: FieldValue.increment(1),
					updatedAt: now
				});
		} else if (parsed.data.kind === 'serial_story') {
			const requestedStatus = target.get('requestedPublicationStatus') ?? 'ongoing';
			const previousStatus = target.get('previousPublicationStatus');
			transaction.update(target.ref, {
				...common,
				status: parsed.data.decision === 'approved' ? requestedStatus : 'draft',
				previousPublicationStatus: null,
				...(parsed.data.decision === 'approved'
					? { publishedAt: target.get('publishedAt') ?? now }
					: {})
			});
			if (parsed.data.decision === 'approved')
				if (!target.get('publishedAt'))
					approvedPublication = {
						id: target.id,
						authorId: effectiveAuthorId,
						title,
						slug: String(target.get('slug')),
						submissionVersion: parsed.data.expectedSubmissionVersion,
						type: 'author_story'
					};
			if (parsed.data.decision === 'approved')
				transaction.update(db.collection('users').doc(effectiveAuthorId), {
					storyCount: FieldValue.increment(1),
					updatedAt: now
				});
			if (
				parsed.data.decision === 'approved' &&
				['ongoing', 'hiatus', 'completed'].includes(String(previousStatus)) &&
				previousStatus !== requestedStatus
			)
				changedStoryStatus = {
					storyId: target.id,
					authorId: effectiveAuthorId,
					storySlug: String(target.get('slug')),
					storyTitle: String(target.get('title')),
					status: requestedStatus as 'ongoing' | 'hiatus' | 'completed',
					submissionVersion: parsed.data.expectedSubmissionVersion
				};
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
				approvedChapter = {
					storyId: story!.id,
					chapterId: target.id,
					authorId: effectiveAuthorId,
					chapterNumber: Number(target.get('chapterNumber') ?? 1),
					storySlug: String(story!.get('slug'))
				};
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
	const chapterNotification = approvedChapter as {
		storyId: string;
		chapterId: string;
		authorId: string;
		chapterNumber: number;
		storySlug: string;
	} | null;
	const statusNotification = changedStoryStatus as {
		storyId: string;
		authorId: string;
		storySlug: string;
		storyTitle: string;
		status: 'ongoing' | 'hiatus' | 'completed';
		submissionVersion: number;
	} | null;
	const publicationNotification = approvedPublication as AuthorPublication | null;
	if (publicationNotification) await notifyAuthorFollowers(db, publicationNotification);
	const notificationStoryId = chapterNotification?.storyId ?? statusNotification?.storyId;
	if (notificationStoryId) {
		const activityAuthorId = (chapterNotification ?? statusNotification)!.authorId;
		const [followers, author, authorFollowers, readingProgress] = await Promise.all([
			db.collection('stories').doc(notificationStoryId).collection('followers').get(),
			db.collection('users').doc(activityAuthorId).get(),
			db
				.collection('users')
				.doc(activityAuthorId)
				.collection('followers')
				.where('notificationsEnabled', '==', true)
				.get(),
			chapterNotification
				? db.collectionGroup('readingProgress').where('storyId', '==', notificationStoryId).get()
				: Promise.resolve(null)
		]);
		if (author.exists) {
			const avatar = author.get('avatar') as { url?: unknown } | null;
			const actorName = String(author.get('displayName') ?? author.get('username') ?? 'Tác giả');
			const actorAvatarUrl = typeof avatar?.url === 'string' ? avatar.url : null;
			const followerIds = new Set(followers.docs.map((follower) => follower.id));
			const authorFollowerIds = new Set(authorFollowers.docs.map((follower) => follower.id));
			const writes: Array<{ id: string; data: Record<string, unknown> }> = [];
			if (chapterNotification) {
				for (const follower of followers.docs) {
					if (follower.id === chapterNotification.authorId) continue;
					writes.push({
						id: `story_update_${chapterNotification.chapterId}_${follower.id}`,
						data: {
							userId: follower.id,
							actorId: chapterNotification.authorId,
							actorName,
							actorAvatarUrl,
							type: 'story_update',
							targetType: 'chapter',
							targetId: `${chapterNotification.storyId}:${chapterNotification.chapterId}`,
							destination: `/story/${chapterNotification.storySlug}/${chapterNotification.chapterNumber}`
						}
					});
				}
				for (const follower of authorFollowers.docs) {
					if (follower.id === chapterNotification.authorId || followerIds.has(follower.id))
						continue;
					writes.push({
						id: `author_chapter_${chapterNotification.chapterId}_${follower.id}`,
						data: {
							userId: follower.id,
							actorId: chapterNotification.authorId,
							actorName,
							actorAvatarUrl,
							type: 'author_chapter',
							targetType: 'chapter',
							targetId: `${chapterNotification.storyId}:${chapterNotification.chapterId}`,
							message: 'Tác giả bạn theo dõi vừa đăng chương mới.',
							destination: `/story/${chapterNotification.storySlug}/${chapterNotification.chapterNumber}`
						}
					});
				}
				for (const progress of readingProgress?.docs ?? []) {
					const readerId = progress.ref.parent.parent?.id;
					if (
						!readerId ||
						readerId === chapterNotification.authorId ||
						followerIds.has(readerId) ||
						authorFollowerIds.has(readerId) ||
						Number(progress.get('progressPercent') ?? 100) >= 100 ||
						Number(progress.get('chapterNumber') ?? 0) >= chapterNotification.chapterNumber
					)
						continue;
					writes.push({
						id: `reading_reminder_${chapterNotification.chapterId}_${readerId}`,
						data: {
							userId: readerId,
							actorId: chapterNotification.authorId,
							actorName,
							actorAvatarUrl,
							type: 'reading_reminder',
							targetType: 'chapter',
							targetId: `${chapterNotification.storyId}:${chapterNotification.chapterId}`,
							message: 'Chương mới đang chờ bạn trong một truyện bạn đọc dở.',
							destination: `/story/${chapterNotification.storySlug}/${chapterNotification.chapterNumber}`
						}
					});
				}
			}
			if (statusNotification) {
				const statusName =
					statusNotification.status === 'completed'
						? 'đã hoàn thành'
						: statusNotification.status === 'hiatus'
							? 'đã tạm ngưng'
							: 'đã tiếp tục ra chương';
				for (const follower of followers.docs) {
					if (follower.id === statusNotification.authorId) continue;
					writes.push({
						id: `story_status_${statusNotification.storyId}_${statusNotification.submissionVersion}_${follower.id}`,
						data: {
							userId: follower.id,
							actorId: statusNotification.authorId,
							actorName,
							actorAvatarUrl,
							type: 'story_status',
							targetType: 'story',
							targetId: statusNotification.storyId,
							message: `“${statusNotification.storyTitle}” ${statusName}.`,
							destination: `/story/${statusNotification.storySlug}`
						}
					});
				}
			}
			for (let offset = 0; offset < writes.length; offset += 450) {
				const batch = db.batch();
				for (const write of writes.slice(offset, offset + 450))
					batch.set(db.collection('notifications').doc(write.id), {
						...write.data,
						isRead: false,
						createdAt: FieldValue.serverTimestamp(),
						readAt: null
					});
				await batch.commit();
			}
		}
	}
	return json({ ok: true, decision: parsed.data.decision, approvedChapter });
};
