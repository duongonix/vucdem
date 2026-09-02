# POST /api/cloudinary/sign

Creates short-lived signed parameters for direct browser-to-Cloudinary image upload.

## Authentication

Send a Firebase ID token as `Authorization: Bearer <token>`. The server verifies it with Firebase Admin and never trusts a client UID.

## Request

```typescript
type UploadKind =
	| 'avatar'
	| 'post-thumbnail'
	| 'post-image'
	| 'story-cover'
	| 'story-audio'
	| 'community-icon'
	| 'community-banner';

type Request = {
	kind: UploadKind;
	resourceId?: string;
	chapterId?: string;
	slot?: number;
};
```

`resourceId` is required except for avatars; `slot` is required only for Post images. `chapterId`
is required for `story-audio`. The server determines the complete `vucdem/...` public ID and signs
`timestamp`, `public_id`, owner context, overwrite policy, cache invalidation, and allowed formats.
Story audio resolves only to `vucdem/stories/{storyId}/chapters/{chapterId}/audio` after verifying
the parent Story owner (or an authenticated preallocated Story ID). Existing resources require
matching `authorId`/`ownerId`.

## Response

Returns browser-safe `cloudName`, `apiKey`, `signature`, `resourceType`, and the exact signed upload
parameters. `CLOUDINARY_API_SECRET` is never returned. Images upload to the image endpoint; Story
audio uploads to Cloudinary's video endpoint (`resource_type=video`) because that is Cloudinary's
delivery resource type for audio. The browser retains the secure URL, exact public ID, duration,
format, and byte count.
