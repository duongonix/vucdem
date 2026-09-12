# Chapters

> Every serialized Chapter stores the moderation fields defined by
> `specs/features/content-approval.md`. Author publication submits it for review; only approval
> changes its publication status to `published`.

An active Admin author may publish a Chapter immediately through the trusted endpoint. The server
records the Chapter as approved, sets trusted review/publication timestamps, and still emits normal
Story- and author-follower notifications.

> Interactive format extension: Chapter `contentFormat` accepts `interactive`; structured content is stored in the chapter's `interactiveEvents` subcollection and Story-level `characters` subcollection. See `specs/database/interactive-stories.md`.

## Purpose and path

Chapters are ordered, long-form parts of a Story. They live at:

```text
stories/{storyId}/chapters/{chapterId}
```

The application model derives `id` from `{chapterId}`. `storyId` is stored so root-group queries, notifications, and authorization checks can identify the parent without accepting browser-provided ownership.

## Canonical fields

```typescript
type ChapterStatus = 'draft' | 'published' | 'hidden' | 'removed';

type AudioAsset = {
	url: string;
	publicId: string;
	duration: number | null;
	format: string | null;
	bytes: number | null;
};

type Chapter = {
	id: string;
	storyId: string;
	chapterNumber: number;
	title: string;
	content: string;
	contentFormat: 'text' | 'audio';
	audio: AudioAsset | null;
	wordCount: number;
	viewCount: number;
	commentCount: number;
	status: ChapterStatus;
	createdAt: Timestamp;
	updatedAt: Timestamp;
	publishedAt: Timestamp | null;
};
```

`contentFormat = text` requires prose in `content` and stores `audio = null`. The prose string may
be plain text or safe Markdown. Supported Markdown is limited to headings, blockquotes, lists,
emphasis, inline/fenced code, horizontal rules, and safe `http`, `https`, or `mailto` links.
Markdown images, raw HTML, and unsafe link protocols are rejected.
`contentFormat = audio` requires an owned Cloudinary audio asset and stores an empty prose body.
Existing Chapters without these fields are interpreted as text Chapters. Audio assets use the
exact public ID `vucdem/stories/{storyId}/chapters/{chapterId}/audio`; `duration` is seconds and
`bytes` is the uploaded byte size reported by Cloudinary.

`chapterNumber` is a positive integer unique within a Story. `wordCount`, `viewCount`, and `commentCount` are non-negative trusted counters. Draft Chapters are owner-only; published Chapters are public only while their parent Story is publicly readable. Normal clients cannot change `storyId`, trusted counters, or moderation states arbitrarily. Chapter comments use the root Comment target ID `{storyId}:{chapterId}`.

`viewCount` is incremented only through the trusted `/api/views` endpoint after both the Chapter and
its parent Story are confirmed public. Author views and repeated browser views inside the one-hour
deduplication window do not increment it.

## Relationships and indexes

The parent Story owns Chapter lifecycle and `chapterCount`. Ordering uses `chapterNumber ASC`; uniqueness is enforced by the Chapter creation transaction or trusted service. No global root collection is introduced.

The trusted list endpoint orders the Story-scoped subcollection by `chapterNumber` and filters
non-published documents server-side for non-owners. This avoids making public Chapter availability
depend on a composite index while ensuring Draft/hidden/removed Chapters never reach the browser.

For `Story.format = short`, the only Chapter uses the stable path `chapters/short-story` and
`chapterNumber = 1`. It contains the complete short Story body. It may be edited but cannot be
removed, and no second Chapter may be created.
