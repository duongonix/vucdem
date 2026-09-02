# User Profile API

## GET `/api/users/{username}`

Publicly resolves `usernames/{normalizedUsername}` then `users/{uid}`. Returns only public profile fields; account status and timestamps are omitted.

## PATCH `/api/users/{username}`

Requires a Firebase ID token verified by Firebase Admin. The resolved User UID must equal the token UID. Accepted body:

```typescript
{
	displayName: string;
	bio: string;
	avatar: CloudinaryAsset | null;
}
```

If present, avatar `publicId` must equal `vucdem/avatars/{uid}/avatar`. The endpoint ignores/rejects any attempt to supply trusted fields because the strict schema accepts only the three mutable fields.

The URL must be an HTTPS Cloudinary delivery URL under the application's
configured cloud name; a matching-looking public ID paired with an arbitrary URL
is rejected.
