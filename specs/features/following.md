# Following Users

## Goal and scope

Phase 16 implements User-to-User following. Story following remains a separate relationship for later Story surfaces.

## Data and trusted mutation

The acting User's `users/{uid}/following/{targetUid}` and target's `users/{targetUid}/followers/{uid}` documents are created or deleted together in a Firestore transaction. That transaction updates `followingCount` and `followersCount` exactly once based on the existing canonical following document.

`GET`, `POST`, `DELETE`, and `PATCH /api/users/{username}/follow` load and mutate state. The verified Firebase UID is always the actor. Self-follow and inactive accounts are rejected. `PATCH` accepts only a boolean `notificationsEnabled` and requires an existing User-follow relation.

## UI behavior

Public profiles show a Follow button only when the viewer is not the owner. It loads current state, updates optimistically, rolls back on failure, and refreshes the visible follower counter from the trusted response. Once following, a neighbouring accessible bell control toggles author activity notifications. The control defaults off for a new follow. Guests are routed to login.

When the target first publishes a Post or Story, or a new Chapter is approved, each follower who has enabled this setting receives a private author-activity notification. Existing Story followers receive the existing `story_update` notification for Chapters instead; a User who follows both a Story and its author never receives a duplicate chapter notification.

## Acceptance criteria

- Duplicate Follow/Unfollow requests do not duplicate counter changes.
- Both directional documents remain symmetric.
- Self-follow is impossible at the trusted boundary.
