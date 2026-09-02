# Bookmarks

## Goal and scope

Authenticated Users can privately save readable Posts and Stories. Phase 15 integrates the shared control into the Feed and Post Detail; Story surfaces consume it in their later UI phases.

## Data and API

The deterministic document ID is `{targetType}_{targetId}` at `users/{uid}/bookmarks/{bookmarkId}`. `GET`, `POST`, and `DELETE /api/bookmarks/{targetType}/{targetId}` load, add, and remove state. The server derives the owner from the verified Firebase token and never accepts a UID from the browser.

Creation verifies that a Post is `published` or a Story is `ongoing`, `completed`, or `hiatus`. Repeated create/delete calls are idempotent.

## UI and states

`BookmarkButton` supports compact and labelled forms, loads private state only for an authenticated User, updates optimistically, rolls back on failure, and sends Guests to login with a return route.

## Acceptance criteria

- State persists and is visible after refresh.
- Another User's bookmark path is never addressable through the API.
- Bookmark records contain only target identity and trusted creation time.
