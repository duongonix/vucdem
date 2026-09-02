import { FieldValue } from 'firebase-admin/firestore';
import { getFirebaseAdminDb } from './firebase-admin';

export const DEFAULT_POST_CATEGORIES = [
	{
		id: 'thong-bao',
		name: 'Thông báo',
		description: 'Thông tin chính thức từ cộng đồng.',
		order: 10
	},
	{
		id: 'dong-gop',
		name: 'Đóng góp',
		description: 'Ý tưởng và đóng góp xây dựng cộng đồng.',
		order: 20
	},
	{ id: 'thac-mac', name: 'Thắc mắc', description: 'Câu hỏi cần cộng đồng giải đáp.', order: 30 },
	{
		id: 'chia-se',
		name: 'Chia sẻ',
		description: 'Chia sẻ suy nghĩ, trải nghiệm và nội dung.',
		order: 40
	},
	{
		id: 'ke-chuyen',
		name: 'Kể chuyện',
		description: 'Những câu chuyện được kể trong đêm.',
		order: 50
	}
] as const;

export async function ensureDefaultPostCategories(): Promise<void> {
	const collection = getFirebaseAdminDb().collection('postCategories');
	const existing = await collection.limit(1).get();
	if (!existing.empty) return;
	const batch = getFirebaseAdminDb().batch();
	for (const category of DEFAULT_POST_CATEGORIES) {
		batch.set(collection.doc(category.id), {
			name: category.name,
			description: category.description,
			order: category.order,
			status: 'active',
			createdAt: FieldValue.serverTimestamp(),
			updatedAt: FieldValue.serverTimestamp()
		});
	}
	await batch.commit();
}

export function serializePostCategory(document: FirebaseFirestore.DocumentSnapshot) {
	const data = document.data()!;
	return {
		id: document.id,
		name: data.name,
		description: data.description ?? '',
		order: data.order ?? 0,
		status: data.status,
		createdAt: data.createdAt?.toMillis?.() ?? 0,
		updatedAt: data.updatedAt?.toMillis?.() ?? 0
	};
}

export async function assertActivePostCategory(categoryId: string): Promise<void> {
	await ensureDefaultPostCategories();
	const category = await getFirebaseAdminDb().collection('postCategories').doc(categoryId).get();
	if (!category.exists || category.get('status') !== 'active') {
		throw new Error('INVALID_POST_CATEGORY');
	}
}
