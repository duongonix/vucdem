# Terminology

This document defines the canonical terminology used throughout vucdem.

Developers and coding agents should use these terms consistently.

---

# 1. User

A User is an authenticated account.

A User may:

- Publish content
- Vote
- Comment
- Bookmark
- Follow
- Report content
- Join communities

A Firebase Authentication UID is the canonical identity of a User.

Example:

```text
uid = Firebase Authentication UID
```

User profile data is stored in:

```text
users/{uid}
```

---

# 2. Guest

A Guest is a visitor who is not authenticated.

Guests may read public published content.

Guests cannot perform authenticated interactions such as:

- Voting
- Commenting
- Publishing
- Bookmarking
- Following
- Reporting

---

# 3. Post

A Post is standalone community content.

Examples:

- Real horror experience
- Creepypasta
- Paranormal experience
- Discussion
- Mystery
- Strange image
- Urban legend

A Post does not contain Chapters.

Canonical Firestore path:

```text
posts/{postId}
```

---

# 4. Story

A Story is long-form serialized content.

A Story contains Chapters.

Example:

```text
Story
├── Chapter 1
├── Chapter 2
└── Chapter 3
```

Canonical Firestore path:

```text
stories/{storyId}
```

---

# 5. Chapter

A Chapter is one part of a Story.

A Chapter cannot exist independently from its Story.

Canonical Firestore path:

```text
stories/{storyId}/chapters/{chapterId}
```

---

# 6. Content

Content is a general conceptual term.

Primary content types are:

```text
Content
├── Post
└── Story
```

Chapter is subordinate content belonging to a Story.

Do not create a generic `contents` Firestore collection unless explicitly specified in the future.

---

# 7. Author

An Author is a User who created a Post or Story.

`authorId` refers to the Firebase UID of the creator.

Author is a relationship, not a separate user role.

A normal User may become an Author simply by publishing content.

---

# 8. Reader

Reader describes a user behavior, not a permission role.

A Reader primarily consumes content.

Both Guests and authenticated Users may be Readers.

---

# 9. Community

A Community is a topic-based space containing related content and members.

Examples:

```text
Tâm linh
Creepypasta
Chuyện có thật
Bí ẩn
```

Canonical URL:

```text
/c/{slug}
```

Canonical Firestore path:

```text
communities/{communityId}
```

---

# 10. Category

A Category classifies a Post by content type.

Examples:

```text
true_story
creepypasta
discussion
paranormal
mystery
psychological_horror
urban_legend
```

Category and Community are different concepts.

Example:

```text
Category:
creepypasta

Community:
Vietnamese Horror
```

A Category describes what the content is.

A Community describes where the content belongs socially.

---

# 11. Tag

A Tag is lightweight metadata used for discovery and classification.

Examples:

```text
ma
bệnh viện
rừng
chung cư
đô thị
mất tích
```

Tags are not Communities.

Tags do not have members or moderators.

---

# 12. Vote

A Vote represents a user's reaction to supported content.

Possible values:

```text
1  = upvote
-1 = downvote
```

No vote is represented by the absence of the user's vote document.

Vote documents must be unique per user per target.

---

# 13. Vote Score

Vote Score is the aggregate score of voting.

Conceptually:

```text
voteScore = upvotes - downvotes
```

`voteScore` is a denormalized counter.

Clients must not be allowed to set arbitrary vote scores.

---

# 14. Comment

A Comment is a user response attached to content.

Comments may support replies.

Canonical collection:

```text
comments/
```

A Comment references its target using fields defined by the database specification.

---

# 15. Reply

A Reply is a Comment whose `parentId` references another Comment.

Reply is not a separate Firestore collection.

Conceptually:

```text
Comment
├── Reply
│   └── Reply
└── Reply
```

The UI may limit visible nesting depth even if the underlying relationship supports deeper replies.

---

# 16. Bookmark

A Bookmark represents content saved privately by a User.

Canonical path:

```text
users/{uid}/bookmarks/{contentId}
```

Bookmarks are private by default.

Bookmark is different from Follow.

---

# 17. Follow

Follow represents a User following another User.

Canonical relationships:

```text
users/{uid}/following/{targetUid}

users/{targetUid}/followers/{uid}
```

Following an Author is different from following a Story.

---

# 18. Story Follow

A Story Follow represents a User subscribing to updates from a specific Story.

It is conceptually different from:

- Bookmarking a Story
- Following the Story's Author

Exact storage is defined by the story/follow specifications.

---

# 19. Follower

A Follower is a User who follows another User or supported entity.

The exact meaning depends on context.

For user profiles:

```text
followers = users following this user
```

For stories:

```text
followers = users following this story
```

---

# 20. Feed

The Feed is a stream of discoverable Posts.

Typical feed modes may include:

- Newest
- Popular
- Following

The Feed is not a separate database collection.

It is generated using Firestore queries.

---

# 21. Home Feed

The Home Feed is the primary feed displayed on the root route:

```text
/
```

It is the main content discovery surface.

---

# 22. Trending

Trending refers to content or topics receiving significant recent engagement.

The exact ranking algorithm may evolve.

Do not assume Trending is simply all-time `voteScore`.

---

# 23. View

A View represents content consumption.

Examples:

- Opening a Post
- Opening a Story
- Reading a Chapter

View counting rules must be defined separately to avoid excessive Firestore writes.

---

# 24. Notification

A Notification informs a User about relevant activity.

Possible notification types include:

```text
comment
reply
follow
upvote
story_update
mention
```

Canonical collection:

```text
notifications/
```

---

# 25. Report

A Report is a moderation request submitted against content or a user-supported target.

Possible reasons may include:

```text
spam
harassment
nsfw
stolen_content
other
```

Canonical collection:

```text
reports/
```

---

# 26. Moderator

A Moderator is a User with moderation privileges.

A Moderator may perform actions defined by the moderation security specification.

Moderator privileges must not be inferred from frontend state alone.

---

# 27. Admin

An Admin is a User with platform administration privileges.

Admin privileges must be enforced through trusted authorization mechanisms.

---

# 28. Owner

Owner refers to the User who created a resource.

For example:

```text
post.authorId == request.auth.uid
```

means the authenticated User owns the Post.

Ownership does not automatically imply unrestricted modification of all document fields.

---

# 29. Published

Published content is content available to its intended audience.

Typical status:

```text
published
```

Only content satisfying publication and visibility rules should appear in public feeds.

---

# 30. Draft

Draft content is unfinished content owned by its creator.

Typical status:

```text
draft
```

Draft content must not appear in public feeds.

---

# 31. Hidden

Hidden content is content temporarily unavailable to normal public users.

Possible reasons include:

- Moderation
- Author action
- Administrative action

---

# 32. Removed

Removed content has been removed through moderation or administrative action.

Removed does not necessarily mean the Firestore document has been physically deleted.

The exact deletion strategy is defined in database and moderation specifications.

---

# 33. Slug

A Slug is a URL-safe human-readable identifier.

Example:

```text
can-phong-o-tang-13
```

Example URL:

```text
/story/can-phong-o-tang-13
```

Slug uniqueness requirements are defined by the relevant database specification.

---

# 34. Cloudinary Asset

A Cloudinary Asset is media stored in Cloudinary.

Application documents normally reference it using:

```json
{
	"url": "...",
	"publicId": "..."
}
```

`publicId` must be retained when the application needs to delete or replace the asset.

---

# 35. Media

Media refers to files stored outside Firestore.

For the current architecture, media means Cloudinary-hosted assets.

Firestore must not store image binary data.

---

# 36. Canonical Naming Rule

When writing:

- Code
- Documentation
- Specifications
- Database fields
- Components
- Services

use terminology from this document.

Do not create multiple names for the same domain concept without a clear reason.

For example, prefer:

```text
Story
Chapter
Post
Community
Bookmark
Follow
```

instead of introducing synonyms such as:

```text
Novel
Episode
Article
Group
Favorite
Subscription
```

unless a future specification explicitly changes the terminology.
