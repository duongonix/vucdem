import { optionalFirebaseUser, requireActiveFirebaseUser } from '$lib/server/auth';
import { serializeDiscussionMessage, validateDiscussionMessage } from '$lib/server/discussion';
import { getFirebaseAdminDb } from '$lib/server/firebase-admin';
import { error, json, type RequestHandler } from '@sveltejs/kit';
import { FieldValue, Timestamp } from 'firebase-admin/firestore';

const PAGE_SIZE = 60;

export const GET: RequestHandler = async (event) => {
	await optionalFirebaseUser(event);
	const after = event.url.searchParams.get('after');
	let query: FirebaseFirestore.Query = getFirebaseAdminDb().collection('discussionMessages');
	if (after) {
		const timestamp = Date.parse(after);
		if (!Number.isFinite(timestamp)) error(400, 'Mốc thời gian không hợp lệ.');
		query = query
			.where('createdAt', '>', Timestamp.fromMillis(timestamp))
			.orderBy('createdAt', 'asc')
			.limit(100);
	} else query = query.orderBy('createdAt', 'desc').limit(PAGE_SIZE);
	const snapshot = await query.get();
	const documents = after ? snapshot.docs : snapshot.docs.reverse();
	return json({ messages: documents.map(serializeDiscussionMessage) });
};

export const POST: RequestHandler = async (event) => {
	const { identity, profile } = await requireActiveFirebaseUser(event);
	const body = await event.request.json().catch(() => ({}));
	const content = validateDiscussionMessage(body.content);
	const avatar = profile.get('avatar') as { url?: string } | null;
	const reference = getFirebaseAdminDb().collection('discussionMessages').doc();
	await reference.create({
		authorId: identity.uid,
		authorName: String(profile.get('displayName') ?? profile.get('username') ?? 'Thành viên'),
		authorUsername: String(profile.get('username') ?? ''),
		authorAvatarUrl: avatar?.url ?? null,
		authorVerified: profile.get('verify') === true,
		content,
		status: 'published',
		createdAt: FieldValue.serverTimestamp()
	});
	return json({ message: serializeDiscussionMessage(await reference.get()) }, { status: 201 });
};
