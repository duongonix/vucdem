# Comments

## Purpose and path

Comments and replies live in the root collection:

```text
comments/{commentId}
```

Replies use `parentId`; there is no separate replies collection.

## Canonical fields

```typescript
type CommentTargetType = 'post' | 'story' | 'chapter';
type CommentStatus = 'published' | 'hidden' | 'removed';

type Comment = {
	id: string;
	authorId: string;
	authorName: string;
	authorUsername: string;
	authorAvatarUrl: string | null;
	targetType: CommentTargetType;
	targetId: string;
	parentId: string | null;
	content: string;
	isSpoiler: boolean;
	voteScore: number;
	replyCount: number;
	status: CommentStatus;
	createdAt: Timestamp;
	updatedAt: Timestamp;
};
```

Author display fields are denormalized snapshots; `authorId` remains canonical. `voteScore` and `replyCount` are non-negative trusted counters. A reply must target the same content as its parent. Authors may edit content but not ownership, target identity, counters, or moderation state. Public reads require a readable target and `published` status.

## Mutations, counters, and indexes

Top-level comments query by `targetType`, `targetId`, `parentId == null`, readable `status`, and `createdAt DESC`. Replies query by `parentId`, readable `status`, and `createdAt ASC`. These two composite indexes are represented in `firestore.indexes.json`.

Create and soft-remove transactions update the target Post, Story, or Chapter `commentCount`; replies also update the direct parent's `replyCount`. Chapter targets store `targetId` as `{storyId}:{chapterId}`. All published Comments and replies contribute to `commentCount`. Soft removal stores empty `content`, preserves the document for reply continuity, and changes `status` to `removed`.

Comment content is required after trimming and limited to 5,000 characters. `isSpoiler` is required
for new records (default `false` for legacy records) and controls an explicit click-to-reveal UI;
it does not change read authorization.

Trusted moderation may additionally store `moderatedBy`, `moderatedAt`, and the temporary
`moderationPreviousStatus` field. The previous status is removed after restoration. Normal
Users cannot write these fields.
