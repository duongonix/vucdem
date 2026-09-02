import { readFile } from 'node:fs/promises';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import {
	assertFails,
	initializeTestEnvironment,
	type RulesTestEnvironment
} from '@firebase/rules-unit-testing';
import { doc, getDoc, setDoc } from 'firebase/firestore';

describe.skipIf(!process.env.FIRESTORE_EMULATOR_HOST)('Firestore default-deny boundary', () => {
	let environment: RulesTestEnvironment;
	beforeAll(async () => {
		environment = await initializeTestEnvironment({
			projectId: 'demo-vucdem',
			firestore: { rules: await readFile('firestore.rules', 'utf8') }
		});
	});
	afterAll(async () => {
		await environment.cleanup();
	});
	it('denies guest and authenticated direct reads', async () => {
		await assertFails(getDoc(doc(environment.unauthenticatedContext().firestore(), 'posts/p1')));
		await assertFails(
			getDoc(doc(environment.authenticatedContext('user-1').firestore(), 'users/user-1'))
		);
		expect(true).toBe(true);
	});

	it('denies direct writes even when the document appears owned', async () => {
		await assertFails(
			setDoc(doc(environment.authenticatedContext('user-1').firestore(), 'posts/p1'), {
				authorId: 'user-1',
				status: 'published',
				voteScore: 999
			})
		);
		expect(true).toBe(true);
	});
});
