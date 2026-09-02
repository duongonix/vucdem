import { describe, expect, it, vi } from 'vitest';
import { getFirebaseAuth } from './auth';
import { getFirebaseApp } from './client';
import { getFirestoreDb } from './firestore';

vi.mock('$env/dynamic/public', () => ({ env: {} }));

describe('Firebase browser client', () => {
	it('initializes the default Firebase app from validated public config', () => {
		const app = getFirebaseApp({
			PUBLIC_FIREBASE_API_KEY: 'test-api-key',
			PUBLIC_FIREBASE_AUTH_DOMAIN: 'vucdem-test.firebaseapp.com',
			PUBLIC_FIREBASE_PROJECT_ID: 'vucdem-test',
			PUBLIC_FIREBASE_APP_ID: 'test-app-id'
		});

		expect(app.options.projectId).toBe('vucdem-test');
		expect(app.options.authDomain).toBe('vucdem-test.firebaseapp.com');
		expect(getFirebaseAuth().app).toBe(app);
		expect(getFirestoreDb().app).toBe(app);
	});
});
