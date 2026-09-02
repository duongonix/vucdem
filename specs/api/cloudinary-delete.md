# POST /api/cloudinary/delete

Deletes an application-managed Cloudinary image through a trusted server operation.

## Authentication and request

Requires a verified Firebase ID token.

```json
{ "publicId": "vucdem/posts/postId/image-1" }
```

Only canonical avatar, Post, Story, and Community namespaces are accepted. Avatar ownership is derived from the UID path. Other assets require both matching Firestore resource ownership when the resource exists and matching signed Cloudinary `ownerId` context. This supports safe abandoned-upload cleanup without accepting arbitrary assets.

The server calls Cloudinary with the API secret and returns `{ "deleted": true }` for successful or already-absent assets. The secret never reaches the browser.
