export const FIREBASE_PUBLIC_ENV_KEYS = [
	'PUBLIC_FIREBASE_API_KEY',
	'PUBLIC_FIREBASE_AUTH_DOMAIN',
	'PUBLIC_FIREBASE_PROJECT_ID',
	'PUBLIC_FIREBASE_APP_ID'
] as const;

export type FirebasePublicEnvKey = (typeof FIREBASE_PUBLIC_ENV_KEYS)[number];

export interface FirebasePublicConfig {
	apiKey: string;
	authDomain: string;
	projectId: string;
	appId: string;
}

export type FirebaseConfigResult =
	| { configured: true; config: FirebasePublicConfig }
	| { configured: false; missing: FirebasePublicEnvKey[] };

export function readFirebasePublicConfig(
	source: Record<string, string | undefined>
): FirebaseConfigResult {
	const missing = FIREBASE_PUBLIC_ENV_KEYS.filter((key) => !source[key]?.trim());

	if (missing.length > 0) {
		return { configured: false, missing };
	}

	return {
		configured: true,
		config: {
			apiKey: source.PUBLIC_FIREBASE_API_KEY!.trim(),
			authDomain: source.PUBLIC_FIREBASE_AUTH_DOMAIN!.trim(),
			projectId: source.PUBLIC_FIREBASE_PROJECT_ID!.trim(),
			appId: source.PUBLIC_FIREBASE_APP_ID!.trim()
		}
	};
}
