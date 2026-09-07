# Follows

## Purpose and paths

User following is represented symmetrically:

```text
users/{uid}/following/{targetUid}
users/{targetUid}/followers/{uid}
```

Story following uses:

```text
stories/{storyId}/followers/{uid}
```

## Canonical fields

```typescript
type Follow = {
	id: string; // related Firebase UID derived from the document ID
	createdAt: Timestamp;
	notificationsEnabled: boolean; // User-follow only; defaults to false.
};
```

For User relations, direction is determined by the containing subcollection. The paired documents and `followingCount`/`followersCount` changes must be atomic and idempotent. Self-follow is forbidden. Story follows are independent of following the Story author and update only the Story's `followerCount`.

`notificationsEnabled` is stored symmetrically on both User-follow documents. The follower controls it
through the trusted follow endpoint; the mirrored value lets trusted publication producers efficiently
find followers who opted into author activity. It does not apply to `stories/{storyId}/followers/{uid}`.

Normal Users may create/delete only relationships in which they are the acting User. Trusted counters cannot be set directly.
