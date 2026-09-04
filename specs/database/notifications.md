# Notifications

## Purpose and path

Notifications are private recipient-owned activity records:

```text
notifications/{notificationId}
```

## Canonical fields

```typescript
type NotificationType = 'comment' | 'reply' | 'follow' | 'upvote' | 'story_update' | 'mention';

type NotificationTargetType = 'user' | 'post' | 'story' | 'chapter' | 'comment';

type Notification = {
	id: string;
	userId: string;
	actorId: string;
	actorName: string;
	actorAvatarUrl: string | null;
	type: NotificationType;
	targetType: NotificationTargetType;
	targetId: string;
	isRead: boolean;
	createdAt: Timestamp;
	readAt: Timestamp | null;
};
```

Actor display fields are snapshots; `actorId` is canonical. Only `userId` may read a Notification. Clients may mark their own records read, but cannot forge another recipient, actor, event, target, or creation timestamp. Activity producers must prevent self-notification where appropriate.

Recipient feeds query `userId`, ordered by `createdAt DESC`; unread indicators additionally constrain `isRead == false`.

Supported activity producers are trusted SvelteKit server endpoints. Deterministic records are used for follow and upvote events; comment/reply events receive unique IDs. Following a serialized Story creates a deterministic `follow` record for its author. Published chapters create one `story_update` record per current Story follower. Short Stories support neither relationship.
