# Posts

This document defines the complete product behavior for Posts in vucdem.

---

# 1. Goal

Posts provide standalone horror community content.

Posts are optimized for:

- Feed discovery
- Community participation
- Discussion
- Short and medium-form storytelling
- Real experiences
- Creepypasta
- Paranormal content
- Mysteries
- Image-based content

Posts are separate from Stories.

---

# 2. Canonical Model

```text
Content
├── Post
└── Story
    └── Chapter
```

A Post never contains Chapters.

If the User wants serialized long-form content, they should create a Story.

---

# 3. Firestore Path

```text
posts/{postId}
```

Canonical schema:

```text
specs/database/posts.md
```

---

# 4. Routes

Create content:

```text
/write
```

Post detail:

```text
/post/{id}
```

Post editing may use:

```text
/post/{id}/edit
```

or an equivalent editor flow defined by UI implementation.

The canonical public Post URL remains:

```text
/post/{id}
```

---

# 5. Supported Categories

Categories are administrator-managed documents in `postCategories/{categoryId}`. The initial categories are:

```text
true_story
creepypasta
discussion
paranormal
mystery
psychological_horror
urban_legend
```

UI labels may be localized.

Example:

```text
true_story
→ Chuyện có thật

creepypasta
→ Creepypasta

discussion
→ Thảo luận

paranormal
→ Tâm linh
```

Internal identifiers must remain stable.

---

# 6. Create Post

Authenticated Users may create Posts.

Guests cannot create Posts.

Guest opening:

```text
/write
```

should be redirected to authentication.

---

# 7. Write Page

The `/write` route supports at least two creation modes:

```text
[Bài viết] [Truyện]
```

Selecting:

```text
Bài viết
```

opens the Post creation interface.

Selecting:

```text
Truyện
```

opens the Story creation interface.

---

# 8. Post Editor Fields

The Post editor should support:

```text
Title
Category
Community
Tags
Thumbnail
Images
Content
```

Not every media field must be mandatory.

---

# 9. Title

Post title is required for publication.

The UI should clearly show title validation.

Exact length limits are defined in:

```text
specs/implementation/validation.md
```

---

# 10. Content

Post content is required for normal text Posts.

The editor should support comfortable writing of medium-form content.

The storage format must remain consistent between:

```text
Editor
Firestore
Renderer
```

Do not store unsanitized arbitrary HTML.

If a structured editor such as TipTap/ProseMirror is adopted, update the database specification before changing the canonical content format.

---

# 11. Excerpt

The Post stores an excerpt for Feed rendering.

The User should not normally need to manually write the excerpt.

Preferred behavior:

```text
Post content
     ↓
Generate plain-text excerpt
     ↓
Store excerpt
```

The exact excerpt length belongs in validation/implementation specifications.

---

# 12. Category

A Post must have one supported category before publication.

The editor should use a controlled selection UI.

Do not allow arbitrary category strings. The trusted Post mutation endpoints verify that the selected category document exists and is active.

---

# 13. Tags

Users may attach a limited number of Tags.

Tags should:

- Be normalized
- Have a maximum count
- Have maximum individual length
- Avoid empty values
- Avoid duplicates

While the author types, the editor requests a bounded server-side list of similar tags already used
by public Posts or Stories. Suggestions are accent-insensitive, ranked by textual relevance and
usage frequency, and may be clicked to add the normalized tag. The browser never downloads entire
content collections.

Exact limits:

```text
specs/implementation/validation.md
```

---

# 14. Community

A Post may optionally belong to a Community.

Field:

```text
communityId
```

If a Community is selected:

- Community must exist
- User must have permission to publish there
- Community state must permit posting

Category and Community remain independent.

---

# 15. Thumbnail

A Post may have a primary thumbnail.

Storage:

```text
Cloudinary
```

Canonical folder:

```text
vucdem/posts/{postId}/
```

Typical public ID:

```text
vucdem/posts/{postId}/cover
```

Firestore stores:

```text
url
publicId
```

---

# 16. Post Images

Posts may contain a limited number of images.

Images are stored in Cloudinary.

Example paths:

```text
vucdem/posts/{postId}/image-1
vucdem/posts/{postId}/image-2
```

Maximum image count and size are defined by validation specifications.

---

# 17. Media Upload Flow

Preferred flow:

```text
Generate Post ID
      ↓
Request signed upload parameters
      ↓
Upload directly to Cloudinary
      ↓
Receive url + publicId
      ↓
Save Post document
```

Do not proxy ordinary image bytes through the SvelteKit server.

---

# 18. Draft

Users may save unfinished Posts as:

```text
status = "draft"
```

Drafts:

- Do not appear in public Feed
- Are not publicly readable
- Are accessible to their owner
- May have less strict validation than published Posts

---

# 19. Publish

Publication transition:

```text
draft
→ published
```

Before publication, validate all required public fields.

First publication sets:

```text
publishedAt
```

---

# 20. Direct Publication

The implementation may allow Users to create a Post directly as published without first explicitly saving a Draft.

Conceptually, publication validation must still occur.

---

# 21. Post Creation Defaults

New Post:

```text
authorId = current UID

voteScore = 0
commentCount = 0
viewCount = 0

createdAt = trusted timestamp
updatedAt = trusted timestamp
```

For Draft:

```text
status = draft
publishedAt = null
```

For immediate publication:

```text
status = published
publishedAt = trusted timestamp
```

---

# 22. Ownership

Post ownership is determined by:

```text
post.authorId == currentUser.uid
```

Do not determine ownership using:

```text
authorUsername
authorName
```

---

# 23. Edit Post

Post owners may edit their Posts.

Editable fields may include:

```text
title
content
excerpt
category
tags
communityId
thumbnail
images
```

Editing updates:

```text
updatedAt
```

---

# 24. Protected Fields

Normal Post owners must not arbitrarily modify:

```text
authorId
voteScore
commentCount
viewCount
createdAt
```

`publishedAt` also must not be freely rewritten.

Moderation state fields require their own permission rules.

---

# 25. Editing Published Posts

Published Posts may be edited.

Editing should not reset:

```text
createdAt
publishedAt
```

The UI may display:

```text
Đã chỉnh sửa
```

when:

```text
updatedAt > publishedAt
```

if desired by UI specification.

---

# 26. Changing Community

If an owner changes:

```text
communityId
```

the new Community must still exist and allow the User to publish.

Do not permit moving Posts into Communities where the User lacks posting permission.

---

# 27. Post Detail

Canonical route:

```text
/post/{id}
```

The page should display:

- Author
- Avatar
- Username
- Publication time
- Community
- Category
- Title
- Full content
- Images
- Tags
- Vote score
- View count
- Bookmark state
- Comments

---

# 28. Post Not Found

If the Post document does not exist:

Render:

```text
404 / Post not found
```

Do not expose internal Firestore errors.

---

# 29. Draft Access

If a Guest or unrelated User opens another User's Draft:

The content must not be returned.

Behavior should appear as:

```text
Not found
```

or:

```text
Unauthorized
```

according to the security/UI policy.

Do not leak Draft content through page metadata.

---

# 30. Hidden Content

Hidden Posts must not appear in normal public Feed queries.

Authorized moderation surfaces may still access them.

Owner visibility of moderation-hidden Posts is defined by moderation specifications.

---

# 31. Removed Content

Removed Posts must not appear in normal Feed discovery.

The application may display a removal placeholder in contexts where preserving discussion structure is useful.

Exact behavior is defined by moderation specifications.

---

# 32. Voting

Posts support voting.

Canonical values:

```text
+1
-1
```

Votes are stored under:

```text
posts/{postId}/votes/{uid}
```

Aggregate:

```text
voteScore
```

Voting behavior is defined in:

```text
specs/features/voting.md
```

---

# 33. Vote UI

Post detail should show:

```text
Heart
Heart count
```

Active heart state must be visually distinguishable.

Do not rely exclusively on color for accessibility.

---

# 34. Comments

Posts support Comments.

Comments are stored in:

```text
comments/{commentId}
```

with:

```text
contentType = "post"
contentId = postId
```

Do not embed Comments inside the Post document.

---

# 35. Comment Count

Post contains:

```text
commentCount
```

This is a denormalized trusted counter.

Do not load all Comments just to determine the number shown in the Feed.

---

# 36. Bookmark

Authenticated Users may bookmark a Post.

Canonical relationship:

```text
users/{uid}/bookmarks/{bookmarkId}
```

Bookmarks are private.

Guest attempting Bookmark:

```text
→ authentication required
```

---

# 37. View Count

Opening a Post detail may qualify as a View according to the view-count policy.

Do not increment:

```text
viewCount
```

simply because a Post Card appeared in the Feed.

---

# 38. View Abuse

The implementation should avoid counting every refresh as unlimited unique engagement.

MVP uses `POST /api/views` as the trusted increment boundary. A Post detail view is counted at most
once per browser per Post during a one-hour HTTP-only cookie window. Feed impressions and views by
the Post owner do not increment the counter.

Do not allow arbitrary:

```text
update viewCount = any number
```

from the client.

---

# 39. Author Navigation

Clicking author information opens:

```text
/u/{username}
```

Authorization and ownership still use:

```text
authorId
```

---

# 40. Community Navigation

If:

```text
communityId != null
```

the Post may display Community information.

Clicking it opens:

```text
/c/{slug}
```

The UI may need Community metadata from an existing cache/query or denormalized representation defined later.

Avoid unnecessary repeated reads.

---

# 41. Tags

Clicking a Tag opens its canonical discovery page.

Example:

```text
/tag/bi-an
```

`/tag/[slug]` combines published Posts and public Stories carrying the exact normalized tag.

Clicking a Post Category opens `/category/[slug]`, which lists only published Posts assigned to
that administrator-managed category.

---

# 42. Sharing

Public Posts should have stable shareable URLs:

```text
/post/{id}
```

A Share action may use the browser's native sharing API when available or copy the canonical URL.

Sharing does not require authentication.

---

# 43. Delete Post

Owner may request deletion/removal according to product policy.

Do not immediately implement uncontrolled physical deletion.

Potential flow:

```text
Owner
 ↓
Delete Post
 ↓
Confirmation
 ↓
Authorized removal
 ↓
Post no longer publicly discoverable
```

---

# 44. Delete Confirmation

Destructive actions must require clear confirmation.

The UI should identify what will happen.

Do not place permanent destructive actions behind accidental single clicks.

---

# 45. Physical Deletion

If permanent deletion is implemented, remember that Firestore does not cascade-delete subcollections.

Potential related resources include:

```text
posts/{postId}
posts/{postId}/votes/*
comments referencing postId
bookmarks referencing postId
reports referencing postId
notifications referencing postId
Cloudinary assets
```

A dedicated cleanup workflow is required.

---

# 46. Cloudinary Asset Replacement

When replacing a Post image:

```text
Upload new image
      ↓
Cloudinary success
      ↓
Update Firestore
      ↓
Delete old Cloudinary asset
```

Prefer this ordering over deleting the old image first.

---

# 47. Upload Failure

If media upload fails:

- Do not publish a broken asset reference
- Keep editor content where possible
- Allow retry
- Show understandable error feedback

---

# 48. Firestore Failure After Upload

Possible failure:

```text
Cloudinary upload succeeds
Firestore Post creation fails
```

The application should avoid leaving unnecessary permanent orphaned assets where practical.

MVP may provide retry/cleanup behavior.

---

# 49. Post Query: Newest

```text
where status == "published"
orderBy createdAt DESC
limit 20
```

---

# 50. Post Query: Popular

```text
where status == "published"
orderBy voteScore DESC
limit 20
```

---

# 51. Post Query: Most Viewed

```text
where status == "published"
orderBy viewCount DESC
limit 20
```

---

# 52. Posts by Category

```text
where status == "published"
where category == category
orderBy createdAt DESC
limit 20
```

---

# 53. Posts by Community

```text
where status == "published"
where communityId == communityId
orderBy createdAt DESC
limit 20
```

---

# 54. Posts by Author

Public profile:

```text
where authorId == uid
where status == "published"
orderBy createdAt DESC
```

Owner management view may additionally access Drafts.

---

# 55. Pagination

All large Post lists use Firestore cursors.

Example:

```text
first query
→ lastDocument

next query
→ startAfter(lastDocument)
```

Changing sort/filter resets the cursor.

---

# 56. Firestore Indexes

Likely indexes include:

```text
status + createdAt
status + voteScore
status + viewCount

category + status + createdAt

communityId + status + createdAt

authorId + status + createdAt
```

Canonical index definitions:

```text
specs/database/indexes.md
```

---

# 57. Loading State

Post detail must provide a loading state while the Post is being resolved.

Avoid flashing:

```text
Post not found
```

before the request finishes.

---

# 58. Error State

Errors should distinguish where useful between:

```text
Network error
Not found
Unauthorized
Unexpected error
```

Do not expose raw backend stack traces or Firebase error objects.

---

# 59. Editor Loading State

During Post publication:

- Disable duplicate Publish actions
- Show progress
- Preserve editor content
- Handle media upload state separately where useful

---

# 60. Unsaved Changes

If the User has meaningful unsaved Post content and attempts to leave the editor, the application should warn them where practical.

Do not interrupt navigation when the editor is effectively empty.

---

# 61. Responsive Behavior

Post creation and Post detail must work on mobile.

Desktop may use:

- Wide content area
- Side metadata
- Larger media

Mobile should prioritize:

- Title
- Author
- Content
- Media
- Actions
- Comments

Avoid horizontal overflow.

---

# 62. Typography

Post titles should follow the horror editorial typography defined in:

```text
specs/ui/typography.md
```

Long body text must prioritize readability over decorative horror styling.

---

# 63. Accessibility

Required considerations:

- Semantic headings
- Keyboard-accessible actions
- Accessible labels for icon buttons
- Image alt text
- Sufficient contrast
- Visible focus state

---

# 64. Validation

Publication validation must include appropriate checks for:

```text
title
content
category
tags
community
thumbnail
images
```

Canonical limits:

```text
specs/implementation/validation.md
```

---

# 65. Security

Users may create Posts only as themselves.

Conceptually:

```text
authorId == request.auth.uid
```

Users may edit only Posts they own unless they have explicit moderation permission.

Trusted counters must be protected.

Security Rules are defined under:

```text
specs/security/
```

---

# 66. Acceptance Criteria

The Posts feature is MVP-complete when:

- Authenticated User can create a Post
- Guest cannot create a Post
- Post can be saved as Draft
- Draft does not appear publicly
- Post can be published
- Publication validates required fields
- Published Post appears in relevant Feed
- Post detail renders full content
- Post owner can edit allowed fields
- Ownership fields cannot be arbitrarily changed
- Post supports Cloudinary media
- Post supports Tags
- Post supports Category
- Post may belong to a Community
- Voting integrates correctly
- Comments integrate correctly
- Bookmarking integrates correctly
- View count follows trusted update rules
- Loading states exist
- Empty/error states exist where appropriate
- Firestore queries use pagination
- Required indexes are documented
- Mobile layout is usable
- Security Rules enforce ownership

---

# 67. Out of Scope

Unless explicitly added later:

- Scheduled Post publishing
- Paid Posts
- Subscriber-only Posts
- Collaborative Posts
- Anonymous posting
- Video hosting
- Audio hosting
- AI-generated Posts
- Complex revision history
- Full version control for Post edits

---

# 68. Related Specifications

Database:

```text
specs/database/posts.md
```

Feed:

```text
specs/features/home-feed.md
```

Comments:

```text
specs/features/comments.md
```

Voting:

```text
specs/features/voting.md
```

Bookmarks:

```text
specs/features/bookmarks.md
```

Cloudinary:

```text
specs/architecture/cloudinary-architecture.md
```

Security:

```text
specs/security/
```

UI:

```text
specs/ui/screens/post-detail.md
specs/ui/screens/write-post.md
```
