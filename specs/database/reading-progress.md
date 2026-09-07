# Reading progress

Private per-user reading state is stored at `users/{uid}/readingProgress/{storyId}`. It contains
`storyId`, `storySlug`, `storyTitle`, `chapterId`, `chapterNumber`, `chapterTitle`,
`progressPercent` (0–100), and trusted `updatedAt`. The authenticated SvelteKit API validates that
the referenced Story and published Chapter exist before replacing the document. It is never public
and never stored as an unbounded array on the User document.

Reader display preferences (`fontSize`, `lineHeight`, `width`, `theme`) are device preferences and
are stored in browser local storage; they do not contain private application data.

## Profile reading history

The owner-facing **Lịch sử** Profile tab reads these existing documents through
`GET /api/reading-history`. The endpoint authenticates the requester, queries only that requester's
subcollection by `updatedAt DESC`, and returns at most 10 records. Reading history is never exposed
on another user's public Profile.
