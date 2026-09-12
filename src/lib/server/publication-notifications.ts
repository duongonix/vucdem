import { FieldValue } from 'firebase-admin/firestore';

type PublicationType = 'author_post' | 'author_story';

function actorSnapshot(author: FirebaseFirestore.DocumentSnapshot) {
	const avatar = author.get('avatar') as { url?: unknown } | null;
	return {
		actorName: String(author.get('displayName') ?? author.get('username') ?? 'Tác giả'),
		actorAvatarUrl: typeof avatar?.url === 'string' ? avatar.url : null
	};
}

async function commitNotifications(
	db: FirebaseFirestore.Firestore,
	writes: Array<{ id: string; data: Record<string, unknown> }>
) {
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

export async function notifyAuthorPublicationFollowers(
	db: FirebaseFirestore.Firestore,
	input: {
		authorId: string;
		contentId: string;
		title: string;
		destination: string;
		type: PublicationType;
		submissionVersion: number;
	}
) {
	const [author, followers] = await Promise.all([
		db.collection('users').doc(input.authorId).get(),
		db
			.collection('users')
			.doc(input.authorId)
			.collection('followers')
			.where('notificationsEnabled', '==', true)
			.get()
	]);
	if (!author.exists || followers.empty) return;
	const actor = actorSnapshot(author);
	await commitNotifications(
		db,
		followers.docs
			.filter((follower) => follower.id !== input.authorId)
			.map((follower) => ({
				id: `${input.type}_${input.contentId}_${input.submissionVersion}_${follower.id}`,
				data: {
					userId: follower.id,
					actorId: input.authorId,
					...actor,
					type: input.type,
					targetType: input.type === 'author_post' ? 'post' : 'story',
					targetId: input.contentId,
					message: `“${input.title}” vừa được đăng.`,
					destination: input.destination
				}
			}))
	);
}

export async function notifyChapterPublicationFollowers(
	db: FirebaseFirestore.Firestore,
	input: {
		authorId: string;
		storyId: string;
		storySlug: string;
		chapterId: string;
		chapterNumber: number;
	}
) {
	const [author, storyFollowers, authorFollowers, readingProgress] = await Promise.all([
		db.collection('users').doc(input.authorId).get(),
		db.collection('stories').doc(input.storyId).collection('followers').get(),
		db
			.collection('users')
			.doc(input.authorId)
			.collection('followers')
			.where('notificationsEnabled', '==', true)
			.get(),
		db.collectionGroup('readingProgress').where('storyId', '==', input.storyId).get()
	]);
	if (!author.exists) return;
	const actor = actorSnapshot(author);
	const storyFollowerIds = new Set(storyFollowers.docs.map((follower) => follower.id));
	const authorFollowerIds = new Set(authorFollowers.docs.map((follower) => follower.id));
	const destination = `/story/${input.storySlug}/${input.chapterNumber}`;
	const writes: Array<{ id: string; data: Record<string, unknown> }> = [];
	for (const follower of storyFollowers.docs) {
		if (follower.id === input.authorId) continue;
		writes.push({
			id: `story_update_${input.chapterId}_${follower.id}`,
			data: {
				userId: follower.id,
				actorId: input.authorId,
				...actor,
				type: 'story_update',
				targetType: 'chapter',
				targetId: `${input.storyId}:${input.chapterId}`,
				destination
			}
		});
	}
	for (const follower of authorFollowers.docs) {
		if (follower.id === input.authorId || storyFollowerIds.has(follower.id)) continue;
		writes.push({
			id: `author_chapter_${input.chapterId}_${follower.id}`,
			data: {
				userId: follower.id,
				actorId: input.authorId,
				...actor,
				type: 'author_chapter',
				targetType: 'chapter',
				targetId: `${input.storyId}:${input.chapterId}`,
				message: 'Tác giả bạn theo dõi vừa đăng chương mới.',
				destination
			}
		});
	}
	for (const progress of readingProgress.docs) {
		const readerId = progress.ref.parent.parent?.id;
		if (
			!readerId ||
			readerId === input.authorId ||
			storyFollowerIds.has(readerId) ||
			authorFollowerIds.has(readerId) ||
			Number(progress.get('progressPercent') ?? 100) >= 100 ||
			Number(progress.get('chapterNumber') ?? 0) >= input.chapterNumber
		)
			continue;
		writes.push({
			id: `reading_reminder_${input.chapterId}_${readerId}`,
			data: {
				userId: readerId,
				actorId: input.authorId,
				...actor,
				type: 'reading_reminder',
				targetType: 'chapter',
				targetId: `${input.storyId}:${input.chapterId}`,
				message: 'Chương mới đang chờ bạn trong một truyện bạn đọc dở.',
				destination
			}
		});
	}
	await commitNotifications(db, writes);
}
