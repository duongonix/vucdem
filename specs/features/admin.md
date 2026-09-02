# Admin

`/admin` is restricted to active persisted `admin` accounts. It provides report management
and bounded lists of Users, Posts, Stories, Comments, and Communities.

Admins may change another User's role between user/moderator/admin, change account status
between active/suspended/banned, and update supported content moderation states. Every
mutation requires a Firebase ID token and server-side admin lookup. Self role/status changes

Admins may grant or remove a User's blue verification badge. The trusted mutation updates `users/{uid}.verify` and propagates `authorVerified` to existing Posts, Stories and Comments so old content reflects the current verification state. Verification does not grant permissions and is independent from role.

The `/admin` page also contains a **Danh mục** panel for the shared Post taxonomy. Admins can add categories, edit their display name, description, order and active state, and delete unused categories. Stable category IDs cannot be renamed. Categories referenced by Posts must be deactivated rather than deleted.
are rejected to reduce accidental lockout, and the UI requests confirmation before writes.

The MVP panel loads at most 50 documents per resource; advanced filtering and bulk actions
are deferred.
