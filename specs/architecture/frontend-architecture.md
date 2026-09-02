# Frontend Architecture

This document defines the frontend architecture of vucdem.

---

# 1. Stack

The frontend uses:

```text
SvelteKit
TypeScript
Tailwind CSS
shadcn-svelte
@lucide/svelte
```

---

# 2. Core Principle

Svelte components should primarily handle:

- Rendering
- User interaction
- Local UI state
- Component composition

Business and data-access logic should primarily live outside large `.svelte` components.

Preferred flow:

```text
Component
    ↓
Service
    ↓
Firebase / Server API
```

---

# 3. Source Structure

Canonical high-level source structure:

```text
src/
├── lib/
│   ├── components/
│   ├── firebase/
│   ├── cloudinary/
│   ├── services/
│   ├── stores/
│   ├── types/
│   └── utils/
│
└── routes/
```

---

# 4. Components

Components live under:

```text
src/lib/components/
```

Recommended domain grouping:

```text
components/
├── layout/
├── feed/
├── post/
├── story/
├── comment/
├── community/
├── profile/
├── editor/
├── media/
└── ui/
```

---

# 5. Layout Components

Layout components may include:

```text
AppHeader
LeftSidebar
RightSidebar
PageContainer
MobileNavigation
```

Layout components should not contain unrelated business logic.

---

# 6. Feature Components

Feature-specific components should remain close to their domain.

Example:

```text
components/post/
├── PostCard.svelte
├── PostMeta.svelte
├── PostActions.svelte
└── VoteColumn.svelte
```

Avoid placing every project component inside one flat directory.

---

# 7. UI Components

Reusable primitive UI components belong under:

```text
src/lib/components/ui/
```

shadcn-svelte components may live here.

Project-specific visual styling may override shadcn defaults.

---

# 8. Services

Services live under:

```text
src/lib/services/
```

Expected services include:

```text
posts.ts
stories.ts
comments.ts
votes.ts
users.ts
follows.ts
bookmarks.ts
communities.ts
notifications.ts
reports.ts
```

Services are responsible for operations such as:

- Firestore reads
- Firestore writes
- Query creation
- Transactions where required
- Calling server endpoints
- Mapping database errors into application-level errors

---

# 9. Firebase Layer

Firebase-specific configuration lives under:

```text
src/lib/firebase/
```

Expected structure:

```text
firebase/
├── client.ts
├── auth.ts
├── firestore.ts
└── converters/
```

Avoid initializing Firebase repeatedly in components.

---

# 10. Cloudinary Layer

Cloudinary client functionality lives under:

```text
src/lib/cloudinary/
```

Expected structure:

```text
cloudinary/
├── upload.ts
└── types.ts
```

Client code must not contain the Cloudinary API secret.

---

# 11. Types

Shared domain types belong under:

```text
src/lib/types/
```

Expected files:

```text
user.ts
media.ts
post.ts
story.ts
comment.ts
community.ts
notification.ts
report.ts
```

Do not duplicate domain interfaces across unrelated components.

---

# 12. Stores

Global or cross-route reactive state belongs under:

```text
src/lib/stores/
```

Example:

```text
auth.svelte.ts
```

Do not move every piece of state into a global store.

Local component state should remain local when possible.

---

# 13. Routes

Application routes live under:

```text
src/routes/
```

Expected primary routes:

```text
/
auth/login/
auth/register/
write/
post/[id]/
story/[slug]/
story/[slug]/[chapter]/
u/[username]/
c/[slug]/
search/
notifications/
settings/
admin/
```

Server APIs:

```text
api/cloudinary/sign/
api/cloudinary/delete/
```

---

# 14. Route Responsibility

Routes should compose page-level features.

Avoid implementing large reusable domain logic directly inside route files.

Example:

```text
+page.svelte
    ↓
FeedTabs
PostCard[]
RightSidebar
```

rather than one massive page component.

---

# 15. Data Loading

Use the simplest correct loading strategy for each route.

Possible sources include:

- Firestore client queries
- SvelteKit load functions
- Server endpoints

Do not force all reads through the server if Firestore Security Rules safely support direct client reads.

Do not force all reads through the browser when trusted server access is required.

---

# 16. Authentication State

Authentication state should be centralized enough that components can reliably know:

```text
loading
authenticated
unauthenticated
current user
```

Components should not independently create multiple Firebase auth listeners.

---

# 17. Loading States

Asynchronous components must consider:

- Loading
- Success
- Empty
- Error

Authentication-dependent components may additionally require:

- Unauthenticated
- Unauthorized

---

# 18. Error Handling

Do not expose raw Firebase errors directly to users.

Services may preserve technical errors for logging while UI layers present readable messages.

---

# 19. Styling

Tailwind CSS is the primary styling system.

Use the project design tokens and UI specification.

Avoid arbitrary visual styles that conflict with:

```text
specs/ui/
```

---

# 20. Icons

Use:

```text
@lucide/svelte
```

Do not introduce another icon library for icons already available in Lucide.

---

# 21. shadcn-svelte

Use shadcn-svelte for useful interaction primitives such as:

- Dialog
- Dropdown
- Select
- Sheet
- Tooltip
- Form controls
- Menus

Do not let default shadcn styling override the vucdem design language.

---

# 22. Component Design Principles

Prefer:

- Small focused components
- Explicit props
- Shared domain types
- Reusable primitives
- Clear data flow

Avoid:

- Giant page components
- Deep unnecessary prop chains
- Duplicated query logic
- Duplicated data models
- Business logic mixed heavily with markup

---

# 23. SSR and Browser APIs

Browser-only APIs must not execute unguarded during server rendering.

Code involving:

```text
window
document
localStorage
File
FileReader
```

must respect SvelteKit's server/browser environment boundaries.

---

# 24. Performance

Avoid:

- Rendering huge lists without pagination
- Unnecessary Firestore listeners
- Re-fetching the same data repeatedly
- Loading full-resolution Cloudinary images when thumbnails are enough

Prefer:

- Pagination
- Lazy image loading
- Appropriate Cloudinary transformations
- Reusable query services
- Derived local state

---

# 25. Source of Truth

Detailed project structure is defined in:

```text
specs/implementation/project-structure.md
```

UI behavior is defined in:

```text
specs/ui/
```

Feature behavior is defined in:

```text
specs/features/
```
