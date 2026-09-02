# Cloudinary Architecture

This document defines how Cloudinary is used in vucdem.

---

# 1. Purpose

Cloudinary is the canonical media storage and delivery platform.

It is used for:

- User avatars
- Post thumbnails
- Post images
- Story covers
- Community icons
- Community banners

Firebase Storage must not be used.

---

# 2. Separation of Responsibilities

Cloudinary stores actual media files.

Firestore stores media metadata.

Example:

```json
{
	"url": "https://res.cloudinary.com/example/image/upload/...",
	"publicId": "vucdem/posts/post123/cover"
}
```

Do not store image binary content in Firestore.

---

# 3. Root Folder

All application-managed Cloudinary assets should use the root folder:

```text
vucdem/
```

Canonical structure:

```text
vucdem/
├── avatars/
│   └── {uid}/
│
├── posts/
│   └── {postId}/
│       ├── cover
│       ├── image-1
│       └── image-2
│
├── stories/
│   └── {storyId}/
│       ├── cover
│       └── images/
│
└── communities/
    └── {communityId}/
        ├── icon
        └── banner
```

---

# 4. Signed Uploads

Authenticated application uploads should use signed Cloudinary uploads.

Expected flow:

```text
Browser
    ↓
POST /api/cloudinary/sign
    ↓
SvelteKit server
    ↓
Generate timestamp + signature
    ↓
Browser
    ↓
Direct upload to Cloudinary
    ↓
Cloudinary response
    ↓
Store url + publicId in Firestore
```

---

# 5. Why Direct Upload

The browser should normally upload directly to Cloudinary after receiving a valid signature.

Avoid:

```text
Browser
→ send full image to SvelteKit
→ SvelteKit forwards image to Cloudinary
```

for ordinary uploads.

Direct upload avoids unnecessary server bandwidth and memory usage.

---

# 6. Server Secret

The following value is server-only:

```text
CLOUDINARY_API_SECRET
```

It must never appear in:

- Client JavaScript
- Svelte components
- Browser network payloads
- `PUBLIC_*` environment variables
- HTML
- Git-tracked configuration

---

# 7. Environment Variables

Browser-safe:

```text
PUBLIC_CLOUDINARY_CLOUD_NAME
```

Server-only:

```text
CLOUDINARY_API_KEY
CLOUDINARY_API_SECRET
```

The API key may be included in signed upload responses when required by the Cloudinary upload flow.

The API secret must never leave the trusted server environment.

---

# 8. Signing Endpoint

Canonical endpoint:

```text
POST /api/cloudinary/sign
```

The endpoint should:

1. Require authentication where appropriate.
2. Validate requested upload context.
3. Determine the allowed target folder.
4. Generate a timestamp.
5. Generate a Cloudinary signature.
6. Return only safe signed upload parameters.

The client must not choose arbitrary protected Cloudinary folders.

---

# 9. Upload Context

The application should identify what kind of asset is being uploaded.

Possible kinds:

```text
avatar
post
story-cover
community-icon
community-banner
```

The exact API request model is defined in:

```text
specs/api/cloudinary-sign.md
```

---

# 10. Asset Metadata

Canonical media representation:

```ts
type CloudinaryAsset = {
	url: string;
	publicId: string;
};
```

Additional metadata may be introduced when useful, such as:

```text
width
height
format
bytes
```

but must be specified before becoming part of canonical Firestore models.

---

# 11. publicId

Always retain `publicId` for managed Cloudinary assets.

Do not store only the URL when the application may later need to:

- Delete the asset
- Replace the asset
- Manage the asset

---

# 12. Deletion

Deleting a Cloudinary asset requires a trusted server operation.

Expected flow:

```text
Browser
   ↓
Delete application resource
   ↓
SvelteKit trusted endpoint
   ↓
Verify identity and ownership
   ↓
Cloudinary API
   ↓
Delete asset
```

Do not expose Cloudinary deletion credentials to the browser.

---

# 13. Authorization

The server must not delete an asset merely because the client provides a `publicId`.

Before deleting, verify that the authenticated User is authorized to modify the application resource associated with the asset.

Avoid insecure behavior such as:

```text
POST /api/cloudinary/delete

{
  "publicId": "anything"
}
```

without authorization checks.

---

# 14. Replacing Assets

When replacing a managed asset:

1. Upload the new asset.
2. Successfully update the application document.
3. Delete the old asset when safe.

Avoid deleting the old asset before the replacement is safely persisted if that could leave the resource without media after a failure.

---

# 15. Upload Validation

Uploads should validate appropriate constraints such as:

- File type
- File size
- Asset purpose
- Maximum image count

Exact limits live in:

```text
specs/implementation/validation.md
```

Do not rely only on browser validation for security-sensitive constraints.

---

# 16. Image Transformations

Use Cloudinary transformations where useful for:

- Feed thumbnails
- Avatars
- Story covers
- Responsive images
- Reduced bandwidth

Do not always load the original full-resolution asset when a smaller representation is sufficient.

---

# 17. Database Consistency

Cloudinary and Firestore are separate systems.

Operations may partially fail.

Implementation must consider cases such as:

```text
upload succeeded
Firestore write failed
```

and:

```text
Firestore delete succeeded
Cloudinary delete failed
```

Critical flows should minimize orphaned assets and broken references.

---

# 18. Orphaned Assets

Uploads should not create permanent unused assets unnecessarily.

Where practical, application workflows should support cleanup of abandoned uploads.

A cleanup mechanism may be introduced later if orphaned assets become a meaningful issue.

---

# 19. User Avatar

Canonical folder:

```text
vucdem/avatars/{uid}/
```

Users may modify only their own avatar through the application.

---

# 20. Post Assets

Canonical folder:

```text
vucdem/posts/{postId}/
```

Possible contents:

```text
cover
image-1
image-2
...
```

The number of Post images is defined by validation specifications.

---

# 21. Story Assets

Canonical folder:

```text
vucdem/stories/{storyId}/
```

Story cover:

```text
vucdem/stories/{storyId}/cover
```

Chapter audio uses:

```text
vucdem/stories/{storyId}/chapters/{chapterId}/audio
```

Cloudinary represents audio as `resource_type=video`. The authenticated browser requests a signed
target from SvelteKit, then uploads directly to Cloudinary's video endpoint. The server selects the
public ID and allowed formats and verifies Story ownership; the API secret is never returned to the
browser. Deletion and replacement use the same trusted ownership/context checks and video resource
type.

Do not store Chapter body text in Cloudinary.

---

# 22. Community Assets

Canonical folder:

```text
vucdem/communities/{communityId}/
```

Expected media:

```text
icon
banner
```

Modification requires Community management permission.

---

# 23. Source of Truth

Security details:

```text
specs/security/cloudinary-security.md
```

API contract:

```text
specs/api/cloudinary-sign.md
specs/api/cloudinary-delete.md
```

Validation:

```text
specs/implementation/validation.md
```
