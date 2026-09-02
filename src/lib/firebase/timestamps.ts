import { serverTimestamp, Timestamp, type FieldValue } from 'firebase/firestore';

export type FirestoreTimestamp = Timestamp;
export type FirestoreServerTimestamp = FieldValue;

export function createServerTimestamp(): FirestoreServerTimestamp {
	return serverTimestamp();
}

export function timestampToDate(value: FirestoreTimestamp | Date): Date {
	return value instanceof Date ? value : value.toDate();
}

export function timestampToMillis(value: FirestoreTimestamp | Date): number {
	return value instanceof Date ? value.getTime() : value.toMillis();
}
