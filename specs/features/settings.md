# Settings

`/settings` is an authenticated account surface. It reuses the trusted profile update API
for `displayName`, `bio`, and Cloudinary avatar metadata. Username remains immutable in MVP
because changing it requires an atomic reservation migration.

The page displays the Firebase Authentication email and provider list. Email/password Users
can request a Firebase password-reset email; Google-only Users are not shown an unsupported
password control. Logout is always available. Account deletion is deferred until a complete
Firestore and Cloudinary cleanup policy exists.

## Current UI contract

Settings uses the shared AppShell at `/settings`, including the global header and left navigation.
The global right sidebar is hidden so account forms have a calm, readable content width. It does
not introduce a second Settings navigation rail.

Account uses the authenticated Firebase email and the persisted User display name, avatar, bio,
and creation time. Display name, bio, and Cloudinary avatar editing remain real persisted actions.
Password reset remains available only for password-provider accounts; the security section shows
the verified email and provider and explains the limitation for Google-only accounts. Logout is
real on desktop and mobile. The screen intentionally omits notification, appearance, device,
privacy, language, data, about, and other presentation-only settings until they have real behavior
or persistence.
