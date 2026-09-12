import { optionalFirebaseUser, requireFirebaseUser } from '$lib/server/auth';
import { getFirebaseAdminDb } from '$lib/server/firebase-admin';
import { assertCloudinaryAssetMetadata } from '$lib/server/media-authorization';
import { serializeStory } from '$lib/server/stories';
import { storyMetadataSchema, validatePublishableStory } from '$lib/validation/story';
import { error, json, type RequestHandler } from '@sveltejs/kit';
import { FieldValue } from 'firebase-admin/firestore';
import { notifyAuthorPublicationFollowers } from '$lib/server/publication-notifications';
const publicStatuses = ['ongoing', 'completed', 'hiatus'];
function id(value?: string) {
	if (!value || value.includes('/')) error(400, 'ID truyện không hợp lệ.');
	return value;
}
export const GET: RequestHandler = async (event) => {
	const identity = await optionalFirebaseUser(event);
	const snapshot = await getFirebaseAdminDb().collection('stories').doc(id(event.params.id)).get();
	if (
		!snapshot.exists ||
		(!publicStatuses.includes(snapshot.get('status')) && snapshot.get('authorId') !== identity?.uid)
	)
		error(404, 'Không tìm thấy truyện.');
	return json({ story: serializeStory(snapshot) });
};
export const PATCH: RequestHandler = async (event) => {
	const identity = await requireFirebaseUser(event);
	const body = (await event.request.json().catch(() => null)) as unknown;
	const remove =
		typeof body === 'object' && body !== null && 'action' in body && body.action === 'remove';
	const parsed = remove ? null : storyMetadataSchema.safeParse(body);
	if (!remove && parsed && !parsed.success)
		error(400, parsed.error.issues[0]?.message ?? 'Truyện không hợp lệ.');
	const storyId = id(event.params.id);
	if (parsed?.success && parsed.data.cover)
		assertCloudinaryAssetMetadata(parsed.data.cover, `vucdem/stories/${storyId}/cover`);
	const db = getFirebaseAdminDb();
	const storyRef = db.collection('stories').doc(storyId);
	const userRef = db.collection('users').doc(identity.uid);
	let publication: { slug: string; version: number } | null = null;
	await db.runTransaction(async (transaction) => {
		const [story, user] = await Promise.all([transaction.get(storyRef), transaction.get(userRef)]);
		if (!story.exists) error(404, 'Không tìm thấy truyện.');
		if (!user.exists || user.get('status') !== 'active')
			error(403, 'Tài khoản không thể cập nhật truyện.');
		if (story.get('authorId') !== identity.uid) error(403, 'Bạn không thể sửa truyện này.');
		if (story.get('status') === 'removed') error(409, 'Truyện đã bị gỡ.');
		if (!remove && story.get('moderationStatus') === 'pending' && user.get('role') !== 'admin')
			error(409, 'Truyện đang được xét duyệt. Hãy chờ quản trị viên phản hồi.');
		const current = story.get('status') as string;
		const format = story.get('format') === 'short' ? 'short' : 'serial';
		const now = FieldValue.serverTimestamp();
		if (remove) {
			transaction.update(storyRef, { status: 'removed', updatedAt: now });
			if (publicStatuses.includes(current))
				transaction.update(userRef, {
					storyCount: Math.max(0, Number(user.get('storyCount') ?? 0) - 1),
					updatedAt: now
				});
			return;
		}
		if (!parsed?.success) error(400, 'Truyện không hợp lệ.');
		const requested = parsed.data.status;
		const allowed =
			current === 'draft'
				? format === 'short'
					? ['draft', 'completed']
					: ['draft', 'ongoing']
				: current === 'ongoing'
					? ['ongoing', 'hiatus', 'completed']
					: current === 'hiatus'
						? ['hiatus', 'ongoing', 'completed']
						: ['completed'];
		if (!allowed.includes(requested) && !publicStatuses.includes(current))
			error(409, 'Chuyển trạng thái truyện không hợp lệ.');
		const submitted = requested !== 'draft';
		if (submitted) {
			const chapters = await transaction.get(storyRef.collection('chapters').limit(100));
			const eligibleChapters = chapters.docs.filter(
				(chapter) => chapter.get('status') !== 'removed'
			).length;
			const problems = validatePublishableStory(parsed.data, eligibleChapters);
			if (problems.length) error(400, problems[0]);
		}
		const wasPublic = publicStatuses.includes(current);
		const autoApproved = submitted && user.get('role') === 'admin';
		const version = Number(story.get('submissionVersion') ?? 0) + (submitted ? 1 : 0);
		if (autoApproved && !wasPublic) publication = { slug: String(story.get('slug')), version };
		transaction.update(storyRef, {
			title: parsed.data.title,
			description: parsed.data.description,
			cover: parsed.data.cover,
			tags: parsed.data.tags,
			status: autoApproved ? requested : 'draft',
			moderationStatus: autoApproved ? 'approved' : submitted ? 'pending' : 'not_submitted',
			submissionVersion: version,
			submittedAt: submitted ? now : (story.get('submittedAt') ?? null),
			reviewedAt: autoApproved ? now : submitted ? null : (story.get('reviewedAt') ?? null),
			reviewedBy: autoApproved
				? identity.uid
				: submitted
					? null
					: (story.get('reviewedBy') ?? null),
			rejectionReason: submitted ? null : (story.get('rejectionReason') ?? null),
			requestedPublicationStatus: submitted && !autoApproved ? requested : null,
			previousPublicationStatus: submitted && wasPublic && !autoApproved ? current : null,
			publishedAt: autoApproved ? (story.get('publishedAt') ?? now) : null,
			updatedAt: now,
			...(wasPublic && !autoApproved ? { isPinned: false, pinnedAt: null, pinnedBy: null } : {})
		});
		if (autoApproved)
			transaction.create(storyRef.collection('moderationReviews').doc(), {
				decision: 'approved',
				reason: null,
				reviewerId: identity.uid,
				reviewerName: String(user.get('displayName') ?? user.get('username') ?? 'Quản trị viên'),
				submissionVersion: version,
				createdAt: now
			});
		if (format === 'short') {
			transaction.update(storyRef.collection('chapters').doc('short-story'), {
				title: parsed.data.title,
				...(submitted
					? {
							status: autoApproved ? 'published' : 'draft',
							moderationStatus: autoApproved ? 'approved' : 'pending',
							submissionVersion: version,
							submittedAt: now,
							reviewedAt: autoApproved ? now : null,
							reviewedBy: autoApproved ? identity.uid : null,
							rejectionReason: null,
							...(autoApproved ? { publishedAt: story.get('publishedAt') ?? now } : {})
						}
					: {}),
				updatedAt: now
			});
		}
		if (autoApproved && !wasPublic)
			transaction.update(userRef, {
				storyCount: FieldValue.increment(1),
				updatedAt: now
			});
		else if (!autoApproved && wasPublic)
			transaction.update(userRef, {
				storyCount: Math.max(0, Number(user.get('storyCount') ?? 0) - 1),
				updatedAt: now
			});
	});
	const published = publication as { slug: string; version: number } | null;
	if (published && parsed?.success)
		await notifyAuthorPublicationFollowers(db, {
			authorId: identity.uid,
			contentId: storyId,
			title: parsed.data.title,
			destination: `/story/${published.slug}`,
			type: 'author_story',
			submissionVersion: published.version
		});
	return json({ story: serializeStory(await storyRef.get()) });
};
