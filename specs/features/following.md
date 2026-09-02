# Following Users

## Goal and scope

Phase 16 implements User-to-User following. Story following remains a separate relationship for later Story surfaces.

## Data and trusted mutation

The acting User's `users/{uid}/following/{targetUid}` and target's `users/{targetUid}/followers/{uid}` documents are created or deleted together in a Firestore transaction. That transaction updates `followingCount` and `followersCount` exactly once based on the existing canonical following document.

`GET`, `POST`, and `DELETE /api/users/{username}/follow` load and mutate state. The verified Firebase UID is always the actor. Self-follow and inactive accounts are rejected.

## UI behavior

Public profiles show a Follow button only when the viewer is not the owner. It loads current state, updates optimistically, rolls back on failure, and refreshes the visible follower counter from the trusted response. Guests are routed to login.

## Acceptance criteria

- Duplicate Follow/Unfollow requests do not duplicate counter changes.
- Both directional documents remain symmetric.
- Self-follow is impossible at the trusted boundary.
