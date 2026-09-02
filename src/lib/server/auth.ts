import { error, type RequestEvent } from '@sveltejs/kit';
import type { DecodedIdToken } from 'firebase-admin/auth';
import { getFirebaseAdminAuth, getFirebaseAdminDb } from './firebase-admin';

export async function requireFirebaseUser(event: RequestEvent): Promise<DecodedIdToken> {
	const authorization = event.request.headers.get('authorization');
	if (!authorization?.startsWith('Bearer ')) {
		error(401, 'Authentication required.');
	}

	const token = authorization.slice('Bearer '.length).trim();
	if (!token) error(401, 'Authentication required.');

	try {
		return await getFirebaseAdminAuth().verifyIdToken(token, true);
	} catch {
		error(401, 'Authentication token is invalid or expired.');
	}
}

export async function optionalFirebaseUser(event: RequestEvent): Promise<DecodedIdToken | null> {
	const authorization = event.request.headers.get('authorization');
	if (!authorization?.startsWith('Bearer ')) return null;
	const token = authorization.slice('Bearer '.length).trim();
	if (!token) return null;
	try {
		return await getFirebaseAdminAuth().verifyIdToken(token, true);
	} catch {
		return null;
	}
}

export async function requireApplicationRole(
	event: RequestEvent,
	roles: readonly ('moderator' | 'admin')[]
): Promise<{ identity: DecodedIdToken; profile: FirebaseFirestore.DocumentSnapshot }> {
	const identity = await requireFirebaseUser(event);
	const profile = await getFirebaseAdminDb().collection('users').doc(identity.uid).get();
	if (!profile.exists || profile.get('status') !== 'active' || !roles.includes(profile.get('role')))
		error(403, 'Bạn không có quyền thực hiện thao tác này.');
	return { identity, profile };
}

export async function requireActiveFirebaseUser(
	event: RequestEvent
): Promise<{ identity: DecodedIdToken; profile: FirebaseFirestore.DocumentSnapshot }> {
	const identity = await requireFirebaseUser(event);
	const profile = await getFirebaseAdminDb().collection('users').doc(identity.uid).get();
	if (!profile.exists || profile.get('status') !== 'active')
		error(403, 'Tài khoản không thể thực hiện thao tác này.');
	return { identity, profile };
}
