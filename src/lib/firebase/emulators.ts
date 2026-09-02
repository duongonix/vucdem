export interface EmulatorAddress {
	host: string;
	port: number;
}

export function useFirebaseEmulators(source: Record<string, string | undefined>): boolean {
	return source.PUBLIC_FIREBASE_USE_EMULATORS?.trim().toLowerCase() === 'true';
}

export function parseEmulatorAddress(
	value: string | undefined,
	defaultPort: number
): EmulatorAddress {
	const normalized = value?.trim() || `127.0.0.1:${defaultPort}`;
	const separator = normalized.lastIndexOf(':');
	const host = separator > 0 ? normalized.slice(0, separator) : normalized;
	const portText = separator > 0 ? normalized.slice(separator + 1) : String(defaultPort);
	const port = Number(portText);

	if (!host || !Number.isInteger(port) || port < 1 || port > 65_535) {
		throw new Error(`Invalid Firebase emulator address: ${normalized}`);
	}

	return { host, port };
}
