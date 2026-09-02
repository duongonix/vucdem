# User Roles

This document defines the canonical user roles and their high-level permissions in vucdem.

Detailed authorization behavior is defined under:

```text
specs/security/
```

---

# 1. Roles

vucdem has four application roles:

```text
guest
user
moderator
admin
```

Conceptually:

```text
guest
  │
  ▼
user
  │
  ▼
moderator
  │
  ▼
admin
```

This hierarchy is conceptual.

Implementation must not assume every higher role automatically receives permissions without checking the security specification.

---

# 2. Guest

A Guest is not authenticated.

Firebase state:

```text
request.auth == null
```

Guests may access public parts of the platform.

Typical Guest permissions:

- View published Posts
- View published Stories
- Read published Chapters
- Read public Comments
- View public User profiles
- View Communities
- Browse public feeds
- Use public discovery features

Guests cannot:

- Create Posts
- Create Stories
- Create Comments
- Reply
- Vote
- Bookmark
- Follow
- Join Communities where authentication is required
- Submit Reports
- Access private account data
- Access moderation tools
- Access admin tools

When a Guest attempts an authenticated action, the UI should request authentication.

---

# 3. User

A User is an authenticated standard account.

Firebase state:

```text
request.auth != null
```

Application role:

```text
user
```

Users receive all public Guest capabilities plus authenticated interaction features.

Typical User permissions:

- Create Posts
- Edit own Posts
- Delete or archive own Posts according to specification
- Create Stories
- Edit own Stories
- Create Chapters for own Stories
- Edit own Chapters
- Publish own content
- Comment
- Reply
- Upvote
- Downvote
- Bookmark
- Follow Users
- Follow Stories
- Join supported Communities
- Submit Reports
- Manage own profile
- Manage own account settings

Users cannot:

- Modify another User's content without moderation permission
- Change their own role arbitrarily
- Change trusted counters arbitrarily
- Access moderation tools
- Access admin tools
- Modify another User's private information

---

# 4. Moderator

A Moderator is an authenticated User with moderation privileges.

Application role:

```text
moderator
```

Moderators retain normal User capabilities.

Additional permissions may include:

- Review Reports
- Hide violating Posts
- Hide violating Comments
- Hide violating Stories
- Moderate Community content
- Restore content when allowed
- Apply moderation actions defined by policy

Moderators must not automatically receive unrestricted access to:

- Server secrets
- Firebase configuration secrets
- Cloudinary secrets
- User authentication credentials
- Platform infrastructure

Moderation privileges must be explicitly defined.

---

# 5. Admin

An Admin is an authenticated User with platform-level administrative privileges.

Application role:

```text
admin
```

Admins may perform platform management actions defined by the security and administration specifications.

Possible capabilities include:

- Manage Reports
- Moderate Posts
- Moderate Stories
- Moderate Comments
- Manage Communities
- Manage moderation state
- Manage supported user roles
- Access administrative dashboards

Admin access must still be enforced server-side or through trusted Firebase authorization.

Frontend state alone must never grant admin permissions.

---

# 6. Author

Author is not a role.

An Author is simply a User who created content.

For example:

```text
Post.authorId = user UID
Story.authorId = user UID
```

A normal User can be an Author.

Do not add:

```text
role = "author"
```

unless the product model is explicitly changed.

---

# 7. Reader

Reader is not a role.

Reader describes user behavior.

A Guest can be a Reader.

A User can be a Reader.

A Moderator can be a Reader.

An Admin can be a Reader.

Do not store:

```text
role = "reader"
```

---

# 8. Ownership

Ownership is separate from role.

A User owns a resource when the resource's ownership field references that User.

Example:

```text
post.authorId == uid
```

Ownership may grant permissions such as:

- Edit
- Delete
- Publish
- Manage

However, ownership does not allow the owner to modify protected fields arbitrarily.

Protected fields may include:

- `authorId`
- `createdAt`
- `voteScore`
- `commentCount`
- `viewCount`

Exact behavior is defined by the database and security specifications.

---

# 9. Role Storage

The canonical User document may contain:

```text
role
```

Allowed values:

```text
user
moderator
admin
```

Guest is not stored as a Firestore role because Guests do not have authenticated User documents.

Conceptually:

```text
Unauthenticated → guest

Authenticated + role=user
→ user

Authenticated + role=moderator
→ moderator

Authenticated + role=admin
→ admin
```

---

# 10. Role Modification

A normal User must never be able to modify their own role.

This operation must be rejected:

```text
user
→ updates role
→ admin
```

Role changes must only occur through trusted administrative mechanisms.

---

# 11. Permission Matrix

| Action                      | Guest | User      | Moderator     | Admin          |
| --------------------------- | ----- | --------- | ------------- | -------------- |
| Read published Post         | Yes   | Yes       | Yes           | Yes            |
| Read published Story        | Yes   | Yes       | Yes           | Yes            |
| Read published Chapter      | Yes   | Yes       | Yes           | Yes            |
| Read public Comments        | Yes   | Yes       | Yes           | Yes            |
| View public profile         | Yes   | Yes       | Yes           | Yes            |
| Create Post                 | No    | Yes       | Yes           | Yes            |
| Create Story                | No    | Yes       | Yes           | Yes            |
| Create Chapter              | No    | Own story | Own story     | Own story      |
| Comment                     | No    | Yes       | Yes           | Yes            |
| Reply                       | No    | Yes       | Yes           | Yes            |
| Vote                        | No    | Yes       | Yes           | Yes            |
| Bookmark                    | No    | Yes       | Yes           | Yes            |
| Follow User                 | No    | Yes       | Yes           | Yes            |
| Follow Story                | No    | Yes       | Yes           | Yes            |
| Submit Report               | No    | Yes       | Yes           | Yes            |
| Edit own content            | No    | Yes       | Yes           | Yes            |
| Edit another user's content | No    | No        | Limited       | Administrative |
| Moderate content            | No    | No        | Yes           | Yes            |
| Review Reports              | No    | No        | Yes           | Yes            |
| Manage Communities          | No    | Limited   | Limited       | Yes            |
| Change user roles           | No    | No        | No by default | Yes            |
| Admin dashboard             | No    | No        | No            | Yes            |

The matrix is high-level.

More specific security specifications take precedence.

---

# 12. Authentication Is Not Authorization

Authentication answers:

```text
Who is this user?
```

Authorization answers:

```text
What is this user allowed to do?
```

Being authenticated does not automatically grant access to every Firestore operation.

Security must consider:

- Authentication
- Role
- Ownership
- Resource state
- Allowed field changes

---

# 13. Frontend Role Checks

Frontend role checks are allowed for UI behavior.

Examples:

- Hide admin navigation
- Disable moderation buttons
- Show login dialog
- Display management controls

However, frontend checks are not security boundaries.

All sensitive operations must also be protected by:

- Firestore Security Rules
- Trusted SvelteKit server logic
- Firebase trusted mechanisms

as appropriate.

---

# 14. Moderator Scope

The initial architecture supports the global `moderator` role.

Future versions may introduce community-specific moderators.

For example:

```text
communities/{communityId}/moderators/{uid}
```

This is not required unless explicitly added to the relevant feature specification.

Do not prematurely build a complex moderator hierarchy during the MVP.

---

# 15. Banned or Suspended Users

Account moderation states are separate from roles.

Future user states may include:

```text
active
suspended
banned
```

Do not represent suspension by changing the user role.

For example, avoid:

```text
role = "banned"
```

because `banned` is an account state, not a permission role.

Exact account moderation behavior should be defined separately before implementation.

---

# 16. Security Principle

Use least privilege.

Users should receive only the permissions necessary for their role and ownership context.

Never trust client-provided values for:

- Role
- Ownership
- Trusted counters
- Moderation privileges

The final implementation must follow the detailed specifications under:

```text
specs/security/
```
