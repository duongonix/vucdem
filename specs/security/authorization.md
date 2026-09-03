# Authorization

Trusted endpoints verify Firebase ID tokens. Mutating endpoints additionally load
`users/{uid}` and require `status = active` where application participation is involved.
Ownership is compared using Firebase UID, never username or frontend state.

Moderator/admin endpoints call the shared persisted-role guard. Only admins may mutate
User roles/statuses. Cloudinary signing and deletion validate canonical public IDs and
resource ownership server-side. Direct Firestore client access is denied.

Direct messages are server-mediated. Every conversation and message operation verifies that the
persisted User is active and that their Firebase UID belongs to the conversation `participantIds`.
The sender UID is always derived from the verified token, never accepted from request data.

Public discussion chat is also server-mediated. Guests may read published room messages, while
only active persisted Users may send. Author snapshots and timestamps are always server-derived.
