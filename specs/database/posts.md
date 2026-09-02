# Posts

This document defines the canonical Firestore schema for vucdem Posts.

A Post is standalone community content.

---

# 1. Firestore Path

```text
posts/{postId}
```

---

# 2. Content Model

A Post may represent:

- True horror story
- Creepypasta
- Paranormal experience
- Mystery
- Psychological horror
- Urban legend
- Discussion
- Other supported standalone horror content

A Post does not contain Chapters.

---

# 3. TypeScript Model

```typescript
type PostCategory =
	| 'true_story'
	| 'creepypasta'
	| 'discussion'
	| 'paranormal'
	| 'mystery'
	| 'psychological_horror'
	| 'urban_legend';

type PostStatus = 'draft' | 'published' | 'hidden' | 'removed';

type CloudinaryAsset = {
	url: string;
	publicId: string;
};

type Post = {
	id: string;

	authorId: string;
	authorName: string;
	authorUsername: string;
	authorAvatarUrl: string | null;

	title: string;
	content: string;
	excerpt: string;

	category: PostCategory;
	tags: string[];

	communityId: string | null;

	thumbnail: CloudinaryAsset | null;
	images: CloudinaryAsset[];

	voteScore: number;
	commentCount: number;
	viewCount: number;

	status: PostStatus;

	createdAt: Timestamp;
	updatedAt: Timestamp;
	publishedAt: Timestamp | null;
};
```

`id` is normally derived from the Firestore document ID.

---

# 4. Example Document

```json
{
	"authorId": "user123",
	"authorName": "Black Raven",
	"authorUsername": "blackraven",
	"authorAvatarUrl": "https://res.cloudinary.com/example/image/upload/vucdem/avatars/user123/avatar.webp",

	"title": "Kẻ gõ cửa lúc nửa đêm",

	"content": "Nội dung bài viết...",

	"excerpt": "Ba tiếng gõ cửa vang lên đúng lúc 3 giờ sáng...",

	"category": "creepypasta",

	"tags": ["bí ẩn", "nửa đêm"],

	"communityId": "tam-linh",

	"thumbnail": {
		"url": "https://res.cloudinary.com/example/image/upload/vucdem/posts/post123/cover.webp",
		"publicId": "vucdem/posts/post123/cover"
	},

	"images": [
		{
			"url": "https://res.cloudinary.com/example/image/upload/vucdem/posts/post123/image-1.webp",
			"publicId": "vucdem/posts/post123/image-1"
		}
	],

	"voteScore": 604,
	"commentCount": 231,
	"viewCount": 5300,

	"status": "published",

	"createdAt": "Timestamp",
	"updatedAt": "Timestamp",
	"publishedAt": "Timestamp"
}
```

---

# 5. authorId

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

Represents ownership of the Post.

Must not be changed after creation by normal Users.

---

# 6. authorName

Type:

```text
string
```

Required:

```text
Yes
```

Denormalized display name snapshot.

Used to avoid requiring an additional User read for every Feed item.

Canonical author identity remains `authorId`.

---

# 7. authorUsername

Type:

```text
string
```

Required:

```text
Yes
```

Denormalized public username snapshot.

Used for:

- Feed rendering
- Profile links

Do not use this field for authorization.

---

# 8. authorAvatarUrl

Type:

```text
string | null
```

Required:

```text
Yes
```

Denormalized avatar URL.

This field intentionally stores only the URL because the Post does not own the User avatar Cloudinary asset.

The Post must not delete the User's avatar using this reference.

---

# 9. title

Type:

```text
string
```

Required:

```text
Yes
```

Contains the Post title.

Validation limits are defined under:

```text
specs/implementation/validation.md
```

---

# 10. content

Type:

```text
string
```

Required:

```text
Yes
```

Contains the canonical Post body.

The exact rich-text storage format must be consistent across the editor and renderer.

If the implementation later adopts structured editor JSON instead of plain text/string content, this specification must be updated before migration.

Do not store arbitrary unsanitized HTML without an explicit sanitization strategy.

---

# 11. excerpt

Type:

```text
string
```

Required:

```text
Yes
```

Short preview displayed on Feed cards.

The excerpt may be:

- Generated from content
- Generated during Post creation
- Stored explicitly

It should not require downloading/rendering the entire body just to display a Feed card.

---

# 12. category

Type:

```text
PostCategory
```

Required:

```text
Yes
```

Allowed values:

```text
true_story
creepypasta
discussion
paranormal
mystery
psychological_horror
urban_legend
```

Do not introduce ad-hoc category strings in components.

---

# 13. tags

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

Tags are bounded.

Maximum tags are defined in:

```text
specs/implementation/validation.md
```

Do not use tags as an unbounded relationship.

---

# 14. communityId

Type:

```text
string | null
```

Required:

```text
Yes
```

Default:

```text
null
```

If set, references:

```text
communities/{communityId}
```

Category and Community are separate concepts.

---

# 15. thumbnail

Type:

```text
CloudinaryAsset | null
```

Required:

```text
Yes
```

Default:

```text
null
```

Represents the primary Feed/detail image for the Post.

Cloudinary folder:

```text
vucdem/posts/{postId}/
```

Typical public ID:

```text
vucdem/posts/{postId}/cover
```

---

# 16. images

Type:

```text
CloudinaryAsset[]
```

Required:

```text
Yes
```

Default:

```text
[]
```

Unlike follower/comment lists, this array is acceptable because the number of images per Post has a strict small upper bound.

The maximum is defined in validation specifications.

---

# 17. voteScore

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

Trusted denormalized score.

Conceptually:

```text
upvotes - downvotes
```

Do not compute this by reading every Vote whenever a Post is rendered.

Normal clients must not arbitrarily overwrite it.

---

# 18. commentCount

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

Must remain greater than or equal to zero.

---

# 19. viewCount

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

Do not increment this through an unrestricted arbitrary client update.

View counting behavior is defined in the relevant feature specification.

---

# 20. status

Type:

```text
'draft' | 'published' | 'hidden' | 'removed'
```

Required:

```text
Yes
```

---

## draft

Visible only to its owner and authorized moderation/admin systems where applicable.

Must not appear in public Feed queries.

---

## published

Available publicly according to normal access rules.

---

## hidden

Hidden from normal public access/discovery.

Usually caused by moderation or controlled state change.

---

## removed

Removed content.

The document may remain for moderation/reference integrity.

---

# 21. createdAt

Type:

```text
Firestore Timestamp
```

Required:

```text
Yes
```

Immutable after creation.

Must use trusted creation time.

---

# 22. updatedAt

Type:

```text
Firestore Timestamp
```

Required:

```text
Yes
```

Updated when meaningful editable Post content changes.

---

# 23. publishedAt

Type:

```text
Firestore Timestamp | null
```

Required:

```text
Yes
```

Default for draft:

```text
null
```

When first published:

```text
publishedAt = trusted server timestamp
```

Editing a published Post should not normally reset `publishedAt`.

---

# 24. Votes Subcollection

Canonical path:

```text
posts/{postId}/votes/{uid}
```

Vote document ID:

```text
uid
```

Example:

```json
{
	"value": 1,
	"createdAt": "Timestamp",
	"updatedAt": "Timestamp"
}
```

Allowed values:

```text
1
-1
```

No vote should normally be represented by deleting the Vote document.

---

# 25. Vote Invariant

A User can have at most one Vote document per Post because the document ID is their UID.

This prevents multiple Vote documents from the same User on the same Post.

---

# 26. Comments

Comments are not embedded inside Posts.

Comments reference Posts from the root:

```text
comments/{commentId}
```

Example conceptual relation:

```text
contentType = "post"
contentId = postId
```

---

# 27. Post Creation

Normal creation flow:

```text
Authenticated User
    ↓
Generate Post ID
    ↓
Upload optional Cloudinary assets
    ↓
Create Post
```

Initial trusted values should include:

```text
authorId = current UID
voteScore = 0
commentCount = 0
viewCount = 0
createdAt = trusted timestamp
```

Normal Users must not choose another `authorId`.

---

# 28. Draft Creation

Draft Posts may contain incomplete publishing information according to editor behavior.

However, Firestore schema and validation must still maintain valid types.

Draft validation may be less strict than publication validation.

---

# 29. Publication

Transition:

```text
draft
→ published
```

requires publication validation.

A published Post must satisfy all required public-content constraints.

---

# 30. Update Permissions

Owner may modify permitted fields such as:

```text
title
content
excerpt
category
tags
communityId
thumbnail
images
updatedAt
```

subject to feature rules.

Owner must not arbitrarily modify:

```text
authorId
voteScore
commentCount
viewCount
createdAt
```

Moderation state changes may require different permissions.

---

# 31. Delete Behavior

Do not assume direct physical deletion.

Possible owner action may transition:

```text
published
→ removed
```

or use a dedicated deletion workflow.

Deletion must account for:

- Comments
- Votes
- Reports
- Notifications
- Cloudinary assets
- Counters

Do not implement automatic recursive deletion without a specification.

---

# 32. Cloudinary Cleanup

If a Post is physically deleted, its owned assets may need deletion from:

```text
vucdem/posts/{postId}/
```

Deletion must use trusted server-side Cloudinary operations.

Do not delete assets merely from a client-provided `publicId` without verifying Post ownership.

---

# 33. Feed Query: Newest

Conceptual query:

```text
posts
where status == "published"
orderBy createdAt DESC
limit 20
```

Pagination:

```text
startAfter(lastDocument)
```

---

# 34. Feed Query: Popular

Conceptual query:

```text
posts
where status == "published"
orderBy voteScore DESC
limit 20
```

Required index must be documented.

---

# 35. Community Feed

Conceptual query:

```text
posts
where communityId == targetCommunity
where status == "published"
orderBy createdAt DESC
limit 20
```

---

# 36. Category Feed

Conceptual query:

```text
posts
where category == targetCategory
where status == "published"
orderBy createdAt DESC
limit 20
```

---

# 37. Author Posts

Conceptual query:

```text
posts
where authorId == uid
where status == "published"
orderBy createdAt DESC
```

Owner management views may additionally query drafts if Security Rules permit.

---

# 38. Tag Queries

Firestore may support limited tag discovery using:

```text
array-contains
```

Example:

```text
where tags array-contains "bí ẩn"
```

Do not mistake this for full-text search.

---

# 39. Required Indexes

Likely composite indexes include combinations such as:

```text
status + createdAt
status + voteScore
status + viewCount
communityId + status + createdAt
category + status + createdAt
authorId + status + createdAt
```

Canonical indexes are defined in:

```text
specs/database/indexes.md
```

---

# 40. Security

Public list/read access should normally require:

```text
status == "published"
```

Owners may access their own drafts.

Moderator/Admin permissions are defined separately.

Firestore Security Rules must prevent arbitrary trusted-field mutation.

---

# 41. Validation

Validation rules include:

- Title length
- Content limits
- Tag count
- Tag format
- Image count
- Image type
- Image size
- Category validity

Canonical validation is defined in:

```text
specs/implementation/validation.md
```

---

# 42. Source of Truth

Feature behavior:

```text
specs/features/posts.md
specs/features/home-feed.md
specs/features/voting.md
specs/features/comments.md
```

Permissions:

```text
specs/security/
```

Cloudinary:

```text
specs/architecture/cloudinary-architecture.md
```

For the MVP editor, `content` is stored as trimmed plain text. Rendering uses
text content with preserved line breaks; arbitrary HTML is neither accepted nor
stored. A structured rich-text schema requires a future explicit specification
change.

Trusted moderation may store `moderatedBy`, `moderatedAt`, and a temporary
`moderationPreviousStatus`. The temporary field preserves the pre-moderation state and is
deleted when content is restored; normal Users cannot write moderation fields.
