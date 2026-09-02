# Ownership Rules

- Users edit only their own public profile fields.
- Post and Story authorship is immutable and owner mutations re-read the target document.
- Chapter ownership derives from its parent Story.
- Comment authors may edit/remove only published Comments they own.
- Bookmark, follow, vote, and notification identities derive from the verified Firebase UID.
- Moderator/admin privileges derive from the persisted active User document.

Trusted counters, timestamps, moderation metadata, roles, statuses outside documented state
transitions, and Cloudinary public IDs cannot be supplied arbitrarily by the browser.
