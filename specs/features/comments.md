# Comments

Comment bodies support up to ten unique `@username` mentions. Trusted comment creation resolves
the existing username reservation documents, suppresses self-mentions and creates deterministic
private mention notifications. Clients never submit recipient UIDs. Authors may mark a comment as
spoiler; readers must explicitly reveal it. These behaviors apply equally to root comments and the
maximum three-level reply hierarchy.

## Goal and scope

The shared discussion system provides public Post, Story, and Chapter discussions. Guests can read; authenticated active Users can create, reply, edit their own published Comment, and soft-remove their own Comment.

## Routes and queries

- `GET /api/comments?targetType={post|story|chapter}&targetId={id}&cursor={cursor}` returns up to 20 newest root Comments plus their first two reply generations. Chapter target IDs use `{storyId}:{chapterId}` because Chapters are stored as Story subcollection documents.
- `POST /api/comments` creates a root or reply.
- `PATCH /api/comments/{id}` edits own content.
- `DELETE /api/comments/{id}` soft-removes own content.
- `GET /api/comments/{id}/vote` returns the public score and the current User's vote when authenticated.
- `POST /api/comments/{id}/vote` atomically creates, changes, or removes the current User's vote.

Root pagination uses `createdAt DESC` plus document ID. Replies use `parentId` and `createdAt ASC`. A reply must share the parent's target. Discussion threads support exactly three levels (root plus two reply generations); the third level does not expose a reply action and the server rejects attempts to create a deeper level.

## Trusted mutations

Create and remove operations run server transactions. Every published root or reply contributes one to the target Post, Story, or Chapter `commentCount`; a direct parent's `replyCount` is likewise incremented/decremented. Removed Comments keep identity and reply continuity but store empty content and render a removal marker.

## Validation and permissions

Content is trimmed, required, and limited to 5,000 characters. Ownership, author snapshots, counters, status, target identity, and timestamps are server-controlled. Story comments require a publicly readable Story; Chapter comments require both a published Chapter and a publicly readable parent Story.

The comment UI follows the gothic discussion reference: a wide thread column, a 304px rules sidebar on desktop, compact nested connectors capped at three visible levels, real vote actions, cursor pagination, and stacked rules below the discussion on smaller screens.

## States

The detail screen includes loading skeletons, empty text, retryable errors, pagination, guest login routing, and localized mutation errors.
