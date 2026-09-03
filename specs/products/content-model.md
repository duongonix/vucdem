# Content Model

This document defines the canonical content model for vucdem.

---

# 1. Overview

vucdem supports two primary content types:

```text
Content
├── Post
└── Story
    └── Chapter
```

Post and Story serve different product purposes and must remain separate domain models.

---

# 2. Post

A Post is standalone community content.

A Post is primarily designed for:

- Feed discovery
- Community interaction
- Short and medium-form content
- Discussions
- User experiences
- Images
- Creepypasta
- Mysteries

A Post does not contain Chapters.

Canonical Firestore collection:

```text
posts/
```

Canonical document path:

```text
posts/{postId}
```

Canonical route:

```text
/post/{id}
```

---

# 3. Post Categories

Post category identifiers are stable document IDs managed in `postCategories`. The initial taxonomy is:

```text
true_story
creepypasta
discussion
paranormal
mystery
psychological_horror
urban_legend
```

Additional categories are created by an Admin through the taxonomy manager, not introduced ad hoc in UI code.

When adding a new category, update the relevant product and database specifications.

---

# 4. Post Structure

Conceptually:

```text
Post
├── Identity
├── Author
├── Content
│   ├── Title
│   ├── Body
│   ├── Excerpt
│   ├── Category
│   └── Tags
├── Media
│   ├── Thumbnail
│   └── Images
├── Community
├── Engagement
│   ├── Votes
│   ├── Comments
│   └── Views
└── Publication State
```

The exact Firestore fields are defined in:

```text
specs/database/posts.md
```

---

# 5. Story

A Story is long-form content. It may be a serialized multi-Chapter work (`serial`) or a complete
single-part work (`short`). Both retain the Story domain model and dedicated reader.

A Story is primarily designed for:

- Long-form horror fiction
- Multi-part stories
- Serialized publishing
- Dedicated reading experience
- Author-following behavior

Canonical Firestore collection:

```text
stories/
```

Canonical document path:

```text
stories/{storyId}
```

Canonical route:

```text
/story/{slug}
```

---

# 6. Story Structure

Conceptually:

```text
Story
├── Identity
├── Author
├── Metadata
│   ├── Title
│   ├── Description
│   ├── Cover
│   └── Tags
├── Publication
│   └── Status
├── Engagement
│   ├── Views
│   └── Followers
└── Chapters
    ├── Chapter 1
    ├── Chapter 2
    └── ...
```

The Story document stores Story-level metadata.

Large Chapter content must not be embedded directly inside the Story document.

---

# 7. Chapter

A Chapter belongs to exactly one Story.

Canonical path:

```text
stories/{storyId}/chapters/{chapterId}
```

Conceptually:

```text
Chapter
├── Number
├── Title
├── Content
├── Word Count
├── Publication State
├── Created Time
└── Updated Time
```

Canonical reader route:

```text
/story/{slug}/{chapter}
```

The exact URL representation of `{chapter}` is defined by the routing specification.

---

# 8. Post vs Story

Post and Story must not be treated as interchangeable.

| Property              | Post                   | Story                |
| --------------------- | ---------------------- | -------------------- |
| Standalone            | Yes                    | No                   |
| Chapters              | No                     | Yes                  |
| Feed-oriented         | Yes                    | Secondary            |
| Long-form reader      | No                     | Yes                  |
| Community discussion  | Primary                | Secondary            |
| Cover image           | Optional thumbnail     | Yes/Optional by spec |
| Serialized publishing | No                     | Yes                  |
| Follow content        | Not required initially | Yes                  |

A long Post should not automatically become a Story.

A Story remains a Story even when it currently contains only one Chapter.

---

# 9. Community Relationship

A Post may belong to a Community.

Conceptually:

```text
Community
    │
    └── Post
```

A Community is not a Category.

Example:

```text
Post category:
paranormal

Community:
tam-linh
```

The same category may appear in multiple Communities.

Story-to-Community relationships are not assumed unless explicitly defined by the Story or Community feature specifications.

---

# 10. Tags

Posts and Stories may contain Tags.

Tags provide lightweight classification.

Examples:

```text
ma
bệnh viện
chung cư
rừng
mất tích
đô thị
```

Tags:

- Do not have members
- Do not have moderators
- Are not Communities
- Are not primary permission boundaries

---

# 11. Comments

Comments are interaction content.

Comments may target supported content types.

Conceptually:

```text
Post
└── Comments

Story
└── Comments
```

The exact supported targets are defined in:

```text
specs/features/comments.md
specs/database/comments.md
```

Replies are represented as Comments referencing another Comment.

---

# 12. Comment Tree

Conceptually:

```text
Comment A
├── Reply A1
│   ├── Reply A1.1
│   └── Reply A1.2
└── Reply A2
```

The data model may support deeper nesting.

The UI should normally limit visible nesting depth to maintain readability.

The initial target is approximately:

```text
2–3 visible indentation levels
```

Deeper replies may be visually flattened.

---

# 13. Voting

Supported content may receive votes.

Canonical vote values:

```text
1
-1
```

Conceptually:

```text
No heart
   │
   └── Heart → +1
```

A User can have at most one active heart per target.

Vote state transitions are defined in:

```text
specs/features/voting.md
```

---

# 14. Vote Score

Content may contain a denormalized:

```text
voteScore
```

Conceptually:

```text
voteScore = total upvotes - total downvotes
```

Do not query every Vote document just to render a Feed card.

The aggregate score exists to make feed queries efficient.

---

# 15. Bookmark

Users may privately save supported content.

Conceptually:

```text
User
└── Bookmarks
    ├── Post
    └── Story
```

Bookmarks are private by default.

Bookmark does not mean Follow.

---

# 16. Following Users

A User may follow another User.

Conceptually:

```text
User A
    │
    └── follows
            │
            ▼
          User B
```

This relationship can later support a Following Feed.

---

# 17. Following Stories

Users may follow Stories.

Story Follow means:

```text
I want updates about this Story.
```

Bookmark means:

```text
I want to save this Story.
```

Following the Author means:

```text
I want updates from this User.
```

These are three separate concepts.

---

# 18. Feed

Feed is a query-driven representation of Posts.

Feed is not a Firestore document type.

Example:

```text
posts/
    │
    ├── query newest
    ├── query popular
    ├── query category
    └── query community
            │
            ▼
           Feed
```

Do not create:

```text
feed/
```

documents merely to represent the normal home feed unless a future architecture explicitly requires precomputed feeds.

---

# 19. Content Status

Content may have lifecycle states.

Typical states include:

```text
draft
published
hidden
removed
```

Meaning:

### draft

Content is unfinished and not publicly visible.

### published

Content is publicly available according to visibility rules.

### hidden

Content has been hidden from normal public discovery.

### removed

Content has been removed through moderation or platform action.

Exact allowed states may differ by content type and are defined in the corresponding database specification.

---

# 20. Physical Delete vs Logical Removal

Deleting content from the user experience does not always require immediately deleting the Firestore document.

Possible approaches include:

```text
published
    ↓
hidden
    ↓
removed
```

Physical deletion may be used when appropriate.

The exact strategy must consider:

- Comments
- Reports
- Moderation history
- Cloudinary assets
- References
- Counters

Do not implement destructive cascading deletion without a specification.

---

# 21. Media

Firestore documents contain media references.

Actual image files live in Cloudinary.

Canonical asset representation:

```json
{
	"url": "https://res.cloudinary.com/...",
	"publicId": "vucdem/posts/example/image-1"
}
```

Do not store:

- Base64 images
- Image binary data
- Large media blobs

inside Firestore documents.

---

# 22. Author Denormalization

Feed-heavy documents may contain denormalized author display information.

Example:

```text
authorId
authorName
authorAvatarUrl
```

The canonical identity remains:

```text
authorId
```

Denormalized author fields exist to reduce additional reads in high-frequency surfaces such as Feed cards.

The exact synchronization strategy is defined in database/implementation specifications.

---

# 23. Counters

Content documents may contain denormalized counters such as:

```text
voteScore
commentCount
viewCount
followerCount
chapterCount
```

Counters exist for:

- Efficient rendering
- Sorting
- Ranking
- Reducing Firestore reads

Clients must not be trusted to set arbitrary counter values.

---

# 24. Slugs

Stories use human-readable slugs.

Example:

```text
Title:
Căn phòng ở tầng 13

Slug:
can-phong-o-tang-13
```

Result:

```text
/story/can-phong-o-tang-13
```

Slug uniqueness must be guaranteed according to the database specification.

Do not assume Firestore automatically guarantees uniqueness across documents.

---

# 25. User Profile Content

User profiles may display public content created by the User.

Conceptually:

```text
User Profile
├── Posts
├── Stories
└── Public activity defined by feature specs
```

Bookmarks must not be public by default.

Private relationship or account data must not be exposed simply because the profile itself is public.

---

# 26. Notifications

Notifications are derived from activity.

Examples:

```text
User comments on Post
        ↓
Post author receives notification
```

```text
User follows Author
        ↓
Author receives notification
```

```text
Story publishes Chapter
        ↓
Story followers may receive notification
```

Notifications are not the canonical source of the underlying event.

Deleting a Notification must not delete the original Comment, Follow, Story, or Vote.

---

# 27. Reports

Reports reference content or supported moderation targets.

Conceptually:

```text
User
    ↓
Report
    ↓
Target
```

Possible targets may include:

- Post
- Story
- Comment
- User

The exact target model is defined in:

```text
specs/database/reports.md
specs/features/reports.md
```

---

# 28. Search Model

Search is a discovery feature, not a primary content model.

Search may return:

```text
Posts
Stories
Users
Communities
```

MVP search capabilities are intentionally limited by Firestore.

Do not redesign the content model solely to emulate a full-text search engine.

---

# 29. Canonical Relationships

High-level relationships:

```text
User
├── creates ──────────────── Post
├── creates ──────────────── Story
│                              │
│                              └── contains ── Chapter
│
├── comments on ──────────── Content
├── votes on ─────────────── Content
├── bookmarks ────────────── Post / Story
├── follows ──────────────── User
├── follows ──────────────── Story
└── submits ──────────────── Report


Community
└── contains ─────────────── Posts
```

---

# 30. Firestore Mapping

High-level Firestore structure:

```text
users/
├── {uid}/
│   ├── followers/
│   ├── following/
│   └── bookmarks/

posts/
├── {postId}/
│   └── votes/

stories/
├── {storyId}/
│   ├── chapters/
│   └── votes/

comments/
├── {commentId}/
│   └── votes/

communities/

notifications/

reports/
```

Exact document fields are defined under:

```text
specs/database/
```

---

# 31. Model Design Principles

The content model should optimize for:

- Clear ownership
- Efficient Firestore queries
- Feed performance
- Simple authorization
- Predictable relationships
- Minimal unnecessary reads
- Scalable high-cardinality relationships

Avoid:

- Giant documents
- Unbounded arrays
- Embedding every Comment inside a Post
- Embedding every Chapter inside a Story
- Embedding every Follower inside a User
- Embedding every Vote inside content documents

Use subcollections or dedicated collections for unbounded relationships.

---

# 32. Source of Truth

This document defines domain relationships.

Exact storage schemas are defined under:

```text
specs/database/
```

Exact feature behavior is defined under:

```text
specs/features/
```

Exact permissions are defined under:

```text
specs/security/
```

When implementation requires a content relationship not defined by these specifications, update the specification before implementing it.
