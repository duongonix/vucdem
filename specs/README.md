# VỰC ĐÊM Specifications

This directory contains the canonical product and implementation specifications for VỰC ĐÊM.

These specifications are the source of truth for the project.

They define:

```txt
what the product does
how the architecture works
how data is stored
how permissions work
how the UI behaves
how features interact
how implementation should be structured
```

The specifications are intended to be read by both developers and AI coding agents.

---

# 1. Core rule

Before implementing a feature, read the relevant specifications.

Do not invent:

```txt
database fields
routes
permissions
feature behavior
API contracts
UI behavior
content relationships
```

when they are already defined here.

If implementation and specifications disagree, the specification should normally be treated as correct unless the specification itself is intentionally being changed.

---

# 2. Reading order

Before working on the project for the first time, read these files in order:

```txt
1. product/product-overview.md
2. product/terminology.md
3. product/content-model.md
4. product/user-roles.md

5. architecture/system-architecture.md
6. architecture/frontend-architecture.md
7. architecture/firebase-architecture.md
8. architecture/cloudinary-architecture.md
9. architecture/auth-architecture.md
10. architecture/data-flow.md

11. database/firestore-schema.md

12. security/firestore-rules.md
13. security/authorization.md

14. ui/design-system.md
15. ui/layout.md
16. ui/components.md
17. ui/responsive.md

18. implementation/project-structure.md
19. implementation/coding-conventions.md
20. implementation/environment-variables.md

21. roadmap/mvp.md
```

After that, read the feature-specific specification for the task being implemented.

---

# 3. Directory structure

```txt
specs/
├── README.md
│
├── product/
│   ├── product-overview.md
│   ├── terminology.md
│   ├── user-roles.md
│   └── content-model.md
│
├── architecture/
│   ├── system-architecture.md
│   ├── frontend-architecture.md
│   ├── firebase-architecture.md
│   ├── cloudinary-architecture.md
│   ├── auth-architecture.md
│   └── data-flow.md
│
├── database/
│   ├── firestore-schema.md
│   ├── users.md
│   ├── posts.md
│   ├── stories.md
│   ├── chapters.md
│   ├── comments.md
│   ├── votes.md
│   ├── follows.md
│   ├── bookmarks.md
│   ├── communities.md
│   ├── notifications.md
│   ├── reports.md
│   └── indexes.md
│
├── security/
│   ├── firestore-rules.md
│   ├── authorization.md
│   ├── ownership-rules.md
│   ├── moderation-rules.md
│   └── cloudinary-security.md
│
├── features/
│   ├── authentication.md
│   ├── home-feed.md
│   ├── posts.md
│   ├── stories.md
│   ├── story-reader.md
│   ├── story-editor.md
│   ├── comments.md
│   ├── voting.md
│   ├── bookmarks.md
│   ├── following.md
│   ├── profiles.md
│   ├── communities.md
│   ├── notifications.md
│   ├── search.md
│   ├── reports.md
│   └── admin.md
│
├── ui/
│   ├── design-system.md
│   ├── layout.md
│   ├── responsive.md
│   ├── typography.md
│   ├── colors.md
│   ├── icons.md
│   ├── components.md
│   │
│   ├── references/
│   │   └── home.png
│   │
│   └── screens/
│       ├── home.md
│       ├── post-detail.md
│       ├── story-detail.md
│       ├── story-reader.md
│       ├── write-post.md
│       ├── create-story.md
│       ├── story-manager.md
│       ├── profile.md
│       ├── community.md
│       ├── search.md
│       ├── notifications.md
│       ├── settings.md
│       └── admin.md
│
├── api/
│   ├── server-api.md
│   ├── cloudinary-sign.md
│   ├── cloudinary-delete.md
│   └── server-actions.md
│
├── implementation/
│   ├── project-structure.md
│   ├── coding-conventions.md
│   ├── component-conventions.md
│   ├── firestore-conventions.md
│   ├── error-handling.md
│   ├── loading-states.md
│   ├── pagination.md
│   ├── validation.md
│   └── environment-variables.md
│
├── testing/
│   ├── testing-strategy.md
│   ├── unit-tests.md
│   ├── integration-tests.md
│   └── e2e-tests.md
│
└── roadmap/
    ├── mvp.md
    ├── phase-2.md
    └── future.md
```

---

# 4. Product model

VỰC ĐÊM is a horror storytelling and community platform.

It has three primary product areas:

```txt
Feed
Stories
Communities
```

Conceptually:

```txt
                    VỰC ĐÊM
                       │
        ┌──────────────┼──────────────┐
        │              │              │
        ▼              ▼              ▼

       FEED           STORIES      COMMUNITIES

   Reddit-like      Wattpad-like   subreddit-like
```

The platform is not only a story reader.

It is intended to function as a horror-focused social community.

---

# 5. Core content model

There are two primary content types:

```txt
Post
Story
```

A Story contains Chapters.

```txt
Content
├── Post
└── Story
    ├── Chapter 1
    ├── Chapter 2
    └── ...
```

A Post is standalone.

A Story is serialized.

Do not merge these concepts unless the product specification is explicitly changed.

---

# 6. Technology constraints

Approved technologies:

```txt
SvelteKit
TypeScript
Tailwind CSS
shadcn-svelte
@lucide/svelte

Firebase Authentication
Cloud Firestore

Cloudinary
```

Firebase Storage is not used.

Firebase Realtime Database is not part of the current architecture.

Cloudinary is the media storage provider.

---

# 7. Architecture boundaries

Firebase is responsible for:

```txt
Authentication
Firestore data
Firestore queries
authorization through Security Rules
realtime updates where useful
```

Cloudinary is responsible for:

```txt
images
avatars
covers
thumbnails
banners
```

SvelteKit server routes are responsible for:

```txt
Cloudinary signatures
Cloudinary deletion
server-only secret operations
```

Browser clients must never receive Cloudinary API secrets.

---

# 8. Database source of truth

Firestore schema specifications live under:

```txt
database/
```

The primary root collections are:

```txt
users/
posts/
stories/
comments/
communities/
notifications/
reports/
```

Relationship-heavy data may use subcollections.

Examples:

```txt
users/{uid}/followers/
users/{uid}/following/
users/{uid}/bookmarks/

posts/{postId}/votes/

stories/{storyId}/chapters/
stories/{storyId}/votes/

comments/{commentId}/votes/
```

Before adding or changing a Firestore field, update the corresponding database specification.

---

# 9. Database specification format

Each document model specification should define:

```txt
Purpose
Firestore path
Document identity
Fields
Field types
Required fields
Optional fields
Allowed values
Default values
Indexes
Relationships
Read permissions
Create permissions
Update permissions
Delete permissions
Counter behavior
Example document
```

Application TypeScript types should remain consistent with these schemas.

---

# 10. Security specifications

Security behavior lives under:

```txt
security/
```

Authentication alone does not imply authorization.

Firestore Security Rules must enforce access rules for client operations.

The application supports these roles:

```txt
guest
user
moderator
admin
```

General intent:

```txt
guest
    read public published content

user
    create own content
    edit own content
    delete own content
    comment
    vote
    bookmark
    follow
    report

moderator
    moderate content
    handle reports

admin
    administrative and moderation access
```

Exact behavior must be defined in the relevant security specification.

---

# 11. Trusted fields

Certain fields should not be arbitrarily writable by clients.

Examples include:

```txt
role
authorId after creation
createdAt
voteScore
commentCount
viewCount
followersCount
followingCount
postCount
storyCount
chapterCount
```

The exact mutation rules must be defined in database and security specifications.

---

# 12. Cloudinary media model

Cloudinary stores media only.

Firestore stores metadata describing media.

Preferred media shape:

```ts
type CloudinaryAsset = {
	url: string;
	publicId: string;
};
```

Typical folders:

```txt
vucdem/

├── avatars/
│   └── {uid}/
│
├── posts/
│   └── {postId}/
│
├── stories/
│   └── {storyId}/
│
└── communities/
    └── {communityId}/
```

The exact media architecture lives under:

```txt
architecture/cloudinary-architecture.md
security/cloudinary-security.md
```

---

# 13. Cloudinary upload flow

Authenticated uploads should use signed upload parameters.

Expected flow:

```txt
Browser
    ↓
POST /api/cloudinary/sign
    ↓
SvelteKit Server
    ↓
signed parameters
    ↓
Browser
    ↓
Cloudinary
    ↓
url + publicId
    ↓
Firestore
```

Never expose:

```txt
CLOUDINARY_API_SECRET
```

to the browser.

---

# 14. Feature specifications

Each file under:

```txt
features/
```

should use this structure when applicable:

```txt
# Feature name

## Goal

## Scope

## User stories

## Routes

## UI behavior

## Data model

## Queries

## Mutations

## Permissions

## Validation

## Loading states

## Empty states

## Error states

## Edge cases

## Acceptance criteria

## Out of scope
```

Feature behavior should be explicit enough that implementation does not need to guess significant product decisions.

---

# 15. UI specifications

Global design specifications live under:

```txt
ui/
```

Screen-specific specifications live under:

```txt
ui/screens/
```

Visual references live under:

```txt
ui/references/
```

When a visual reference exists, it should be treated as a visual source of truth together with its screen specification.

---

# 16. Design direction

The project uses a dark horror editorial design.

Core characteristics:

```txt
near-black backgrounds
deep crimson accents
thin borders
minimal rounded corners
serif story titles
muted metadata
dark cinematic imagery
dense desktop layout
```

The interface should not look like a generic SaaS dashboard.

Avoid:

```txt
large pill-shaped cards
heavy glassmorphism
bright neon gradients
excessive glow
cartoon horror
decorative clutter
```

The intended feeling is:

```txt
underground horror community
+
premium editorial storytelling
+
Reddit-like information hierarchy
```

---

# 17. Responsive strategy

The initial visual target is desktop-first.

The expected base layout is approximately:

```txt
Header: 84px

Desktop:
240px | main content | 400px
```

At smaller widths, sidebars may collapse according to:

```txt
ui/responsive.md
```

Do not redesign responsive behavior independently from the specification.

---

# 18. Application service architecture

Business operations should normally use:

```txt
UI Component
     ↓
Service
     ↓
Firebase / Server API
```

Shared Firestore logic should not be duplicated across Svelte components.

Services should live under:

```txt
src/lib/services/
```

Shared domain models should live under:

```txt
src/lib/types/
```

---

# 19. Firestore pagination

Normal feed pagination uses cursors.

Preferred pattern:

```txt
orderBy(...)
limit(20)
```

Then:

```txt
startAfter(lastDocument)
limit(20)
```

Do not use offset-style pagination for ordinary Firestore feed queries.

See:

```txt
implementation/pagination.md
```

---

# 20. Firestore indexes

Required Firestore indexes must be documented in:

```txt
database/indexes.md
```

and represented in:

```txt
firestore.indexes.json
```

Queries and indexes should remain synchronized.

---

# 21. Search

Firestore is not considered the long-term full-text search system.

MVP search behavior should remain intentionally limited unless an external search service is introduced.

Do not simulate large-scale full-text search by downloading entire collections to the browser.

See:

```txt
features/search.md
```

---

# 22. Validation

Validation rules live in:

```txt
implementation/validation.md
```

Typical limits may include constraints for:

```txt
post titles
story titles
comments
bios
tags
images
```

Do not invent conflicting limits in individual components.

---

# 23. Environment configuration

Environment variables are documented under:

```txt
implementation/environment-variables.md
```

Expected categories:

Browser-safe:

```txt
PUBLIC_FIREBASE_*
PUBLIC_CLOUDINARY_CLOUD_NAME
```

Server-only:

```txt
CLOUDINARY_API_KEY
CLOUDINARY_API_SECRET
```

Never place secrets under a `PUBLIC_` environment variable.

---

# 24. Implementation specifications

Files under:

```txt
implementation/
```

define coding and structural conventions.

These include:

```txt
project layout
component organization
Firestore access conventions
error handling
loading states
pagination
validation
environment variables
```

These specifications should prevent implementation patterns from drifting between features.

---

# 25. Testing specifications

Testing strategy lives under:

```txt
testing/
```

Feature implementations should include appropriate tests based on their risk and behavior.

At minimum, implementation work should not knowingly leave:

```txt
TypeScript errors
build errors
broken imports
failing tests caused by the change
```

---

# 26. Roadmap

Roadmap specifications live under:

```txt
roadmap/
```

The existence of a future specification does not mean the feature should be implemented immediately.

Agents must implement only the requested phase or feature.

---

# 27. MVP phases

The current high-level implementation plan is:

## Phase 1

```txt
Project setup
Design system
Base layout
Home feed mock UI
```

## Phase 2

```txt
Firebase setup
Authentication
User profiles
```

## Phase 3

```txt
Posts
Create post
Cloudinary uploads
Post detail
```

## Phase 4

```txt
Voting
Comments
Bookmarks
Following
```

## Phase 5

```txt
Stories
Chapters
Story reader
Story management
```

## Phase 6

```txt
Communities
```

## Phase 7

```txt
Notifications
Reports
Moderation
Admin
```

## Phase 8

```txt
Search
SEO
Performance
Deployment
```

Exact scope is defined in:

```txt
roadmap/mvp.md
```

and later roadmap files.

---

# 28. Specification changes

When changing:

```txt
architecture
database schema
route contracts
permissions
feature behavior
API contracts
design rules
```

update the relevant specification.

Do not silently allow implementation and specifications to diverge.

A specification change should happen intentionally.

---

# 29. Conflict resolution

If two specifications appear to conflict:

1. Prefer the more specific specification.
2. Prefer feature-specific behavior over broad examples when appropriate.
3. Prefer explicit requirements over implied behavior.
4. Do not invent a new behavior to avoid the conflict.
5. Report unresolved material conflicts.

---

# 30. Definition of done

A feature should only be considered complete when:

```txt
the relevant specification has been followed
the UI behavior matches the feature specification
data models match database specifications
permissions match security specifications
required indexes are accounted for
loading and error states are handled
TypeScript remains valid
relevant tests pass
```

The purpose of this directory is to make implementation deterministic.

Agents should not need to redesign the product while coding it.
