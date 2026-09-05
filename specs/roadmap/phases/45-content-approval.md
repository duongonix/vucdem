# Phase 45 — Content Approval

## Status

- [ ] Not started
- [ ] In progress
- [x] Completed

## Goal

Require trusted Admin approval before user-authored Posts, Stories, and Chapters become public.

## Tasks

- [x] Persist moderation state, submission version, feedback, and review audit records.
- [x] Submit author publication attempts into a private pending state.
- [x] Add the Admin approval queue and version-safe approve/reject transactions.
- [x] Notify authors of approval and rejection.
- [x] Keep pending/rejected content out of public routes and queries.

## Files Changed

- Types, serializers, Post/Story/Chapter APIs and editors.
- Admin approval APIs, service, and UI.
- Notification model and UI.
- Content approval, database, security-adjacent, UI, and roadmap specs.

## Dependencies Added

- None.

## Database Changes

- Added moderation fields to Posts, Stories, and Chapters.
- Added nested `moderationReviews` audit subcollections.
- Added approval/rejection Notification payload fields.
- Added the `chapters.moderationStatus` collection-group index for the approval queue.

## Security Changes

- Review endpoints require the persisted active `admin` role.
- Transactions enforce pending state and expected submission version.
- Existing global Firestore rules continue to deny all direct browser reads/writes.

## Specs Added or Updated

- `features/content-approval.md`, `database/moderation-reviews.md`, related content/Admin specs.

## Important Decisions

- Publication status and moderation status remain separate.
- Material edits use the safe V1 policy and temporarily leave public discovery until re-approved.
- Serialized Chapters are independent moderation units.
- The queue temporarily falls back to bounded per-Story Chapter queries while a newly deployed
  collection-group index is unavailable or still building, avoiding a user-facing HTTP 500.

## Known Limitations

- Queue reads are intentionally bounded to 50 documents per content type.

## Verification

- [x] Formatting
- [x] Type checking
- [x] Relevant tests
- [x] Production build
- [x] Manual workflow/code-path verification

## Completed At

2026-09-05
