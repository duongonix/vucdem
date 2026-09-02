import { goto } from '$app/navigation';
import type { User } from '$lib/types';
import type { ProfileSetupInput } from '$lib/validation/auth';
import { profileSetupSchema } from '$lib/validation/auth';
import {
	GoogleAuthProvider,
	createUserWithEmailAndPassword,
	sendPasswordResetEmail,
	signInWithEmailAndPassword,
	signInWithPopup,
	signOut,
	type User as FirebaseUser
} from 'firebase/auth';
import { Timestamp } from 'firebase/firestore';
import { getFirebaseAuth } from '$lib/firebase/auth';
import { FirebaseConfigurationError } from '$lib/firebase/errors';

interface SerializedUser extends Omit<User, 'createdAt' | 'updatedAt'> {
	createdAt: number;
	updatedAt: number;
}

export class AuthOperationError extends Error {
	constructor(message: string) {
		super(message);
		this.name = 'AuthOperationError';
	}
}

export class ProfileSetupRequiredError extends AuthOperationError {
	constructor(message: string) {
		super(message);
		this.name = 'ProfileSetupRequiredError';
	}
}

function friendlyAuthError(reason: unknown): AuthOperationError {
	if (reason instanceof AuthOperationError) return reason;
	if (reason instanceof FirebaseConfigurationError) {
		return new AuthOperationError(
			`Firebase chưa được cấu hình. Thiếu: ${reason.missing.join(', ')}.`
		);
	}
	const code =
		typeof reason === 'object' && reason && 'code' in reason ? String(reason.code) : undefined;
	const messages: Record<string, string> = {
		'auth/email-already-in-use': 'Email này đã được đăng ký.',
		'auth/invalid-credential': 'Email hoặc mật khẩu không chính xác.',
		'auth/invalid-email': 'Địa chỉ email không hợp lệ.',
		'auth/network-request-failed': 'Không thể kết nối. Hãy kiểm tra mạng và thử lại.',
		'auth/popup-closed-by-user': 'Cửa sổ đăng nhập Google đã bị đóng.',
		'auth/popup-blocked': 'Trình duyệt đã chặn cửa sổ đăng nhập Google.',
		'auth/cancelled-popup-request': 'Yêu cầu đăng nhập Google trước đó đã bị hủy.',
		'auth/unauthorized-domain':
			'Tên miền hiện tại chưa được cho phép trong Firebase Authentication.',
		'auth/operation-not-allowed': 'Đăng nhập Google chưa được bật trong Firebase Authentication.',
		'auth/account-exists-with-different-credential':
			'Email này đã dùng một phương thức đăng nhập khác.',
		'auth/internal-error': 'Firebase gặp lỗi nội bộ. Vui lòng thử lại sau.',
		'auth/too-many-requests': 'Có quá nhiều lần thử. Hãy đợi một lúc rồi thử lại.',
		'auth/weak-password': 'Mật khẩu chưa đủ mạnh.'
	};
	return new AuthOperationError(
		(code && messages[code]) || 'Không thể xác thực. Vui lòng thử lại.'
	);
}

async function authorizedProfileRequest(firebaseUser: FirebaseUser, init?: RequestInit) {
	const token = await firebaseUser.getIdToken();
	const response = await fetch('/api/auth/profile', {
		...init,
		headers: {
			'content-type': 'application/json',
			authorization: `Bearer ${token}`,
			...init?.headers
		}
	});
	const body = (await response.json().catch(() => ({}))) as {
		message?: string;
		profile?: SerializedUser | null;
	};
	if (!response.ok)
		throw new AuthOperationError(
			body.message && body.message !== 'Internal Error'
				? body.message
				: 'Máy chủ chưa thể truy cập Firebase để tải hồ sơ.'
		);
	if (!body.profile) return null;
	return {
		...body.profile,
		createdAt: Timestamp.fromMillis(body.profile.createdAt),
		updatedAt: Timestamp.fromMillis(body.profile.updatedAt)
	} satisfies User;
}

export async function loadApplicationUser(firebaseUser: FirebaseUser): Promise<User | null> {
	return authorizedProfileRequest(firebaseUser);
}

export async function createApplicationUser(
	firebaseUser: FirebaseUser,
	input: ProfileSetupInput
): Promise<User> {
	const profile = profileSetupSchema.parse(input);
	const user = await authorizedProfileRequest(firebaseUser, {
		method: 'POST',
		body: JSON.stringify(profile)
	});
	if (!user) throw new AuthOperationError('Không thể tạo hồ sơ.');
	return user;
}

export async function registerWithEmail(
	email: string,
	password: string,
	profile: ProfileSetupInput
): Promise<User> {
	try {
		const firebaseUser = (await createUserWithEmailAndPassword(getFirebaseAuth(), email, password))
			.user;
		try {
			return await createApplicationUser(firebaseUser, profile);
		} catch (reason) {
			// Keep the authenticated identity so onboarding can safely resume after a
			// username conflict or network interruption instead of orphaning Firestore state.
			throw new ProfileSetupRequiredError(
				reason instanceof Error ? reason.message : 'Hãy hoàn tất hồ sơ để tiếp tục.'
			);
		}
	} catch (reason) {
		if (reason instanceof AuthOperationError) throw reason;
		throw friendlyAuthError(reason);
	}
}

export async function loginWithEmail(email: string, password: string): Promise<FirebaseUser> {
	try {
		return (await signInWithEmailAndPassword(getFirebaseAuth(), email, password)).user;
	} catch (reason) {
		throw friendlyAuthError(reason);
	}
}

export async function loginWithGoogle(): Promise<{
	firebaseUser: FirebaseUser;
	needsProfile: boolean;
}> {
	try {
		const firebaseUser = (await signInWithPopup(getFirebaseAuth(), new GoogleAuthProvider())).user;
		return { firebaseUser, needsProfile: !(await loadApplicationUser(firebaseUser)) };
	} catch (reason) {
		throw friendlyAuthError(reason);
	}
}

export async function requestPasswordReset(email: string): Promise<void> {
	try {
		await sendPasswordResetEmail(getFirebaseAuth(), email);
	} catch (reason) {
		throw friendlyAuthError(reason);
	}
}

export async function logout(): Promise<void> {
	await signOut(getFirebaseAuth());
}

export function safeRedirect(value: string | null | undefined, fallback = '/'): string {
	if (!value?.startsWith('/') || value.startsWith('//') || value.includes('\\')) return fallback;
	try {
		const url = new URL(value, 'https://vucdem.local');
		return url.origin === 'https://vucdem.local'
			? `${url.pathname}${url.search}${url.hash}`
			: fallback;
	} catch {
		return fallback;
	}
}

export async function navigateAfterAuth(redirect: string | null | undefined): Promise<void> {
	// The destination is runtime data, but safeRedirect guarantees a same-origin absolute path.
	// eslint-disable-next-line svelte/no-navigation-without-resolve
	await goto(safeRedirect(redirect));
}
