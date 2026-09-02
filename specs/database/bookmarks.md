# Bookmarks

## Purpose and path

Private saved content lives at:

```text
users/{uid}/bookmarks/{bookmarkId}
```

## Canonical fields

```typescript
type BookmarkTargetType = 'post' | 'story';

type Bookmark = {
	id: string;
	targetType: BookmarkTargetType;
	targetId: string;
	createdAt: Timestamp;
};
```

Use a deterministic `{bookmarkId}` derived from target type and target ID so saving is idempotent and Post/Story IDs cannot collide. Only the owning User may list, read, create, or delete bookmarks. A bookmark must reference readable content and must not duplicate full content data.
