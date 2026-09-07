# Profiles

## Goal and route

Public profiles live at `/u/{username}` and expose avatar, display name, username, bio, role badge where relevant, and public counters. Username reservation resolves the normalized route segment to Firebase UID before reading `users/{uid}`.

## Public behavior

Profiles are readable without authentication. Account `status`, authentication email, tokens, and other private identity data are never returned. Missing reservations or User documents render not found.

## Owner editing

Authenticated owners may update only `displayName`, `bio`, and `avatar`. Username changes are deferred because they require a separate atomic reservation migration. Role, account status, ownership, counters, and timestamps are server-controlled.

Avatar upload uses the signed Cloudinary `avatar` context and canonical `vucdem/avatars/{uid}/avatar` public ID. Replacement uploads first and then updates Firestore. Removal clears Firestore first and performs trusted Cloudinary cleanup afterward so profile data never points at a deliberately deleted asset.

## Owner reading history

The owner sees a **Lịch sử** tab beside their Posts, Stories, and Bookmarks. It shows at most the
10 Stories most recently read, sourced from the private reading-progress records, with the latest
Chapter and saved percentage. Each item links directly back to that Chapter. Visitors cannot see
this tab or its data.

## States and acceptance

Public pages handle loading, not found, and provider errors through SvelteKit. Editing disables duplicate saves, preserves input on failure, reports upload progress, and works in the responsive editorial shell. Only the owner sees editing controls.
