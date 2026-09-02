# Votes

## Purpose and paths

One vote per User per target is stored using the Firebase UID as document ID:

```text
posts/{postId}/votes/{uid}
stories/{storyId}/votes/{uid}
comments/{commentId}/votes/{uid}
```

## Canonical fields

```typescript
type VoteValue = -1 | 1;

type Vote = {
	id: string; // derived UID
	value: VoteValue;
	createdAt: Timestamp;
	updatedAt: Timestamp;
};
```

Absence of a document means no vote; zero is not persisted. A User may only write their own vote document. Vote transitions and the target's trusted `voteScore` must be atomic and idempotent. Clients cannot set aggregate scores independently.
