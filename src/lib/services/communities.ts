import { getFirebaseAuth } from '$lib/firebase/auth';
import type { Community } from '$lib/types';
import { Timestamp } from 'firebase/firestore';
import { collection, doc } from 'firebase/firestore';
import { getFirestoreDb } from '$lib/firebase/firestore';
import type { CreateCommunityInput } from '$lib/validation/community';
type Serialized = Omit<Community, 'createdAt' | 'updatedAt'> & {
	createdAt: number;
	updatedAt: number;
};
const revive = (c: Serialized): Community => ({
	...c,
	createdAt: Timestamp.fromMillis(c.createdAt),
	updatedAt: Timestamp.fromMillis(c.updatedAt)
});
async function headers(): Promise<Record<string, string>> {
	const u = getFirebaseAuth().currentUser;
	return u ? { authorization: `Bearer ${await u.getIdToken()}` } : {};
}
export async function listCommunities() {
	const r = await fetch('/api/communities');
	const b = await r.json().catch(() => ({}));
	if (!r.ok)
		throw new Error(
			b.message && b.message !== 'Internal Error' ? b.message : 'Không thể tải cộng đồng.'
		);
	return (b.communities as Serialized[]).map(revive);
}
export async function getCommunity(slug: string) {
	const r = await fetch(`/api/communities/${slug}`);
	const b = await r.json().catch(() => ({}));
	if (!r.ok)
		throw new Error(
			b.message && b.message !== 'Internal Error' ? b.message : 'Không thể tải cộng đồng.'
		);
	return revive(b.community);
}
export function createCommunityId(): string {
	return doc(collection(getFirestoreDb(), 'communities')).id;
}
export async function createCommunity(input: CreateCommunityInput): Promise<Community> {
	const user = getFirebaseAuth().currentUser;
	if (!user) throw new Error('Bạn cần đăng nhập.');
	const r = await fetch('/api/communities', {
		method: 'POST',
		headers: {
			authorization: `Bearer ${await user.getIdToken()}`,
			'content-type': 'application/json'
		},
		body: JSON.stringify(input)
	});
	const b = await r.json().catch(() => ({}));
	if (!r.ok) throw new Error(b.message ?? 'Không thể tạo cộng đồng.');
	return revive(b.community);
}
async function joinRequest(slug: string, method = 'GET') {
	const r = await fetch(`/api/communities/${slug}/join`, { method, headers: await headers() });
	const b = await r.json().catch(() => ({}));
	if (!r.ok) throw new Error(b.message ?? 'Không thể tham gia cộng đồng.');
	return Boolean(b.joined);
}
export const getJoinState = (s: string) => joinRequest(s);
export const joinCommunity = (s: string) => joinRequest(s, 'POST');
export const leaveCommunity = (s: string) => joinRequest(s, 'DELETE');
