# Stories

> Interactive format extension: Story `contentFormat` also accepts `interactive`. A serial Story containing chapters with different formats remains `mixed`. See `specs/database/interactive-stories.md`.

This document defines the canonical Firestore schema for vucdem Stories.

A Story is long-form serialized content containing Chapters.

---

# 1. Firestore Path

```text
stories/{storyId}
```

Chapters are stored separately under:

```text
stories/{storyId}/chapters/{chapterId}
```

Do not embed all Chapter bodies inside the Story document.

---

# 2. TypeScript Model

```typescript
type StoryStatus = 'draft' | 'ongoing' | 'completed' | 'hiatus' | 'hidden' | 'removed';

type CloudinaryAsset = {
	url: string;
	publicId: string;
};

type Story = {
	id: string;

	authorId: string;
	authorName: string;
	authorUsername: string;
	authorAvatarUrl: string | null;

	title: string;
	slug: string;
	description: string;

	cover: CloudinaryAsset | null;

	tags: string[];
	format: 'serial' | 'short';
	contentFormat: 'text' | 'audio' | 'mixed';

	status: StoryStatus;

	chapterCount: number;
	chapterSequence: number;
	commentCount: number;
	viewCount: number;
	followerCount: number;
	ratingCount: number;
	ratingSum: number;
	ratingAverage: number;

	createdAt: Timestamp;
	updatedAt: Timestamp;
	publishedAt: Timestamp | null;
};
```

`format` is immutable after creation. Existing documents without the field are interpreted as
`serial`. A `short` Story owns exactly one Chapter at `chapters/short-story`, always numbered `1`;
creation writes the Story and this Chapter atomically. APIs reject creating or removing another
Chapter for a short Story. Large prose remains in the Chapter document rather than being embedded
in Story metadata.

`contentFormat` is a denormalized discovery/display field. `text` means every known Chapter is
prose, `audio` means every known Chapter is audio, and `mixed` means the serialized Story contains
both. Existing documents without this field are interpreted as `text`. The playable asset remains
on each Chapter; the Story document never embeds an audio file.

Ratings use `stories/{storyId}/ratings/{uid}` with `value` (integer 1–5), `createdAt`, and
`updatedAt`. `ratingCount`, `ratingSum`, and `ratingAverage` are trusted denormalized fields with
initial value `0`. A transactional server mutation creates or replaces the User's rating and updates
all aggregates atomically. Normal clients cannot write rating documents or aggregate fields directly.

`chapterSequence` is a trusted monotonically increasing allocator. It prevents duplicate chapter numbers and is not decremented when a chapter is removed.

`id` is normally derived from the Firestore document ID.

---

# 3. Example Document

```json
{
	"authorId": "user123",
	"authorName": "Nocturne",
	"authorUsername": "nocturne",
	"authorAvatarUrl": "https://res.cloudinary.com/example/image/upload/vucdem/avatars/user123/avatar.webp",

	"title": "Căn phòng ở tầng 13",
	"slug": "can-phong-o-tang-13",

	"description": "Mỗi đêm, thang máy của tòa nhà dừng ở một tầng không hề tồn tại.",

	"cover": {
		"url": "https://res.cloudinary.com/example/image/upload/vucdem/stories/story123/cover.webp",
		"publicId": "vucdem/stories/story123/cover"
	},

	"tags": ["chung cư", "tâm linh", "bí ẩn"],

	"status": "ongoing",

	"chapterCount": 12,
	"viewCount": 48120,
	"followerCount": 3280,

	"createdAt": "Timestamp",
	"updatedAt": "Timestamp",
	"publishedAt": "Timestamp"
}
```

---

# 4. authorId

Type:

```text
string
```

Required:

```text
Yes
```

Canonical value:

```text
Firebase UID
```

Represents Story ownership.

Normal Users must not change this field after Story creation.

---

# 5. authorName

Type:

```text
string
```

Required:

```text
Yes
```

Denormalized author display name.

Used to reduce extra User reads.

Do not use for authorization.

---

# 6. authorUsername

Type:

```text
string
```

Required:

```text
Yes
```

Denormalized public username.

Used for display and navigation.

Canonical identity remains:

```text
authorId
```

---

# 7. authorAvatarUrl

Type:

```text
string | null
```

Required:

```text
Yes
```

Denormalized avatar URL.

The Story does not own this asset and must not attempt to delete it.

---

# 8. title

Type:

```text
string
```

Required:

```text
Yes
```

Human-readable Story title.

Validation is defined under:

```text
specs/implementation/validation.md
```

---

# 9. slug

Type:

```text
string
```

Required:

```text
Yes
```

Human-readable unique URL identifier.

Example:

```text
can-phong-o-tang-13
```

Canonical route:

```text
/story/can-phong-o-tang-13
```

Slug must be globally unique among Stories if this route model is used.

---

# 10. Slug Reservation

Use:

```text
storySlugs/{slug}
```

Example:

```json
{
	"storyId": "story123",
	"createdAt": "Timestamp"
}
```

Story creation and slug reservation must use an atomic or trusted workflow.

Do not rely on:

```text
query whether slug exists
→ create later
```

without concurrency protection.

---

# 11. Slug Normalization

Slugs should be URL-safe.

Typical behavior:

```text
Căn phòng ở tầng 13
↓
can-phong-o-tang-13
```

Exact normalization behavior must be deterministic.

If collisions occur, the application may generate a suffix according to the Story feature specification.

Example:

```text
can-phong-o-tang-13
can-phong-o-tang-13-2
```

Do not silently modify an existing Story's slug unless the feature explicitly supports it.

---

# 12. description

Type:

```text
string
```

Required:

```text
Yes
```

Purpose:

Story summary displayed on:

- Story detail
- Discovery cards
- Search results
- Author profile

Description is not Chapter content.

---

# 13. cover

Type:

```text
CloudinaryAsset | null
```

Required:

```text
Yes
```

Cloudinary path:

```text
vucdem/stories/{storyId}/cover
```

Whether cover is mandatory for publication is defined by validation/feature specifications.

---

# 14. tags

Type:

```text
string[]
```

Required:

```text
Yes
```

Default:

```text
[]
```

The number of tags must remain bounded.

Tags are used for discovery.

Tags are not Communities.

---

# 15. status

Allowed values:

```text
draft
ongoing
completed
hiatus
hidden
removed
```

---

# 16. draft

Story is not publicly published.

May contain unpublished Chapters.

Only owner and authorized roles may access it according to Security Rules.

---

# 17. ongoing

Story is publicly published and still receiving Chapters.

This is the normal status for an active serialized Story.

---

# 18. completed

Story is publicly published and declared complete by its Author.

---

# 19. hiatus

Story is publicly published but temporarily paused.

It remains readable unless otherwise restricted.

---

# 20. hidden

Story is hidden from normal public access/discovery.

Typically controlled through moderation.

---

# 21. removed

Story has been removed.

The document may remain to preserve moderation/reference integrity.

---

# 22. chapterCount

Type:

```text
number
```

Required:

```text
Yes
```

Default:

```text
0
```

Integer:

```text
Yes
```

Minimum:

```text
0
```

Trusted denormalized counter.

Represents Chapters counted according to the Story feature policy.

Do not calculate it by loading the entire Chapters subcollection whenever Story metadata is displayed.

---

# 23. viewCount

Type:

```text
number
```

Required:

```text
Yes
```

Default:

```text
0
```

Trusted denormalized counter.

Story view counting must not permit unrestricted client increments.

The exact semantics of Story views versus Chapter views are defined by the Story/reader feature specification.

---

# 24. followerCount

Type:

```text
number
```

Required:

```text
Yes
```

Default:

```text
0
```

Trusted denormalized counter.

Represents Users following this Story.

This is separate from:

```text
Author followers
Bookmarks
```

---

# 25. createdAt

Type:

```text
Firestore Timestamp
```

Required:

```text
Yes
```

Immutable after Story creation.

Use trusted timestamp.

---

# 26. updatedAt

Type:

```text
Firestore Timestamp
```

Required:

```text
Yes
```

Represents recent meaningful Story activity.

May change when:

- Story metadata changes
- A Chapter is published
- Relevant Story state changes

This allows active Stories to be ordered by recent updates.

---

# 27. publishedAt

Type:

```text
Firestore Timestamp | null
```

Required:

```text
Yes
```

Default:

```text
null
```

Set when the Story becomes publicly available for the first time.

Do not reset this on every Chapter publication.

---

# 28. Chapters

Canonical path:

```text
stories/{storyId}/chapters/{chapterId}
```

Story documents must not contain:

```text
chapters: [...]
```

with full Chapter objects.

Detailed Chapter schema:

```text
specs/database/chapters.md
```

---

# 29. Followers Subcollection

Canonical path:

```text
stories/{storyId}/followers/{uid}
```

Example:

```json
{
	"createdAt": "Timestamp"
}
```

Document ID:

```text
uid
```

This ensures one follow relationship per User per Story.

---

# 30. Story Follow

When User follows a Story:

```text
stories/{storyId}/followers/{uid}
```

is created.

`followerCount` must increase exactly once.

Repeated Follow operations must not increment the counter multiple times.

---

# 31. Unfollow Story

When User unfollows:

```text
stories/{storyId}/followers/{uid}
```

is deleted.

`followerCount` decreases exactly once.

Counter must never become negative.

---

# 32. Story Following vs User Following

These are independent.

```text
Follow Author
→ interested in that User

Follow Story
→ interested in updates to that Story
```

Following a Story must not automatically follow its Author unless explicitly specified in the future.

---

# 33. Bookmark vs Follow

Bookmark:

```text
save this Story privately
```

Story Follow:

```text
receive/track Story updates
```

These concepts must remain separate.

---

# 34. Story Votes

The current architecture allows a Story votes subcollection:

```text
stories/{storyId}/votes/{uid}
```

However, Story voting UI should only be implemented if defined by:

```text
specs/features/stories.md
specs/features/voting.md
```

Do not expose a feature merely because the storage path exists in architecture.

If Story voting is not part of MVP behavior, the subcollection can remain unused.

---

# 35. Story Creation Flow

Conceptually:

```text
Authenticated User
    ↓
Generate Story ID
    ↓
Generate/reserve unique slug
    ↓
Upload optional cover
    ↓
Create Story
```

Initial values:

```text
authorId = current UID
status = draft
chapterCount = 0
commentCount = 0
viewCount = 0
followerCount = 0
createdAt = trusted timestamp
updatedAt = trusted timestamp
publishedAt = null
```

---

# 36. Publication Flow

Conceptually:

```text
draft
↓
validate Story
↓
validate required publication conditions
↓
ongoing
```

First publication sets:

```text
publishedAt
```

A Story may later transition:

```text
ongoing
→ hiatus
→ ongoing
```

or:

```text
ongoing
→ completed
```

Exact allowed transitions are defined in the Story feature specification.

---

# 37. Completed Stories

A completed Story may still allow Author corrections to existing Chapters according to feature rules.

`completed` means serialization is considered finished, not necessarily immutable.

---

# 38. Story Detail Route

Canonical:

```text
/story/{slug}
```

Story resolution:

```text
slug
↓
storySlugs/{slug}
↓
storyId
↓
stories/{storyId}
```

This avoids requiring a query by slug for every page load and provides a canonical uniqueness mapping.

---

# 39. Reader Route

Canonical conceptual route:

```text
/story/{slug}/{chapter}
```

Chapter route format is defined in Story Reader specifications.

Possible examples:

```text
/story/can-phong-o-tang-13/chapter-1
```

Do not use Chapter document IDs directly in visible URLs unless the routing specification chooses that design.

---

# 40. Author Stories Query

Public profile query:

```text
stories
where authorId == uid
where status in publicly visible statuses
orderBy updatedAt DESC
```

The exact status query may need to account for:

```text
ongoing
completed
hiatus
```

Firestore query/index limitations must be considered.

---

# 41. Recently Updated Stories

Conceptual discovery query:

```text
stories
where status in public statuses
orderBy updatedAt DESC
limit 20
```

The concrete Firestore query must match supported indexes and Security Rules.

---

# 42. Popular Stories

Possible ranking query:

```text
stories
where status in public statuses
orderBy followerCount DESC
limit 20
```

or another ranking strategy defined by product specifications.

Do not assume `followerCount` is the final long-term ranking algorithm.

---

# 43. Story Search

MVP may support limited search fields.

Firestore is not a full-text search engine.

Do not download all Stories to the browser for local search.

---

# 44. Owner Updates

Story owner may modify allowed metadata such as:

```text
title
description
cover
tags
status
updatedAt
```

subject to workflow restrictions.

Owner must not arbitrarily change:

```text
authorId
chapterCount
viewCount
followerCount
createdAt
```

Slug changes require special uniqueness handling.

---

# 45. Slug Changes

Slug changes are not a simple normal field edit.

They require:

```text
reserve new slug
↓
update Story
↓
release old slug
```

Do not implement slug editing without an atomic/trusted strategy.

For MVP, slug may be immutable after creation if the Story feature specification chooses the simpler behavior.

Phase 17 chooses immutable Story slugs. Logical removal retains the reservation so old canonical URLs cannot be reassigned to unrelated content.

---

# 46. Story Removal

Do not automatically physically delete all Story data.

Removal may need to account for:

- Chapters
- Story followers
- Bookmarks
- Comments
- Reports
- Notifications
- Cloudinary cover
- Slug reservation

A dedicated deletion/removal strategy must be followed.

---

# 47. Physical Delete

If permanent deletion is explicitly supported, cleanup may include:

```text
Story document
Chapters subcollection
Followers subcollection
Votes subcollection
Story slug mapping
Cloudinary Story assets
Related application references
```

Firestore does not automatically cascade-delete subcollections when a parent document is deleted.

Do not assume deleting:

```text
stories/{storyId}
```

deletes:

```text
stories/{storyId}/chapters/
```

---

# 48. Cloudinary Cleanup

Story-owned Cloudinary assets live under:

```text
vucdem/stories/{storyId}/
```

Cloudinary deletion must occur through trusted server operations with authorization.

---

# 49. Required Indexes

Likely query/index combinations include:

```text
authorId + status + updatedAt
status + updatedAt
status + followerCount
```

Depending on exact public-status strategy, multiple indexes may be needed.

Canonical definitions belong in:

```text
specs/database/indexes.md
```

---

# 50. Public Read

Public Users may read Stories in publicly accessible statuses such as:

```text
ongoing
completed
hiatus
```

Drafts must not be publicly accessible.

Hidden and removed content must follow moderation rules.

---

# 51. Security Rules

Normal Users may create Stories only as themselves.

Conceptually:

```text
authorId == request.auth.uid
```

Normal Users may update only Stories they own and only permitted fields.

Trusted counters and ownership fields must be protected.

---

# 52. Validation

Canonical validation includes:

- Title length
- Description length
- Tag count
- Slug rules
- Cover constraints
- Publication requirements

Defined under:

```text
specs/implementation/validation.md
```

---

# 53. Source of Truth

Chapter schema:

```text
specs/database/chapters.md
```

Story feature:

```text
specs/features/stories.md
```

Story editor:

```text
specs/features/story-editor.md
```

Story reader:

```text
specs/features/story-reader.md
```

Security:

```text
specs/security/
```

Cloudinary:

```text
specs/architecture/cloudinary-architecture.md
```

Trusted moderation may store `moderatedBy`, `moderatedAt`, and a temporary
`moderationPreviousStatus`. Restoration uses the recorded status so an ongoing, hiatus, or
completed Story is not incorrectly reset. Normal Users cannot write moderation fields.
