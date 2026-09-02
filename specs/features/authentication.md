# Authentication

This document defines the authentication behavior of vucdem.

---

# 1. Goal

Authentication allows users to create an account, sign in, maintain an application profile, and access authenticated features.

vucdem uses:

- Firebase Authentication
- Cloud Firestore User profiles

Firebase Authentication is the canonical authentication system.

---

# 2. MVP Authentication Methods

The MVP supports:

```text
Google
Email + Password
```

Do not implement custom authentication or password storage.

Future providers may be added later.

---

# 3. Routes

Canonical authentication routes:

```text
/auth/login
/auth/register
```

Optional future routes:

```text
/auth/forgot-password
```

The exact implementation may use pages, dialogs, or both, but these routes remain valid direct-entry surfaces.

---

# 4. Authentication States

The application must distinguish between:

```text
loading
authenticated
unauthenticated
```

Do not render authenticated-only UI as if the user were logged out while Firebase is still initializing.

---

# 5. Guest

A Guest is an unauthenticated visitor.

Guests may:

- Browse the Home Feed
- Read published Posts
- Read published Stories
- Read published Chapters
- Read public Comments
- View public profiles
- View Communities
- Use public discovery features

Guests cannot perform authenticated actions.

---

# 6. Authenticated Actions

Authentication is required for:

- Creating Posts
- Creating Stories
- Creating Chapters
- Editing owned content
- Commenting
- Replying
- Voting
- Bookmarking
- Following Users
- Following Stories
- Reporting content
- Managing profile
- Viewing private Notifications

---

# 7. Guest Interaction

When a Guest attempts an authenticated action, the UI must provide a clear authentication path.

Examples:

```text
Guest clicks Upvote
→ request login
```

```text
Guest clicks Bookmark
→ request login
```

```text
Guest opens /write
→ redirect to login
```

The application must not silently ignore the action.

---

# 8. Email Registration

Registration form should contain:

```text
Username
Display name
Email
Password
Confirm password
```

Exact validation limits are defined in:

```text
specs/implementation/validation.md
```

---

# 9. Email Registration Flow

```text
User opens /auth/register
        ↓
Enter registration information
        ↓
Client validation
        ↓
Check/reserve username
        ↓
Firebase Authentication
createUserWithEmailAndPassword
        ↓
Receive Firebase UID
        ↓
Create users/{uid}
        ↓
Authentication state updates
        ↓
Redirect into application
```

The implementation must handle partial failures safely.

---

# 10. Username Reservation

Usernames are unique.

Canonical reservation:

```text
usernames/{normalizedUsername}
```

Registration must not use only:

```text
query username
→ if missing
→ create User later
```

because concurrent registrations could claim the same username.

Use a transaction or trusted atomic workflow.

---

# 11. Username Normalization

Username uniqueness operates on:

```text
usernameNormalized
```

Example:

```text
Nocturne
→ nocturne
```

Normalization must be deterministic.

Validation rules belong in:

```text
specs/implementation/validation.md
```

---

# 12. Initial User Document

New Users should receive a Firestore document at:

```text
users/{uid}
```

Initial conceptual values:

```text
username = selected username
usernameNormalized = normalized username
displayName = selected display name
avatar = null
bio = ""
role = "user"
status = "active"

followersCount = 0
followingCount = 0
postCount = 0
storyCount = 0

createdAt = trusted timestamp
updatedAt = trusted timestamp
```

The client must not be allowed to create itself as:

```text
moderator
admin
```

---

# 13. Email Login

Login form:

```text
Email
Password
```

Flow:

```text
User
 ↓
Submit credentials
 ↓
Firebase Authentication
 ↓
Success
 ↓
Load users/{uid}
 ↓
Authenticated application
```

---

# 14. Google Login

Flow:

```text
User clicks Continue with Google
        ↓
Firebase Google provider
        ↓
Authentication succeeds
        ↓
Receive Firebase User
        ↓
Check users/{uid}
       / \
 exists  missing
   │       │
   │       ↓
   │   Create application profile
   │       │
   └───┬───┘
       ↓
Authenticated application
```

---

# 15. First Google Login

Google provides authentication identity but vucdem still requires application profile data.

If the User does not yet have a Firestore profile, the application must create one.

A unique username is still required.

The onboarding flow may request a username after Google authentication.

Suggested flow:

```text
Google authentication
        ↓
No users/{uid}
        ↓
Choose username
        ↓
Reserve username
        ↓
Create profile
        ↓
Continue
```

Do not automatically assume the Google display name is a valid unique username.

---

# 16. Existing Google User

If:

```text
users/{uid}
```

already exists, do not create another profile.

Load the existing application User.

---

# 17. Authentication State Store

Authentication state should be centralized.

Canonical location:

```text
src/lib/stores/auth.svelte.ts
```

Conceptual state:

```typescript
type AuthState = {
	initialized: boolean;
	firebaseUser: FirebaseUser | null;
	user: User | null;
};
```

The exact implementation may differ while preserving the same behavior.

---

# 18. Authentication Initialization

Application startup:

```text
Firebase initializes
      ↓
Auth listener starts
      ↓
Auth state resolved
      ↓
If authenticated:
load users/{uid}
      ↓
Mark auth initialized
```

Avoid creating independent Auth listeners throughout the component tree.

---

# 19. Protected Routes

Routes requiring authentication include:

```text
/write
/notifications
/settings
```

Story management routes also require authentication and ownership.

Admin routes require appropriate role authorization.

---

# 20. Redirect Behavior

When an unauthenticated User opens a protected route:

```text
Protected route
     ↓
Authentication required
     ↓
/auth/login
```

Where practical, preserve the intended destination.

Example:

```text
/write
→ /auth/login?redirect=/write
```

After successful login:

```text
→ /write
```

Do not allow arbitrary external redirect URLs.

Only safe internal redirects should be accepted.

---

# 21. Already Authenticated

If an authenticated User opens:

```text
/auth/login
/auth/register
```

the application may redirect them to:

```text
/
```

or the valid requested internal redirect target.

---

# 22. Logout

Logout flow:

```text
User clicks Logout
      ↓
Firebase signOut
      ↓
Clear authenticated application state
      ↓
Remove private UI state
      ↓
Unauthenticated state
```

After logout, the User may remain on public pages.

If currently on a protected page, redirect to a public route.

---

# 23. Password Reset

Email/password Users should be able to request Firebase password reset.

Use Firebase Authentication's password reset mechanism.

Do not create custom password reset tokens.

---

# 24. Authentication Errors

Firebase error codes must be converted into understandable UI messages.

Examples:

```text
Invalid email or password
Email already registered
Password too weak
Network error
Google sign-in cancelled
Username already taken
```

Do not display raw Firebase error objects to normal users.

---

# 25. Loading State

During authentication operations:

- Disable duplicate submissions
- Show progress state
- Prevent repeated Google login requests
- Preserve form values where appropriate

---

# 26. Security

Never store:

```text
password
passwordHash
refreshToken
Firebase access token
```

inside normal Firestore User documents.

Never trust client-provided:

```text
role
status
uid
isAdmin
isModerator
```

for authorization.

---

# 27. Roles

Authenticated application roles:

```text
user
moderator
admin
```

Guest is represented by unauthenticated state.

Detailed role behavior:

```text
specs/product/user-roles.md
```

---

# 28. Suspended and Banned Users

Authentication success does not necessarily mean the account is permitted to perform all application actions.

After authentication, application authorization may consider:

```text
status
```

Possible states:

```text
active
suspended
banned
```

Exact restrictions are defined by moderation/security specifications.

---

# 29. Profile Data

Firebase Authentication and Firestore have different responsibilities.

Firebase Authentication:

```text
identity
provider
credentials
authentication email
```

Firestore:

```text
username
displayName
avatar
bio
role
status
application counters
```

---

# 30. Acceptance Criteria

Authentication is complete for MVP when:

- User can register using email/password
- User can log in using email/password
- User can authenticate using Google
- First-time Google User can create application profile
- Username uniqueness is enforced
- Firestore User profile is created correctly
- Authentication persists through normal page navigation
- Application knows when auth initialization is complete
- Guest cannot access protected actions
- Protected routes redirect Guests
- User can log out
- Password reset is available for email/password accounts
- Normal Users cannot assign themselves privileged roles
- Authentication errors have usable UI states

---

# 31. Out of Scope

Unless explicitly added later:

- Facebook login
- GitHub login
- Apple login
- Phone authentication
- SMS authentication
- Multi-factor authentication
- Custom password authentication
- Anonymous Firebase accounts
- Passkeys

---

# 32. Related Specifications

Architecture:

```text
specs/architecture/auth-architecture.md
```

User schema:

```text
specs/database/users.md
```

Authorization:

```text
specs/security/authorization.md
```

Validation:

```text
specs/implementation/validation.md
```
