import { json, type RequestHandler } from '@sveltejs/kit';
import { FieldValue } from 'firebase-admin/firestore';
import { z } from 'zod';
import { requireApplicationRole } from '$lib/server/auth';
import { getFirebaseAdminDb } from '$lib/server/firebase-admin';

const inputSchema = z
	.object({
		title: z.string().trim().min(2, 'Tiêu đề cần ít nhất 2 ký tự.').max(100),
		message: z.string().trim().min(2, 'Nội dung cần ít nhất 2 ký tự.').max(600),
		destination: z
			.string()
			.trim()
			.max(240)
			.refine((value) => !value || (value.startsWith('/') && !value.startsWith('//')), {
				message: 'Liên kết chỉ được dẫn đến trang nội bộ.'
			})
			.optional()
	})
	.strict();

const BATCH_SIZE = 450;

export const POST: RequestHandler = async (event) => {
	const { identity } = await requireApplicationRole(event, ['admin']);
	const parsed = inputSchema.safeParse(await event.request.json().catch(() => null));
	if (!parsed.success)
		return json(
			{ message: parsed.error.issues[0]?.message ?? 'Thông báo không hợp lệ.' },
			{ status: 400 }
		);

	const db = getFirebaseAdminDb();
	const announcement = db.collection('systemAnnouncements').doc();
	const recipients = await db.collection('users').where('status', '==', 'active').get();
	const destination = parsed.data.destination || '/notifications';
	await announcement.create({
		title: parsed.data.title,
		message: parsed.data.message,
		destination,
		createdBy: identity.uid,
		createdAt: FieldValue.serverTimestamp(),
		recipientCount: recipients.size
	});

	for (let offset = 0; offset < recipients.size; offset += BATCH_SIZE) {
		const batch = db.batch();
		for (const recipient of recipients.docs.slice(offset, offset + BATCH_SIZE)) {
			batch.create(
				db.collection('notifications').doc(`system_${announcement.id}_${recipient.id}`),
				{
					userId: recipient.id,
					actorId: identity.uid,
					actorName: 'Ban quản trị Vực Đêm',
					actorAvatarUrl: null,
					type: 'system_announcement',
					targetType: 'user',
					targetId: announcement.id,
					message: `${parsed.data.title}: ${parsed.data.message}`,
					destination,
					isRead: false,
					createdAt: FieldValue.serverTimestamp(),
					readAt: null
				}
			);
		}
		await batch.commit();
	}
	return json({ ok: true, recipientCount: recipients.size });
};
