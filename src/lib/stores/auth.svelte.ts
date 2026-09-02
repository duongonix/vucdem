import { browser } from '$app/environment';
import { getFirebaseAuth } from '$lib/firebase/auth';
import { loadApplicationUser } from '$lib/services/auth';
import type { User } from '$lib/types';
import { onAuthStateChanged, type Unsubscribe, type User as FirebaseUser } from 'firebase/auth';

export type AuthStatus = 'loading' | 'authenticated' | 'unauthenticated';

class AuthStore {
	initialized = $state(false);
	firebaseUser = $state<FirebaseUser | null>(null);
	user = $state<User | null>(null);
	error = $state<string | null>(null);
	private unsubscribe?: Unsubscribe;

	get status(): AuthStatus {
		if (!this.initialized) return 'loading';
		return this.firebaseUser && this.user ? 'authenticated' : 'unauthenticated';
	}

	initialize(): void {
		if (!browser || this.unsubscribe) return;
		let auth;
		try {
			auth = getFirebaseAuth();
		} catch {
			this.error = 'Firebase chưa được cấu hình.';
			this.initialized = true;
			return;
		}
		this.unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
			this.initialized = false;
			this.firebaseUser = firebaseUser;
			this.user = null;
			this.error = null;
			try {
				if (firebaseUser) this.user = await loadApplicationUser(firebaseUser);
			} catch {
				this.error = 'Không thể tải hồ sơ tài khoản.';
			} finally {
				this.initialized = true;
			}
		});
	}

	async refresh(): Promise<void> {
		if (!this.firebaseUser) return;
		this.user = await loadApplicationUser(this.firebaseUser);
		this.initialized = true;
	}
}

export const authStore = new AuthStore();
