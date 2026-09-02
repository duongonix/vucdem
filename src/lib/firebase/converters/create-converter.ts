import type {
	DocumentData,
	FirestoreDataConverter,
	QueryDocumentSnapshot,
	SnapshotOptions,
	WithFieldValue
} from 'firebase/firestore';

export interface FirestoreDocumentCodec<Model> {
	decode(data: DocumentData, id: string): Model;
	encode(model: WithFieldValue<Model>): WithFieldValue<DocumentData>;
}

export function createFirestoreConverter<Model>(
	codec: FirestoreDocumentCodec<Model>
): FirestoreDataConverter<Model> {
	return {
		toFirestore(model: WithFieldValue<Model>): WithFieldValue<DocumentData> {
			return codec.encode(model);
		},
		fromFirestore(snapshot: QueryDocumentSnapshot, options: SnapshotOptions): Model {
			return codec.decode(snapshot.data(options), snapshot.id);
		}
	};
}
