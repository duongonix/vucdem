# Users

This document defines the canonical Firestore schema for vucdem User documents.

---

# 1. Purpose

A User document stores application profile and account metadata for an authenticated Firebase User.

Firebase Authentication remains the canonical authentication identity.

Firestore stores application-specific User data.

---

# 2. Firestore Path

```text
users/{uid}
```

where:

```text
uid = Firebase Authentication UID
```

The document ID must match the Firebase UID.

---

# 3. TypeScript Model

Canonical conceptual model:

```typescript
type UserRole = 'user' | 'moderator' | 'admin';

type UserStatus = 'active' | 'suspended' | 'banned';

type User = {
	id: string;

	username: string;
	usernameNormalized: string;

	displayName: string;
	avatar: CloudinaryAsset | null;
	bio: string;

	role: UserRole;
	status: UserStatus;
	verify: boolean;

	followersCount: number;
	followingCount: number;
	postCount: number;
	storyCount: number;

	createdAt: Timestamp;
	updatedAt: Timestamp;
};
```

`id` is normally derived from the Firestore document ID and does not need to be stored as a document field unless implementation specifically requires it.

---

# 4. Canonical Document Shape

Example:

```json
{
	"username": "nocturne",
	"usernameNormalized": "nocturne",

	"displayName": "Nocturne",

	"avatar": {
		"url": "https://res.cloudinary.com/example/image/upload/vucdem/avatars/user123/avatar.webp",
		"publicId": "vucdem/avatars/user123/avatar"
	},

	"bio": "Tôi viết những câu chuyện không nên đọc sau nửa đêm.",

	"role": "user",
	"status": "active",
	"verify": false,

	"followersCount": 1240,
	"followingCount": 83,
	"postCount": 24,
	"storyCount": 6,

	"createdAt": "Timestamp",
	"updatedAt": "Timestamp"
}
```

---

# 5. Fields

## username

Type:

```text
string
```

Required:

```text
Yes
```

Purpose:

Public human-readable account identifier.

Used in routes such as:

```text
/u/nocturne
```

Requirements:

- Must be unique
- Must be normalized before uniqueness checking
- Must follow validation rules
- Must not be treated as the canonical security identity

Canonical security identity remains the Firebase UID.

---

# 6. usernameNormalized

Type:

```text
string
```

Required:

```text
Yes
```

Purpose:

Normalized username used for uniqueness checks and lookup.

Example:

```text
username = Nocturne
usernameNormalized = nocturne
```

The exact normalization rules are defined in validation specifications.

---

# 7. displayName

Type:

```text
string
```

Required:

```text
Yes
```

Purpose:

Human-readable name displayed in the UI.

Unlike `username`, display names do not need to be unique.

Example:

```text
Nocturne
```

---

# 8. avatar

Type:

```text
CloudinaryAsset | null
```

Required:

```text
Yes
```

Default:

```text
null
```

Shape:

```typescript
type CloudinaryAsset = {
	url: string;
	publicId: string;
};
```

Cloudinary folder:

```text
vucdem/avatars/{uid}/
```

If `avatar == null`, the UI should render the default application avatar state.

---

# 9. bio

Type:

```text
string
```

Required:

```text
Yes
```

Default:

```text
""
```

Purpose:

Public profile description.

Maximum length is defined under:

```text
specs/implementation/validation.md
```

---

# 10. role

Type:

```text
'user' | 'moderator' | 'admin'
```

Required:

```text
Yes
```

Default for new users:

```text
user
```

A normal User must never be able to change this field arbitrarily.

Role changes require trusted administrative authorization.

Guest is not stored here.

---

# 11. status

Type:

```text
'active' | 'suspended' | 'banned'
```

Required:

```text
Yes
```

Default:

```text
active
```

Purpose:

Represents account moderation state separately from the User role.

Do not use values such as:

```text
role = "banned"
```

---

# 12. followersCount

## verify

Type: `boolean`. Required with default `false`. This is a trusted account-curation field. Only a persisted active admin may change it through the trusted admin endpoint. Public profile responses may expose it so the UI can render the blue verification badge. Content author snapshots use `authorVerified` and are synchronized when an admin changes verification.

Type:

```text
number
```

Required:

```text
Yes
```

Default:

```text
0
```

Integer:

```text
Yes
```

Minimum:

```text
0
```

Trusted denormalized counter.

Represents Users following this User.

---

# 13. followingCount

Type:

```text
number
```

Required:

```text
Yes
```

Default:

```text
0
```

Trusted denormalized counter.

Represents how many Users this User follows.

---

# 14. postCount

Type:

```text
number
```

Required:

```text
Yes
```

Default:

```text
0
```

Trusted denormalized counter representing the number of relevant Posts created by the User.

The exact counting policy for drafts/removed content is defined by feature specifications.

---

# 15. storyCount

Type:

```text
number
```

Required:

```text
Yes
```

Default:

```text
0
```

Trusted denormalized counter representing relevant Stories created by this User.

---

# 16. createdAt

Type:

```text
Firestore Timestamp
```

Required:

```text
Yes
```

Must use trusted server time during account profile creation.

The User must not be able to modify this field after creation.

---

# 17. updatedAt

Type:

```text
Firestore Timestamp
```

Required:

```text
Yes
```

Updated when mutable profile data changes.

---

# 18. Fields Not Stored

Do not store authentication secrets in User documents.

Never store:

```text
password
passwordHash
passwordSalt
Firebase access tokens
refresh tokens
Cloudinary API secret
```

Firebase Authentication handles credentials.

---

# 19. Email

Email does not need to be duplicated into the public User document unless a specific feature requires it.

Firebase Authentication remains the canonical source for authentication email.

If application-private email metadata is introduced later, it must not accidentally become public through profile reads.

---

# 20. Username Reservation

Username uniqueness uses:

```text
usernames/{normalizedUsername}
```

Example:

```json
{
	"uid": "firebase-user-uid",
	"username": "Nocturne",
	"createdAt": "Timestamp"
}
```

Document ID:

```text
nocturne
```

Username creation/change must use atomic logic.

Conceptual transaction:

```text
check usernames/nocturne
        ↓
does not exist
        ↓
create reservation
        ↓
update users/{uid}
```

---

# 21. Username Changes

If username changes are allowed:

```text
old username
    ↓
reserve new username
    ↓
update User
    ↓
release old username
```

This process must be atomic or use a trusted workflow that cannot accidentally assign one username to multiple Users.

The exact username-change feature may be deferred from MVP.

---

# 22. Followers

Follower relationships are stored under:

```text
users/{uid}/followers/{followerUid}
```

Example:

```json
{
	"createdAt": "Timestamp"
}
```

The document ID represents the follower UID.

Do not store an unbounded followers array in the User document.

---

# 23. Following

Following relationships are stored under:

```text
users/{uid}/following/{targetUid}
```

Example:

```json
{
	"createdAt": "Timestamp"
}
```

The document ID represents the followed User UID.

---

# 24. Following Invariants

When User A follows User B:

```text
users/A/following/B
```

and:

```text
users/B/followers/A
```

should represent the same relationship.

Counters should become:

```text
A.followingCount += 1
B.followersCount += 1
```

Creation and deletion behavior must avoid duplicate counter increments.

Exact mutation behavior is defined in:

```text
specs/features/following.md
```

---

# 25. Self Follow

A User must not be able to follow themselves.

Reject:

```text
currentUid == targetUid
```

---

# 26. Bookmarks

Private bookmarks are stored under:

```text
users/{uid}/bookmarks/{bookmarkId}
```

Bookmarks are private by default.

Detailed schema is defined in:

```text
specs/database/bookmarks.md
```

---

# 27. Public Profile

Public profile route:

```text
/u/{username}
```

Public profile may expose:

- Avatar
- Display name
- Username
- Bio
- Followers count
- Following count where product allows
- Post count
- Story count
- Published Posts
- Published Stories

Private account data must not be exposed.

---

# 28. Public User Queries

Common lookup:

```text
usernameNormalized == normalizedUsername
```

However, when `usernames/{normalizedUsername}` exists, it can be used to resolve:

```text
username
→ uid
→ users/{uid}
```

This avoids relying on broad username queries.

---

# 29. Author Identity in Content

Posts and Stories reference the User using:

```text
authorId
```

where:

```text
authorId = uid
```

Content may additionally contain denormalized display fields such as:

```text
authorName
authorUsername
authorAvatarUrl
```

These fields do not replace `authorId`.

---

# 30. Profile Updates

Normal Users may update permitted profile fields such as:

```text
displayName
avatar
bio
```

Username changes depend on the username reservation workflow.

Normal Users must not arbitrarily update:

```text
role
status
followersCount
followingCount
postCount
storyCount
createdAt
```

---

# 31. Account Status

## active

Normal application access.

## suspended

Temporary restriction.

Exact restrictions are defined in moderation/security specifications.

## banned

Platform access may be significantly restricted.

The exact banned-account behavior must be enforced by trusted authorization.

---

# 32. Read Permission

Public profile data may be readable publicly.

Security Rules must prevent accidental exposure if private fields are later added to the same document.

If significant private account metadata is introduced, consider separating public and private data instead of weakening security assumptions.

---

# 33. Create Permission

User profile creation is allowed only for the authenticated UID it represents.

Conceptually:

```text
request.auth.uid == document uid
```

Initial role must not be client-selectable beyond permitted defaults.

Initial counters must be trusted defaults.

---

# 34. Update Permission

A normal User may update only allowed profile fields.

Field-level restrictions must prevent updates to trusted fields.

---

# 35. Delete Permission

Direct client deletion of User profile documents should not be treated as normal account deletion.

Account deletion affects:

- Firebase Authentication
- User document
- Username reservation
- Content
- Relationships
- Cloudinary avatar
- Notifications
- Reports

A dedicated account deletion workflow should be specified before implementation.

---

# 36. Indexes

Potential User queries include:

```text
usernameNormalized == value
```

and future ranking/discovery queries.

Exact required indexes must be documented in:

```text
specs/database/indexes.md
```

---

# 37. Validation

Validation rules for:

- Username
- Display name
- Bio
- Avatar

are defined in:

```text
specs/implementation/validation.md
```

UI components must not invent conflicting limits.

---

# 38. Source of Truth

User behavior:

```text
specs/features/profiles.md
specs/features/authentication.md
specs/features/following.md
```

Authorization:

```text
specs/security/
```

Authentication:

```text
specs/architecture/auth-architecture.md
```
