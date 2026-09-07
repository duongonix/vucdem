# Notifications

Content review creates `content_approved` or `content_rejected` Notifications. These records may
include a user-facing `message` and trusted `destination` to the relevant detail/editor route.

## Purpose and path

Notifications are private recipient-owned activity records:

```text
notifications/{notificationId}
```

## Canonical fields

```typescript
type NotificationType =
	| 'comment'
	| 'reply'
	| 'follow'
	| 'upvote'
	| 'story_update'
	| 'mention'
	| 'content_approved'
	| 'content_rejected'
	| 'story_rating'
	| 'story_status'
	| 'content_reported'
	| 'content_hidden'
	| 'system_announcement'
	| 'reading_reminder'
	| 'author_post'
	| 'author_story'
	| 'author_chapter';

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
	message?: string | null;
	destination?: string | null;
	isRead: boolean;
	createdAt: Timestamp;
	readAt: Timestamp | null;
};
```

Actor display fields are snapshots; `actorId` is canonical. Only `userId` may read a Notification. Clients may mark their own records read, but cannot forge another recipient, actor, event, target, or creation timestamp. Activity producers must prevent self-notification where appropriate.

Recipient feeds query `userId`, ordered by `createdAt DESC`; unread indicators additionally constrain `isRead == false`.

Supported activity producers are trusted SvelteKit server endpoints. Deterministic records are used for follow and upvote events; comment/reply events receive unique IDs. Following a serialized Story creates a deterministic `follow` record for its author. Published chapters create one `story_update` record per current Story follower. Short Stories support neither relationship.

`story_rating` is keyed by Story and rater so a changed score replaces the recipient's unread
notice rather than creating repeated noise. `content_reported` is keyed by target and does not
reveal the reporter. `content_hidden` is emitted only for Admin hide/remove transitions.
`system_announcement` is keyed by the trusted `systemAnnouncements` document and recipient.
`reading_reminder` is keyed by newly published Chapter and reader, and only targets saved progress
below 100% from an older Chapter. Optional `message` and internal-only `destination` are trusted
server fields for these contextual notifications.

`author_post` and `author_story` are keyed by content, submission version, and opted-in User follower.
`author_chapter` is keyed by chapter and opted-in User follower. These are emitted only after first
publication approval (or a newly approved chapter) and are suppressed when the recipient already
follows the specific Story, which receives `story_update` instead.
