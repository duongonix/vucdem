# Posts API

All write endpoints verify Firebase ID tokens with Firebase Admin and derive ownership/author snapshots from trusted User documents.

## POST `/api/posts`

Creates a caller-owned Draft or published Post using a preallocated Firestore ID. Server code sets counters, timestamps, author fields, excerpt, and first `publishedAt`. Direct publication uses the same publication validation as Draft publication.

## GET `/api/posts/{id}`

Published Posts are public. A non-public Post is returned only to its owner; otherwise the response is not found to avoid leaking Draft existence.

## PATCH `/api/posts/{id}`

Owner-only update of canonical editable fields. `{ "action": "remove" }` performs logical removal. First Draft publication atomically sets `publishedAt` and increments the User's trusted `postCount` once.

## GET `/api/posts`

Returns at most 20 published Posts with an opaque cursor. Supported sorts are newest, popular, and most viewed. Category, Community, and Author filters use newest ordering only. Pagination orders by the selected field plus document ID to remain deterministic.

## Security boundary

Clients cannot provide `authorId`, denormalized author fields, counters, timestamps, excerpt, moderation states, or privileged status transitions. Media metadata must match the Cloudinary contract; Cloudinary asset ownership is enforced by the media endpoints.

Persisted media URLs must belong to the configured Cloudinary delivery cloud.
Thumbnail and image public IDs must match the exact Post ID; numbered image
slots must be unique and within 1–10.
