export const FIRESTORE_COLLECTIONS = {
	users: 'users',
	posts: 'posts',
	stories: 'stories',
	comments: 'comments',
	communities: 'communities',
	notifications: 'notifications',
	reports: 'reports',
	usernames: 'usernames',
	storySlugs: 'storySlugs'
} as const;

export type FirestoreCollectionName =
	(typeof FIRESTORE_COLLECTIONS)[keyof typeof FIRESTORE_COLLECTIONS];
