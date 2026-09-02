# Firebase Architecture

This document defines how Firebase is used in vucdem.

---

# 1. Firebase Services

vucdem uses:

```text
Firebase Authentication
Cloud Firestore
Firestore Security Rules
Firestore indexes
```

vucdem does not use:

```text
Firebase Storage
Firebase Realtime Database
```

unless the architecture is explicitly changed later.

---

# 2. Firebase Authentication

Firebase Authentication is the canonical identity provider.

The canonical User identity is:

```text
Firebase Auth UID
```

Firestore User documents use the same UID:

```text
users/{uid}
```

---

# 3. Authentication Providers

Initial authentication providers:

```text
Google
Email + Password
```

Do not implement custom password storage.

---

# 4. Cloud Firestore

Cloud Firestore is the canonical application database.

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

Subcollections are used for scalable high-cardinality relationships.

---

# 5. Firestore Structure

High-level structure:

```text
users/
└── {uid}/
    ├── followers/
    ├── following/
    └── bookmarks/

posts/
└── {postId}/
    └── votes/

stories/
└── {storyId}/
    ├── chapters/
    └── votes/

comments/
└── {commentId}/
    └── votes/

communities/

notifications/

reports/
```

Exact schemas are defined under:

```text
specs/database/
```

---

# 6. Direct Client Access

Direct browser-to-Firestore access is allowed when:

- The operation is appropriate for client access
- Security Rules can fully enforce authorization
- No server-only secret is required

Example:

```text
Browser
   ↓
Firestore
   ↓
Security Rules
```

---

# 7. Trusted Server Operations

Operations that cannot be safely enforced through normal client access should use trusted server-side mechanisms.

Examples may include:

- Cloudinary secret operations
- Administrative workflows
- Sensitive aggregate maintenance
- Future privileged operations

Do not route every ordinary Firestore request through SvelteKit unnecessarily.

---

# 8. Security Rules

Firestore Security Rules are mandatory.

Frontend UI restrictions are not authorization.

For every client Firestore write, Security Rules must consider:

- Authentication
- Role
- Ownership
- Current document state
- New document state
- Allowed changed fields

---

# 9. Rules Are Not Filters

Firestore Security Rules do not automatically filter unauthorized documents from broad queries.

Queries must be compatible with the relevant Rules.

Example:

If public reads require:

```text
status == "published"
```

then the public query should normally also constrain:

```text
status == "published"
```

Do not assume a query can fetch all documents and Security Rules will remove private ones.

---

# 10. Denormalization

Firestore reads should be optimized using intentional denormalization where appropriate.

Examples:

```text
authorName
authorAvatarUrl
voteScore
commentCount
viewCount
chapterCount
followerCount
```

Denormalized fields must have clearly defined synchronization behavior.

---

# 11. Unbounded Arrays

Do not use arrays for relationships that can grow without a practical bound.

Avoid:

```text
post.voters = [...]
user.followers = [...]
story.chapters = [...]
post.comments = [...]
```

Prefer subcollections.

---

# 12. Counters

Counters may be stored directly on primary documents.

Examples:

```text
voteScore
commentCount
viewCount
followersCount
followingCount
postCount
storyCount
chapterCount
```

Counters are trusted derived data.

Clients must not be able to arbitrarily set these values.

---

# 13. Transactions

Use Firestore transactions when multiple values must remain logically consistent.

Examples may include:

- Vote state + voteScore
- Username reservation
- Slug reservation
- Relationship creation + counter changes

The exact transaction strategy belongs to the relevant feature specification.

---

# 14. Batch Writes

Use batch writes when multiple independent writes must commit together and do not require reading current values during the operation.

---

# 15. Timestamps

Use Firestore server-generated timestamps where trusted creation/update time is required.

Preferred conceptual behavior:

```text
createdAt = server timestamp
updatedAt = server timestamp
```

Do not trust user-provided timestamps for authoritative creation metadata.

---

# 16. Pagination

Use cursor pagination.

Example:

```text
orderBy(createdAt, desc)
limit(20)
```

Next page:

```text
startAfter(lastDocument)
limit(20)
```

Do not use offset pagination for normal feeds.

---

# 17. Indexes

Composite indexes required by application queries must be tracked in:

```text
firestore.indexes.json
```

and documented in:

```text
specs/database/indexes.md
```

---

# 18. Full-Text Search

Cloud Firestore is not the long-term full-text search engine.

Do not download large collections to the browser and manually search them.

MVP search should remain limited according to:

```text
specs/features/search.md
```

---

# 19. Usernames

Firebase Authentication does not provide application username uniqueness.

If unique usernames are required, use a dedicated reservation strategy.

Conceptual example:

```text
usernames/{normalizedUsername}
```

The exact schema must be defined before implementation.

---

# 20. Story Slugs

Firestore document queries alone do not provide a safe uniqueness guarantee for concurrent slug creation.

If unique Story slugs are required, use a transaction-backed mapping or equivalent trusted mechanism.

Conceptual example:

```text
storySlugs/{slug}
```

The exact design must be documented before implementation.

---

# 21. Views

Avoid writing directly to Firestore on every trivial page render.

View counting must consider:

- Excessive writes
- Reload spam
- Duplicate counting
- Cost
- Abuse

The exact strategy is defined by feature/database specifications.

---

# 22. Realtime Listeners

Realtime listeners may be used where they materially improve UX.

Do not attach realtime listeners to every feed or large collection by default.

Prefer normal paginated reads for large discovery surfaces unless realtime behavior is explicitly required.

---

# 23. Firebase Initialization

Firebase Client SDK should be initialized once through shared infrastructure.

Canonical location:

```text
src/lib/firebase/client.ts
```

Do not initialize separate Firebase application instances inside feature components.

Initialization is lazy and browser-only. This allows SSR and build tooling to run without importing browser provider state or requiring production credentials. `src/lib/firebase/client.ts` validates all required public values when the application first requests Firebase.

Local Auth and Firestore emulator connections are opt-in through the documented public development variables and are never connected by production builds.

---

# 24. Firestore Converters

Converters may be used to centralize conversion between Firestore documents and TypeScript domain models.

Canonical location:

```text
src/lib/firebase/converters/
```

Use them where they improve consistency.

---

# 25. Source of Truth

Exact schemas:

```text
specs/database/
```

Exact authorization:

```text
specs/security/
```

Exact feature operations:

```text
specs/features/
```
