import { requireApplicationRole, requireFirebaseUser } from '$lib/server/auth';
import { getFirebaseAdminDb } from '$lib/server/firebase-admin';
import { serializeReport } from '$lib/server/reports';
import { createReportSchema } from '$lib/validation/report';
import { error, json, type RequestHandler } from '@sveltejs/kit';
import { FieldValue } from 'firebase-admin/firestore';
const collections = { post: 'posts', story: 'stories', comment: 'comments' } as const;
export const POST: RequestHandler = async (event) => {
	const identity = await requireFirebaseUser(event);
	const parsed = createReportSchema.safeParse(await event.request.json().catch(() => null));
	if (!parsed.success) error(400, parsed.error.issues[0]?.message ?? 'Báo cáo không hợp lệ.');
	const db = getFirebaseAdminDb();
	const target = await db
		.collection(collections[parsed.data.targetType])
		.doc(parsed.data.targetId)
		.get();
	if (!target.exists || target.get('status') === 'removed') error(404, 'Không tìm thấy nội dung.');
	if (target.get('authorId') === identity.uid)
		error(400, 'Bạn không thể báo cáo nội dung của chính mình.');
	const id = `${identity.uid}_${parsed.data.targetType}_${parsed.data.targetId}`;
	const ref = db.collection('reports').doc(id);
	const notificationRef = db
		.collection('notifications')
		.doc(`content_reported_${parsed.data.targetType}_${parsed.data.targetId}`);
	await db.runTransaction(async (t) => {
		const [existingReport, existingNotification] = await Promise.all([
			t.get(ref),
			t.get(notificationRef)
		]);
		if (existingReport.exists) error(409, 'Bạn đã báo cáo nội dung này.');
		t.create(ref, {
			reporterId: identity.uid,
			...parsed.data,
			status: 'open',
			createdAt: FieldValue.serverTimestamp(),
			reviewedBy: null,
			reviewedAt: null
		});
		if (!existingNotification.exists)
			t.create(notificationRef, {
				userId: String(target.get('authorId')),
				actorId: 'system',
				actorName: 'Hệ thống Vực Đêm',
				actorAvatarUrl: null,
				type: 'content_reported',
				targetType: parsed.data.targetType,
				targetId: parsed.data.targetId,
				message: 'Nội dung của bạn đã nhận được báo cáo và sẽ được Ban quản trị xem xét.',
				destination:
					parsed.data.targetType === 'post'
						? `/post/${parsed.data.targetId}`
						: parsed.data.targetType === 'story'
							? `/story/${String(target.get('slug') ?? '')}`
							: '/notifications',
				isRead: false,
				createdAt: FieldValue.serverTimestamp(),
				readAt: null
			});
	});
	return json({ report: serializeReport(await ref.get()) }, { status: 201 });
};
export const GET: RequestHandler = async (event) => {
	await requireApplicationRole(event, ['moderator', 'admin']);
	const status = event.url.searchParams.get('status') ?? 'open';
	if (!['open', 'reviewing', 'resolved', 'dismissed'].includes(status)) error(400);
	const snap = await getFirebaseAdminDb()
		.collection('reports')
		.where('status', '==', status)
		.orderBy('createdAt', 'desc')
		.limit(50)
		.get();
	return json({ reports: snap.docs.map(serializeReport) });
};
