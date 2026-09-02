# Product Overview

## 1. Product Name

The official product name is:

`vucdem`

The name must be used consistently throughout the project.

---

## 2. Product Definition

vucdem is a horror storytelling and community platform.

The platform combines three primary experiences:

- Reddit-like community feed
- Wattpad-like long-form storytelling
- Subreddit-like topic communities

vucdem is not only a story-reading website.

It is a social platform centered around horror, mystery, paranormal experiences, creepypasta, urban legends, and related discussions.

---

## 3. Product Pillars

vucdem has three primary product areas.

### Feed

The Feed is the main discovery and community surface.

Users can:

- Browse posts
- Read posts
- Upvote
- Downvote
- Comment
- Reply
- Bookmark
- View images
- Open author profiles
- Open communities
- Discover trending content

Conceptually:

```text
Feed
├── Posts
├── Voting
├── Comments
├── Bookmarks
├── Images
└── Discovery
```

---

### Stories

Stories are the long-form publishing system.

A Story can contain multiple Chapters.

Users can:

- Create stories
- Publish chapters
- Read chapters
- Follow stories
- Bookmark stories
- View story information
- View chapter lists
- Follow authors

Conceptually:

```text
Story
├── Cover
├── Metadata
├── Description
├── Tags
├── Chapters
├── Followers
└── Views
```

---

### Communities

Communities are topic-based spaces where users can discover and publish related content.

Examples:

- Tâm linh
- Creepypasta
- Chuyện có thật
- Bí ẩn
- Kinh dị tâm lý
- Truyền thuyết đô thị

Conceptually:

```text
Community
├── Members
├── Posts
├── Description
├── Icon
├── Banner
└── Moderation
```

---

## 4. Product Model

High-level product model:

```text
                         vucdem
                            │
            ┌───────────────┼───────────────┐
            │               │               │
            ▼               ▼               ▼
          FEED           STORIES        COMMUNITIES
            │               │               │
          Posts           Stories          Topics
          Votes           Chapters         Members
        Comments          Following         Posts
       Bookmarks          Bookmarks       Moderation
```

---

## 5. Core Content Types

vucdem has two primary content types:

```text
Content
├── Post
└── Story
    └── Chapter
```

Post and Story are separate domain models.

They must not be merged into one Firestore document model.

---

## 6. Post

A Post is standalone content intended primarily for the community feed.

A Post may contain:

- Title
- Text content
- Thumbnail
- Images
- Category
- Tags
- Author
- Community
- Votes
- Comments
- Views

Typical Post categories include:

- Chuyện có thật
- Creepypasta
- Trải nghiệm tâm linh
- Bí ẩn
- Kinh dị tâm lý
- Truyền thuyết đô thị
- Thảo luận
- Ảnh kỳ lạ

A Post does not contain Chapters.

---

## 7. Story

A Story is long-form serialized content.

A Story contains zero or more Chapters.

Example:

```text
Story: Căn phòng ở tầng 13
│
├── Chapter 1: Tiếng gõ cửa
├── Chapter 2: Người phụ nữ
├── Chapter 3: Tầng không tồn tại
└── Chapter 4: Cánh cửa cuối hành lang
```

Story metadata may contain:

- Title
- Description
- Cover
- Author
- Tags
- Status
- Chapter count
- View count
- Follower count
- Created time
- Updated time

Actual chapter content belongs to Chapter documents.

---

## 8. Chapter

A Chapter belongs to exactly one Story.

A Chapter contains:

- Chapter number
- Title
- Content
- Word count
- Publication state
- Created time
- Updated time

Chapters are ordered within their Story.

---

## 9. Target Experience

vucdem should feel like a dedicated underground horror community.

The desired experience combines:

- Community discussion
- Horror storytelling
- Content discovery
- Serialized reading
- Author following
- Topic communities

The product should encourage users to move naturally between:

```text
Discover
    ↓
Read
    ↓
Interact
    ↓
Follow
    ↓
Return
```

---

## 10. Primary Users

vucdem is designed for:

### Readers

Users who primarily consume horror content.

They may:

- Browse
- Read
- Vote
- Comment
- Bookmark
- Follow authors
- Follow stories
- Join communities

### Community Contributors

Users who publish standalone content.

They may publish:

- Real experiences
- Discussions
- Creepypasta
- Paranormal stories
- Images
- Mysteries

### Story Authors

Users who publish serialized long-form stories.

They may:

- Create stories
- Manage story metadata
- Create chapters
- Edit chapters
- Publish chapters
- Build followers

### Moderators

Users responsible for community moderation.

### Administrators

Users responsible for platform-wide administration.

---

## 11. Authentication

vucdem uses Firebase Authentication.

Initial authentication methods:

- Google
- Email and password

Guest users can access public content without authentication.

Authentication is required for interactive actions such as:

- Publishing
- Commenting
- Voting
- Bookmarking
- Following
- Reporting

Exact permissions are defined in the security specifications.

---

## 12. Database

Application data is stored in Cloud Firestore.

Primary collections:

```text
users/
posts/
stories/
comments/
communities/
notifications/
reports/
```

High-cardinality relationships may use subcollections.

Examples:

```text
users/{uid}/followers/
users/{uid}/following/
users/{uid}/bookmarks/

posts/{postId}/votes/

stories/{storyId}/chapters/
stories/{storyId}/votes/

comments/{commentId}/votes/
```

The canonical database schema is defined in:

`specs/database/`

---

## 13. Media

Cloudinary is the media storage provider.

Cloudinary stores:

- User avatars
- Post thumbnails
- Post images
- Story covers
- Community icons
- Community banners

Firebase Storage must not be used.

Application documents should store Cloudinary asset metadata rather than image binary data.

Typical asset representation:

```json
{
	"url": "https://res.cloudinary.com/...",
	"publicId": "vucdem/posts/post123/cover"
}
```

---

## 14. Design Direction

The visual identity of vucdem is dark horror editorial.

Core characteristics:

- Near-black backgrounds
- Deep crimson accents
- Thin borders
- Minimal rounded corners
- Serif typography for story and post titles
- Neutral sans-serif typography for UI
- Muted metadata
- Cinematic horror imagery
- Dense desktop content layout

The design should feel like:

```text
Underground horror community
+
Premium horror publication
+
Reddit-like information hierarchy
```

Avoid turning vucdem into:

- Generic SaaS dashboard
- Gaming dashboard
- Neon cyberpunk interface
- Cartoon horror website
- Excessively decorative gothic interface

The horror identity should primarily come from:

- Typography
- Imagery
- Color
- Content
- Atmosphere

rather than excessive visual decoration.

---

## 15. Technology Stack

Frontend:

```text
SvelteKit
TypeScript
Tailwind CSS
shadcn-svelte
lucide-svelte
```

Authentication and database:

```text
Firebase Authentication
Cloud Firestore
```

Media:

```text
Cloudinary
```

---

## 16. Product Principles

### Content First

Reading and discovering content must remain the primary experience.

### Community Driven

Voting, comments, following, and communities should make the platform feel alive.

### Reading Quality

Long-form stories must provide a comfortable reading experience.

### Clear Information Hierarchy

Users should quickly understand:

- What the content is
- Who created it
- Which category it belongs to
- How popular it is
- How to interact with it

### Horror Without Visual Noise

The UI should communicate horror atmosphere without sacrificing usability.

### Mobile Compatible

Desktop is the initial primary design target, but all core features must remain usable on mobile.

### Secure by Default

Authorization must not depend only on frontend checks.

### Performance Conscious

Avoid unnecessary Firestore reads and writes.

Use pagination and denormalized counters where appropriate.

---

## 17. MVP Scope

The MVP is implemented incrementally.

### Phase 1

- Project setup
- Design system
- Base layout
- Home feed mock UI

### Phase 2

- Firebase setup
- Authentication
- User profiles

### Phase 3

- Posts
- Create post
- Cloudinary upload
- Post detail

### Phase 4

- Voting
- Comments
- Bookmarks
- Following

### Phase 5

- Stories
- Chapters
- Story reader
- Story management

### Phase 6

- Communities

### Phase 7

- Notifications
- Reports
- Moderation
- Administration

### Phase 8

- Search
- SEO
- Performance
- Deployment

Detailed scope is defined under:

`specs/roadmap/`

---

## 18. Out of Scope for Initial MVP

Unless explicitly added to the roadmap, the initial MVP does not require:

- Private messaging
- Live chat
- Video hosting
- Audio hosting
- Paid subscriptions
- Creator monetization
- Advertising system
- Native mobile applications
- AI-generated stories
- Complex recommendation machine learning
- Custom authentication infrastructure

These may be considered in future versions.

---

## 19. Source of Truth

This document defines the high-level product direction.

More specific specifications take precedence for implementation details.

Relevant specifications include:

- `specs/product/content-model.md`
- `specs/product/user-roles.md`
- `specs/architecture/`
- `specs/database/`
- `specs/features/`
- `specs/security/`
- `specs/ui/`

When this document conflicts with a more specific specification, the more specific specification should normally take precedence.
