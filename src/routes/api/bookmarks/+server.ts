import { requireFirebaseUser } from '$lib/server/auth';
import { getFirebaseAdminDb } from '$lib/server/firebase-admin';
import { serializePost } from '$lib/server/posts';
import { serializeStory } from '$lib/server/stories';
import { json, type RequestHandler } from '@sveltejs/kit';
export const GET: RequestHandler = async (event) => {
	const identity = await requireFirebaseUser(event);
	const db = getFirebaseAdminDb();
	const snap = await db
		.collection('users')
		.doc(identity.uid)
		.collection('bookmarks')
		.orderBy('createdAt', 'desc')
		.limit(20)
		.get();
	const items = (
		await Promise.all(
			snap.docs.map(async (bookmark) => {
				const type = bookmark.get('targetType') as 'post' | 'story';
				const target = await db
					.collection(type === 'post' ? 'posts' : 'stories')
					.doc(bookmark.get('targetId'))
					.get();
				if (!target.exists) return null;
				const publicStatus =
					type === 'post'
						? target.get('status') === 'published'
						: ['ongoing', 'hiatus', 'completed'].includes(target.get('status'));
				return publicStatus
					? {
							targetType: type,
							content: type === 'post' ? serializePost(target) : serializeStory(target)
						}
					: null;
			})
		)
	).filter(Boolean);
	return json({ items });
};
