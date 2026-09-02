# Components

This document defines shared UI component patterns for vucdem.

---

# 1. Component Philosophy

Components should be:

- Focused
- Reusable
- Consistent
- Accessible
- Easy to compose

Avoid giant components containing unrelated page logic.

---

# 2. Component Groups

Canonical grouping:

```text
components/
├── layout/
├── feed/
├── post/
├── story/
├── comment/
├── community/
├── profile/
├── editor/
├── media/
└── ui/
```

---

# 3. AppHeader

Responsibilities:

- Brand
- Primary navigation
- Search entry
- Notification action
- Authentication/profile controls
- Create action

Do not put Feed query logic inside AppHeader.

---

# 4. LeftSidebar

Responsibilities:

- Discovery navigation
- Categories
- Community shortcuts
- Secondary navigation

Desktop only when sufficient width exists.

---

# 5. RightSidebar

Responsibilities may include:

- Trending topics
- Top Authors
- Recommended Communities
- Editorial content

RightSidebar must not contain functionality required to use the primary page.

---

# 6. PostCard

PostCard displays Feed-level Post information.

Required information:

```text
Author
Time
Title
Excerpt
Category/Community context
Vote score
Comment count
View count
Bookmark state
```

Optional:

```text
Thumbnail
Tags
```

---

# 7. VoteControl

Shared voting component.

Conceptual API:

```text
score
currentVote
onUpvote
onDownvote
orientation
```

Supported orientations:

```text
vertical
horizontal
```

Desktop Feed may use vertical.

Mobile may use horizontal.

---

# 8. BookmarkButton

Displays saved state.

States:

```text
not bookmarked
bookmarked
loading
```

Guest action requests authentication.

---

# 9. AuthorMeta

Reusable author metadata display.

May contain:

```text
Avatar
Display name
Username
Timestamp
```

Must support compact variants.

---

# 10. TagList

Displays bounded Tag collections.

Must handle overflow gracefully.

Avoid wrapping dozens of Tags because Post validation should already enforce a maximum.

---

# 11. StoryCard

Displays:

```text
Cover
Title
Author
Description/excerpt
Status
Chapter count
Follower count
Tags
```

Variants may include:

```text
default
compact
horizontal
```

Do not create unrelated markup for every Story list.

---

# 12. StoryStatus

Canonical visible statuses:

```text
Đang ra
Hoàn thành
Tạm dừng
```

Internal values:

```text
ongoing
completed
hiatus
```

Draft/hidden/removed statuses are shown only where appropriate.

---

# 13. CommentItem

Displays:

- Author
- Timestamp
- Content
- Vote
- Reply
- More actions

Replies may be nested visually.

Visible nesting should remain limited.

---

# 14. CommentComposer

Authenticated state:

```text
Textarea/editor
Submit
```

Guest state:

```text
Prompt to login
```

Prevent duplicate submissions.

---

# 15. EmptyState

Reusable structure:

```text
Optional icon
Title
Description
Optional action
```

Keep compact.

---

# 16. ErrorState

Reusable structure:

```text
Title
Readable message
Retry action
```

Never show raw Firebase stack traces.

---

# 17. Loading Skeleton

Skeleton components should approximate:

- PostCard
- StoryCard
- Comment
- Profile header

Avoid generic giant rectangular placeholders.

---

# 18. Avatar

Avatar should support:

```text
image
fallback
size variants
```

Suggested sizes:

```text
xs
sm
md
lg
xl
```

Fallback may use:

- Initial
- Default vucdem avatar

---

# 19. PrimaryButton

Use for primary actions.

Examples:

```text
Đăng bài
Xuất bản
Theo dõi
Đăng chương
```

Style:

```text
crimson background
light text
minimal radius
```

---

# 20. SecondaryButton

Style:

```text
dark surface
thin border
neutral text
```

---

# 21. IconButton

Used for:

- Bookmark
- Share
- More
- Search
- Notifications
- Reader controls

Must include accessible label.

---

# 22. Tabs

Prefer:

```text
text
+
bottom border / underline
```

for primary content tabs.

Do not default to large rounded pills.

---

# 23. Modal Confirmation

Use for destructive operations.

Structure:

```text
Title
Explanation
Cancel
Destructive action
```

The destructive button should clearly identify the action.

---

# 24. MediaUploader

Responsibilities:

- File selection
- Preview
- Validation
- Upload progress
- Retry
- Remove
- Cloudinary upload

It must not know or expose the Cloudinary API secret.

---

# 25. Editor

Post and Story editors may share writing primitives.

The editor should prioritize:

- Stable writing area
- Clear formatting controls
- Media insertion
- Validation
- Save/publish state

Avoid an overly complex CMS interface for MVP.

---

# 26. Toast

Use for short-lived feedback such as:

```text
Đã lưu
Đã sao chép liên kết
Không thể tải ảnh
```

Do not use Toast for errors requiring significant User action.

---

# 27. Dropdown Menu

Use for secondary actions such as:

```text
Edit
Report
Delete
Copy link
```

Destructive actions should be visually differentiated.

---

# 28. Component States

Interactive components should consider:

```text
default
hover
focus
active
disabled
loading
error
```

Do not implement only the default state.

---

# 29. Component Ownership

Components should not directly mutate trusted counters unless routed through the correct service.

Example:

```text
VoteControl
    ↓
votes service
    ↓
trusted Firestore operation
```

not:

```text
VoteControl
    ↓
set voteScore manually
```

# Text-to-Speech player

Text Story readers may show a compact client-side speech panel above the prose. It uses a near-black
surface, thin dark-crimson border, editorial uppercase label, one crimson primary action, and muted
secondary icon actions. Voice and rate controls stack on mobile and use at least 44px touch targets.
Progress is expressed as current/total text chunks, not an estimated audio duration. The component
must not resemble a podcast, Spotify, generic SaaS, or browser-native audio player.

# Authored Audio Player

Uploaded Audio Stories use a SoundCloud-inspired waveform timeline adapted to vucdem's near-black
and crimson editorial identity. The waveform is the primary seek surface, shows real playback
progress and a playhead, and remains keyboard accessible through an overlaid range input. The
player retains play/pause, ±10 seconds, current/total time, mute/volume, and playback speed. The
wave shape is a lightweight deterministic visualization rather than decoded amplitude data, so the
browser does not download and decode a potentially 100 MB asset solely to draw UI. It must remain
responsive and must not use native browser audio controls.

# Messages workspace

Messaging uses a focused two-column workspace only: Conversation Sidebar and Chat. It must never
add a User Details column. Conversation selection uses a narrow crimson edge and dark-red surface;
received messages use neutral near-black bubbles while sent messages use restrained dark-crimson
bubbles. Lists scroll independently and the composer remains available. Mobile switches between
the list and a full-screen Chat rather than squeezing both columns together.

### Realtime toast

Authenticated users receive compact gothic black/crimson toasts when a new notification or direct
message increases after the initial unread baseline. Toasts include an icon, concise copy, a route
action, a dismiss control, an accessible live region, and automatically dismiss after six seconds.
Muted conversations do not create message toasts. Existing unread items must not all toast when the
application first loads.
