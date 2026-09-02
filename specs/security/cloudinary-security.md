# Cloudinary Security

- All managed media is under `vucdem/`; Firebase Storage is forbidden.
- Sign and delete endpoints require a Firebase ID token verified by Firebase Admin with revocation checking.
- The browser selects only a documented upload kind and resource identifier. The server constructs the final public ID.
- Signed parameters bind owner UID and asset kind into Cloudinary context.
- Existing Firestore documents must be owned by the caller; Community assets always require an existing owned Community.
- Preallocated Post/Story IDs may upload before document creation with overwrite disabled.
- Deletion checks namespace, application ownership, and immutable signed Cloudinary owner context.
- Only `PUBLIC_CLOUDINARY_CLOUD_NAME` is public. API secret and Firebase Admin credentials remain server-only.
- MIME type and file-size checks run before upload; Cloudinary receives only `image` resource uploads.
