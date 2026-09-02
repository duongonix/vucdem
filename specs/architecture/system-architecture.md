# System Architecture

This document defines the high-level architecture of vucdem.

---

# 1. Overview

vucdem uses a frontend-first architecture based on SvelteKit, Firebase, Firestore, and Cloudinary.

Primary responsibilities:

```text
SvelteKit
├── UI
├── Routing
├── Server endpoints
└── Trusted server-side operations

Firebase
├── Authentication
├── Cloud Firestore
└── Security Rules

Cloudinary
└── Media storage and delivery
```

---

# 2. High-Level Architecture

```text
┌────────────────────────────────────────────┐
│                  Browser                   │
│                                            │
│ SvelteKit UI                               │
│ Tailwind CSS                               │
│ shadcn-svelte                              │
│ @lucide/svelte                             │
└───────────────┬───────────────┬────────────┘
                │               │
                │               │
                ▼               ▼
       Firebase Auth      Cloud Firestore
                │               │
                │               │
                └───────┬───────┘
                        │
                        ▼
                SvelteKit Server
                        │
                        ▼
                   Cloudinary
```

---

# 3. Browser Responsibilities

The browser is responsible for:

- Rendering the application
- Handling user interactions
- Firebase Authentication client operations
- Allowed Firestore reads
- Allowed Firestore writes
- Calling trusted SvelteKit server endpoints
- Uploading files directly to Cloudinary after receiving signed parameters

The browser must not have access to server-only secrets.

---

# 4. SvelteKit Responsibilities

SvelteKit is responsible for:

- Application routing
- Page rendering
- Components
- Client-side navigation
- Server endpoints
- Environment separation
- Trusted server-side operations

Trusted server endpoints may include:

```text
/api/cloudinary/sign
/api/cloudinary/delete
```

Additional server APIs may be introduced only when required by a specification.

---

# 5. Firebase Responsibilities

Firebase provides:

```text
Firebase Authentication
Cloud Firestore
Firestore Security Rules
Firestore indexes
```

Firebase Authentication is the canonical identity system.

Cloud Firestore is the canonical application database.

---

# 6. Cloudinary Responsibilities

Cloudinary is the only media storage provider in the current architecture.

Cloudinary stores:

- User avatars
- Post thumbnails
- Post images
- Story covers
- Community icons
- Community banners

Firestore stores only metadata describing these assets.

---

# 7. Data Ownership

Canonical ownership by subsystem:

```text
Authentication identity
→ Firebase Authentication

Application data
→ Cloud Firestore

Media files
→ Cloudinary

Application UI
→ SvelteKit

Server-only secrets
→ SvelteKit server environment
```

Do not duplicate the canonical source unnecessarily.

---

# 8. Core Request Flows

## Public Read

```text
Browser
   ↓
Firestore query
   ↓
Security Rules
   ↓
Published data
   ↓
Browser
```

---

## Authenticated Write

```text
Browser
   ↓
Firebase Authentication
   ↓
Firestore write
   ↓
Security Rules
   ↓
Firestore
```

---

## Media Upload

```text
Browser
   ↓
SvelteKit /api/cloudinary/sign
   ↓
Generate signature
   ↓
Browser
   ↓
Cloudinary upload
   ↓
Cloudinary returns asset
   ↓
Browser
   ↓
Firestore stores url + publicId
```

---

## Media Delete

```text
Browser
   ↓
Authenticated application action
   ↓
SvelteKit trusted endpoint
   ↓
Authorization check
   ↓
Cloudinary delete
   ↓
Firestore update
```

---

# 9. Security Boundary

The browser is an untrusted environment.

Never trust client-provided values for:

- Role
- Ownership
- Aggregate counters
- Cloudinary secrets
- Admin permissions
- Moderation permissions

Authorization must be enforced by trusted systems.

---

# 10. No Traditional Custom Backend for MVP

The MVP does not require a separate backend application such as:

```text
Express
NestJS
Fastify
Spring
Laravel
Rails
```

SvelteKit server routes are sufficient for trusted server operations.

Firebase provides the primary backend infrastructure.

A separate backend may be introduced later only when justified by product requirements.

---

# 11. No Firebase Storage

Firebase Storage must not be used.

All application media is stored in Cloudinary.

---

# 12. No Realtime Database

Firebase Realtime Database is not part of the architecture.

Cloud Firestore is the canonical application database.

---

# 13. Service Layer

UI components should not contain large amounts of database logic.

Preferred flow:

```text
Svelte Component
      ↓
Service
      ↓
Firestore / Server API
```

Example:

```text
PostCard
   ↓
votes.ts
   ↓
Firestore
```

---

# 14. Domain Separation

Major domains include:

```text
Authentication
Users
Posts
Stories
Chapters
Comments
Votes
Bookmarks
Following
Communities
Notifications
Reports
Media
Moderation
```

Code should keep domain responsibilities reasonably separated.

---

# 15. Scalability Principles

The architecture should avoid:

- Unbounded arrays in Firestore documents
- Loading entire collections
- Reading all Vote documents to render counters
- Reading all Comments to calculate comment count
- Uploading images through the SvelteKit server unnecessarily
- Large media files inside Firestore
- Offset pagination for normal feeds

Prefer:

- Cursor pagination
- Denormalized counters
- Subcollections for high-cardinality relationships
- Direct signed uploads to Cloudinary
- Query-specific Firestore indexes

---

# 16. Source of Truth

More specific architecture documents define individual subsystems:

```text
frontend-architecture.md
firebase-architecture.md
cloudinary-architecture.md
auth-architecture.md
data-flow.md
```

When a specific subsystem specification conflicts with this document, the more specific document takes precedence.
