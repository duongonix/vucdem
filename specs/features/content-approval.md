# Content Approval

All new user-authored Posts, short Stories, Story metadata and serialized Chapters require Admin
approval before becoming public. Publication state (`status`) remains separate from review state.

## State

`moderationStatus` is `not_submitted`, `pending`, `approved`, or `rejected`. Documents also store
`submissionVersion`, `submittedAt`, `reviewedAt`, `reviewedBy`, and `rejectionReason`. Every review
is appended to `moderationReviews/{reviewId}` with decision, reason, reviewer identity, submission
version and trusted creation time.

Selecting publish in an author editor changes a private document to `pending`; it does not publish
it. Pending submissions are locked. A rejection preserves the reason and may be edited and sent
again, incrementing `submissionVersion`. Material edits to approved content use the safe V1 policy:
the current document returns to private/pending until the revision is approved again.

## Story behavior

A short Story and its stable `short-story` Chapter are reviewed together. Every serialized Chapter
is independently reviewed. Initial serialized metadata may be approved with the first pending
Chapter; later metadata-only revisions appear separately in the long-Story queue. A Story becomes
public only after its metadata is approved. Only approved Chapters have `status = published`.

## Trusted review

Only an active persisted Admin may list or review submissions. A review transaction verifies that
the target is still pending at the expected submission version, appends history, changes publication
state, updates counters, and creates an author Notification. Rejection requires a nonblank reason.
Public APIs continue to enforce publication `status`, so pending/rejected documents cannot be read
by another User or Guest even when their ID or slug is known.
