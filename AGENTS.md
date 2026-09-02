# AGENTS.md

This file defines the rules that AI coding agents must follow when working on this project.

The project is a horror community and storytelling platform built with SvelteKit, Firebase, Firestore, and Cloudinary.

The canonical implementation specifications live in `specs/`.

---

# 1. Source of truth

Before implementing any feature, always read:

```txt
specs/README.md
```

Then read all specifications relevant to the task.

The `specs/` directory is the source of truth for:

- product behavior
- architecture
- database schema
- Firestore collections
- permissions
- security rules
- routes
- UI behavior
- design system
- features
- APIs
- implementation conventions

Do not invent behavior when a specification already exists.

If the existing code conflicts with `specs/`, prefer the specification unless the user explicitly requests a specification change.

---

# 2. Required workflow

For every implementation task:

```txt
1. Read specs/README.md
2. Locate the specifications relevant to the task
3. Inspect the existing implementation
4. Identify the smallest complete change required
5. Implement the feature
6. Run formatter
7. Run type checking
8. Run relevant tests
9. Fix errors before finishing
```

Do not make unrelated refactors unless they are required to complete the task safely.

---

# 3. Technology stack

The approved stack is:

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

Do not replace these technologies without an explicit specification change.

---

# 4. Backend architecture

Firebase is responsible for:

```txt
Authentication
Application data
Firestore queries
Realtime updates where useful
Authorization through Firestore Security Rules
```

Cloudinary is responsible for:

```txt
Images
Avatars
Post media
Story covers
Community icons
Community banners
```

SvelteKit server routes are responsible for trusted operations such as:

```txt
Cloudinary upload signing
Cloudinary asset deletion
Operations requiring server-only secrets
```

---

# 5. Firebase rules

Do not use Firebase Storage.

Do not introduce Firebase Realtime Database unless explicitly requested.

Application data must use Cloud Firestore.

Firestore operations should follow the schemas defined under:

```txt
specs/database/
```

Firestore authorization must follow:

```txt
specs/security/
```

Do not depend only on frontend checks for authorization.

Firestore Security Rules are the final authorization layer for client Firestore operations.

---

# 6. Cloudinary security

Never expose:

```txt
CLOUDINARY_API_SECRET
```

to the browser.

Never include Cloudinary API secrets in:

```txt
client-side code
PUBLIC_* environment variables
HTML
JavaScript bundles
Svelte components
browser requests
```

Signed uploads must follow the architecture defined in:

```txt
specs/architecture/cloudinary-architecture.md
specs/api/cloudinary-sign.md
```

The intended flow is:

```txt
Browser
    ↓
SvelteKit server signing endpoint
    ↓
signed upload parameters
    ↓
Browser
    ↓
Cloudinary
```

Cloudinary assets stored in Firestore should normally include both:

```txt
url
publicId
```

The `publicId` is required so assets can later be replaced or deleted safely.

---

# 7. Secrets and environment variables

Never hard-code credentials.

Browser-safe Firebase configuration may use:

```txt
PUBLIC_FIREBASE_API_KEY
PUBLIC_FIREBASE_AUTH_DOMAIN
PUBLIC_FIREBASE_PROJECT_ID
PUBLIC_FIREBASE_APP_ID
```

Cloudinary browser-safe configuration may use:

```txt
PUBLIC_CLOUDINARY_CLOUD_NAME
```

Server-only values include:

```txt
CLOUDINARY_API_KEY
CLOUDINARY_API_SECRET
```

Follow:

```txt
specs/implementation/environment-variables.md
```

---

# 8. Svelte conventions

Use SvelteKit conventions.

Use TypeScript.

Prefer small reusable components instead of very large `.svelte` files.

Do not put large amounts of business logic directly inside Svelte components.

Preferred architecture:

```txt
Component
    ↓
Service
    ↓
Firebase / API
```

Avoid:

```txt
Component
    ↓
large duplicated Firestore logic
```

Shared application logic should live under:

```txt
src/lib/services/
```

Shared data models should live under:

```txt
src/lib/types/
```

Firebase-specific setup should live under:

```txt
src/lib/firebase/
```

Cloudinary-specific logic should live under:

```txt
src/lib/cloudinary/
```

---

# 9. TypeScript rules

Use strict TypeScript.

Avoid:

```ts
any;
```

unless there is a strong technical reason.

Prefer explicit application models.

Do not duplicate interfaces representing the same domain object across multiple files.

Use shared types from:

```txt
src/lib/types/
```

Keep Firebase document conversion consistent.

---

# 10. Database schema

Do not invent Firestore fields.

Before modifying a Firestore document model, read the relevant file under:

```txt
specs/database/
```

Root collections are expected to include:

```txt
users/
posts/
stories/
comments/
communities/
notifications/
reports/
```

Common subcollections include:

```txt
users/{uid}/followers/
users/{uid}/following/
users/{uid}/bookmarks/

posts/{postId}/votes/

stories/{storyId}/chapters/
stories/{storyId}/votes/

comments/{commentId}/votes/
```

If a new collection or field is required, update the relevant specification before implementing it.

---

# 11. Counters

Fields such as:

```txt
voteScore
commentCount
viewCount
followersCount
followingCount
postCount
storyCount
chapterCount
```

are denormalized counters.

Do not allow arbitrary client-side modification of trusted counters.

Counter behavior must follow the relevant feature and security specifications.

---

# 12. Pagination

Firestore feeds must use cursor-based pagination.

Preferred:

```txt
limit(...)
startAfter(lastDocument)
```

Do not implement SQL-style offset pagination for normal Firestore feeds.

Follow:

```txt
specs/implementation/pagination.md
```

---

# 13. UI rules

The UI is a dark horror editorial/community design.

The main visual direction is:

```txt
near-black background
deep crimson accents
thin borders
minimal rounded corners
literary serif titles
muted metadata
dark cinematic horror imagery
dense desktop layout
```

Do not turn the interface into a generic SaaS dashboard.

Avoid:

```txt
large rounded cards
glassmorphism
bright gradients
excessive glow
cartoon horror
excessive skull/blood decorations
```

Use the design specifications under:

```txt
specs/ui/
```

Visual references under:

```txt
specs/ui/references/
```

should be treated as visual sources of truth.

---

# 14. Icons

Use:

```txt
@lucide/svelte
```

when an appropriate Lucide icon exists.

Do not install another icon library unless required.

---

# 15. shadcn-svelte

Use shadcn-svelte for reusable primitives where appropriate, including:

```txt
dialogs
dropdowns
forms
selects
tooltips
menus
sheets
```

Do not force default shadcn visual styling if it conflicts with the project's design system.

Components should be styled to match the project.

---

# 16. Dependencies

Before implementing a common subsystem manually, check whether a mature existing dependency already solves it appropriately.

Prefer established libraries over unnecessary custom implementations.

Do not add large dependencies for trivial functionality.

Do not replace existing dependencies without a clear reason.

---

# 17. Authentication

Authentication uses Firebase Authentication.

Initial supported methods are expected to be:

```txt
Google
Email + Password
```

Authentication behavior must follow:

```txt
specs/features/authentication.md
specs/architecture/auth-architecture.md
```

Do not implement custom password storage.

---

# 18. Roles

Supported application roles are:

```txt
guest
user
moderator
admin
```

Role permissions are defined by:

```txt
specs/product/user-roles.md
specs/security/authorization.md
```

Do not infer administrative privileges from frontend state alone.

---

# 19. Content model

The platform has two primary content types:

```txt
Post
Story
```

A Story contains Chapters.

Do not merge Post and Story into one model unless the specifications are explicitly changed.

Conceptually:

```txt
Content
├── Post
└── Story
    └── Chapter
```

---

# 20. Search

Firestore is not considered the long-term full-text search engine.

Do not implement complex fake full-text search by downloading large datasets to the browser.

MVP search behavior must follow:

```txt
specs/features/search.md
```

A dedicated search service may be introduced later.

---

# 21. Error states

Every user-facing asynchronous feature should consider:

```txt
loading
success
empty
error
unauthorized
not found
```

Follow:

```txt
specs/implementation/error-handling.md
specs/implementation/loading-states.md
```

Do not leave rejected promises unhandled.

---

# 22. Validation

User-generated content must be validated.

Follow:

```txt
specs/implementation/validation.md
```

Do not rely only on HTML attributes such as:

```txt
maxlength
required
```

where trusted validation is required.

---

# 23. Firestore indexes

If a new query requires a Firestore composite index:

1. Add or update the relevant database specification.
2. Update:

```txt
firestore.indexes.json
```

Do not silently redesign a query just to avoid documenting the required index.

---

# 24. Testing

Follow:

```txt
specs/testing/
```

At minimum, after implementation:

```txt
run formatting
run type checking
run relevant tests
```

Do not claim a task is complete if known type errors or build errors caused by the change remain.

---

# 25. Scope control

Do not implement future roadmap features unless required by the current task.

The roadmap lives under:

```txt
specs/roadmap/
```

If implementing MVP work, do not automatically implement Phase 2+ features merely because they are documented.

Specifications describe intended behavior, not necessarily current implementation status.

---

# 26. Documentation changes

When architecture, schema, behavior, routes, permissions, or public APIs change, update the appropriate specification.

Do not let implementation and specifications silently diverge.

Use:

```txt
specs/
```

for implementation contracts.

Use:

```txt
docs/
```

for human-facing development and setup documentation.

---

# 27. Conflict resolution

If specifications conflict:

1. Prefer the more specific specification over the general specification.
2. Prefer feature-specific rules over broad architectural examples where applicable.
3. Do not silently choose a materially different product behavior.
4. If the conflict cannot safely be resolved from context, report the conflict.

Do not invent a third behavior.

---

# 28. Final rule

Before writing code, understand the relevant specification.

Before finishing, verify that the implementation still matches it.

The goal is not only to make the code work.

The goal is to make the code match the product and architecture defined in `specs/`.
