# Moderation Rules

Moderators and admins may read Reports and hide/remove/restore supported content through
trusted endpoints. Admin-only mutations manage account role/status and all resource states.
Every request verifies an ID token and re-reads the active persisted role. Normal Users have
no direct Firestore path to moderation fields.
