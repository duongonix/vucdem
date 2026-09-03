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
type VoteValue = 1;

type Vote = {
	id: string; // derived UID
	value: VoteValue;
	createdAt: Timestamp;
	updatedAt: Timestamp;
};
```

Absence of a document means no heart; zero is not persisted. Reactions are mutated through trusted
endpoints. Reaction transitions and the target's trusted `voteScore` heart count must be atomic and
idempotent. Clients cannot set aggregate scores independently. New mutations reject `-1`; historic
dislike documents are legacy data and are converted when their owner next reacts.
