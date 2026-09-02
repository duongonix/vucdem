# Authentication Architecture

This document defines the authentication architecture of vucdem.

---

# 1. Authentication Provider

vucdem uses Firebase Authentication.

Firebase Authentication is the canonical source of authenticated identity.

---

# 2. Initial Providers

Supported MVP authentication methods:

```text
Google
Email + Password
```

Additional providers must not be introduced without a product or feature specification change.

---

# 3. User Identity

The canonical User ID is the Firebase Authentication UID.

```text
Firebase Auth UID
        ↓
users/{uid}
```

Do not generate a separate unrelated application User ID for authenticated Users.

---

# 4. User Document

Authenticated Users have a corresponding Firestore profile document.

Canonical path:

```text
users/{uid}
```

Firebase Authentication stores authentication identity.

Firestore stores application profile data.

Example separation:

```text
Firebase Auth
├── uid
├── email
├── provider
└── authentication credentials

Firestore User
├── username
├── displayName
├── avatar
├── bio
├── role
└── application counters
```

---

# 5. Registration Flow

Email/password registration:

```text
User
  ↓
Registration form
  ↓
Validate input
  ↓
Firebase Auth create user
  ↓
Create Firestore user profile
  ↓
Authenticated session
```

If profile creation fails after Auth account creation, the application must handle the partial state safely.

---

# 6. Google Login Flow

```text
User
  ↓
Google sign-in
  ↓
Firebase Authentication
  ↓
Receive authenticated User
  ↓
Check Firestore profile
  ↓
Create profile if first login
  ↓
Application session
```

Existing Users must not receive duplicate profile documents.

---

# 7. Authentication State

The frontend should expose an understandable authentication state.

Conceptually:

```text
loading
authenticated
unauthenticated
```

Authenticated state should include the current application User when available.

---

# 8. Auth Store

Authentication state may be centralized under:

```text
src/lib/stores/auth.svelte.ts
```

Do not create independent authentication listeners across many components.

---

# 9. Guest Access

Authentication is not required to read normal public content.

Guests may access:

- Published Posts
- Published Stories
- Published Chapters
- Public Comments
- Public profiles
- Communities
- Public feed

---

# 10. Authentication-Required Actions

Authentication is required for operations such as:

- Create Post
- Create Story
- Create Chapter
- Comment
- Reply
- Vote
- Bookmark
- Follow
- Report
- Manage profile

Exact permissions are defined in security specifications.

---

# 11. Login Prompt Behavior

When a Guest attempts an authenticated action, the application should redirect or prompt them to authenticate.

Do not silently fail without user feedback.

---

# 12. Authorization

Authentication and authorization are separate concerns.

Firebase Authentication proves identity.

Firestore Security Rules and trusted server logic determine permissions.

Example:

```text
Authenticated User
does not automatically mean
Admin
```

---

# 13. Roles

Application roles:

```text
user
moderator
admin
```

Guest is represented by absence of authentication.

Role data belongs to trusted application profile state.

Normal Users must not be allowed to arbitrarily modify their role.

---

# 14. Server Endpoints

SvelteKit server endpoints requiring authentication must verify authenticated identity using a trusted mechanism appropriate to the implementation.

Do not trust client-supplied fields such as:

```text
uid
role
isAdmin
isModerator
```

without verification.

---

# 15. Cloudinary Signing Authentication

Cloudinary signing endpoints should verify the User where the upload action requires authenticated ownership.

Example:

```text
User uploads avatar
→ must be authenticated
→ may upload only for own account
```

---

# 16. Email Verification

Email verification is not required for the base architecture unless explicitly introduced in the authentication feature specification.

Do not block all application access on verification unless specified.

---

# 17. Password Reset

Email/password Users should be able to use Firebase Authentication's password reset capabilities.

Do not implement custom password reset tokens.

---

# 18. Password Storage

Never store:

- Raw passwords
- Password hashes
- Password reset secrets

inside Firestore.

Firebase Authentication handles credentials.

---

# 19. Logout

Logout should:

1. Sign out from Firebase Authentication.
2. Clear application authentication state.
3. Remove private User state from the active UI.
4. Return the application to unauthenticated state.

---

# 20. Deleted Authentication Accounts

If an authentication account is removed, related Firestore profile and content cleanup must not be assumed to happen automatically.

Account deletion is a separate workflow that must be specified before implementation.

---

# 21. Username

Username is application profile data, not Firebase Authentication identity.

Conceptually:

```text
Firebase UID
→ permanent application identity

username
→ human-readable public identifier
```

Changing username must not change the User UID.

---

# 22. Profile Route

Canonical public profile route:

```text
/u/{username}
```

The URL uses username for readability.

Internal ownership and security should still use UID.

---

# 23. Source of Truth

Feature behavior:

```text
specs/features/authentication.md
```

User model:

```text
specs/database/users.md
```

Permissions:

```text
specs/security/
```
