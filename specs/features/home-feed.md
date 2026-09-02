# Home Feed

This document defines the Home Feed behavior of vucdem.

---

# 1. Goal

The Home Feed is the primary discovery surface of vucdem.

Canonical route:

```text
/
```

It should allow users to quickly discover horror content while maintaining a community-oriented experience.

The Feed combines published Posts and published Stories. Its canonical filters are `Tất cả`,
`Thảo luận`, and `Truyện`: `Thảo luận` queries Posts, `Truyện` queries Stories, and `Tất cả`
merges both result sets by publication time.

---

# 2. Product Role

The Home Feed combines:

```text
Reddit-like discovery
+
Horror editorial presentation
```

It should emphasize:

- Content title
- Author
- Category
- Community
- Engagement
- Excerpt
- Thumbnail
- Tags
- Freshness

---

# 3. Feed Is Not a Collection

The Feed is generated from Firestore queries.

Do not create a normal:

```text
feed/
```

collection merely to render the homepage.

Canonical source:

```text
posts/
```

---

# 4. Desktop Layout

Primary desktop structure:

```text
┌─────────────────────────────────────────────────────────┐
│ Header                                                  │
├──────────────┬────────────────────────┬─────────────────┤
│ Left Sidebar │ Main Feed              │ Right Sidebar   │
│              │                        │                 │
│ Navigation   │ Filters                │ Trending        │
│ Topics       │ Post Cards             │ Top Authors     │
│              │ Pagination             │ Discovery       │
└──────────────┴────────────────────────┴─────────────────┘
```

Approximate widths:

```text
Left sidebar: 240px
Center: minmax(680px, 1fr)
Right sidebar: 400px
```

Exact visual rules are defined under:

```text
specs/ui/
```

---

# 5. Header

Desktop Header may contain:

- vucdem logo
- Main navigation
- Search
- Notification action
- User avatar/menu
- Create Post action

Guest state should replace authenticated-only controls appropriately.

---

# 6. Main Navigation

Primary navigation includes:

```text
Khám phá
Cộng đồng
Bảng xếp hạng
```

Navigation labels may evolve through UI specifications without changing the underlying Feed data model.

---

# 7. Left Sidebar

The desktop Left Sidebar provides discovery/navigation.

Possible sections:

```text
KHÁM PHÁ

Mới nhất
Phổ biến
Đáng sợ
Truyện dài
Chuyện có thật
Thảo luận
```

It may additionally contain:

- Communities
- Topics
- Tags
- Atmospheric editorial content

Do not make decorative content interfere with navigation.

---

# 8. Right Sidebar

The desktop Right Sidebar may contain:

- Trending topics
- Trending content
- Top Authors
- Recommended Communities
- Editorial horror imagery

The Right Sidebar is supplementary.

Trending topics use normalized tags that occur on public Posts and Stories. Ranking is based on
tag frequency in a bounded recent-content window so the sidebar remains derived from real content
without unbounded collection reads. A tag is counted once per content document, and selecting it
opens search for that tag.

The main Feed must remain usable without it.

---

# 9. Feed Filters

The Feed should provide content filters.

Canonical Home filters:

```text
Tất cả
Thảo luận
Truyện
```

The exact mapping must be explicit.

Do not implement filters that appear functional but do not change the underlying query/result set.

---

# 10. Feed Sorting

Initial Post sorting modes:

```text
newest
popular
most_viewed
```

UI labels may be:

```text
Mới nhất
Phổ biến
Xem nhiều
```

---

# 11. Newest Query

Conceptual query:

```text
posts
where status == "published"
orderBy createdAt DESC
limit 20
```

---

# 12. Popular Query

Conceptual query:

```text
posts
where status == "published"
orderBy voteScore DESC
limit 20
```

The final ranking may later incorporate recency.

For MVP, simple vote-based ordering is acceptable.

---

# 13. Most Viewed Query

Conceptual query:

```text
posts
where status == "published"
orderBy viewCount DESC
limit 20
```

---

# 14. Filtered Category Query

Example:

```text
posts
where status == "published"
where category == "creepypasta"
orderBy createdAt DESC
limit 20
```

Required indexes must be documented.

---

# 15. Community Feed

Community-specific Posts are not the Home Feed itself.

They use the Community route:

```text
/c/{slug}
```

However, Home Feed cards may display Community information.

---

# 16. Pagination

The Home Feed uses cursor pagination.

Initial page:

```text
orderBy(...)
limit(20)
```

Next page:

```text
startAfter(lastDocument)
limit(20)
```

Do not use:

```text
page=2
offset=20
```

as the underlying Firestore pagination mechanism.

---

# 17. Infinite Scroll vs Load More

The implementation may use:

```text
Load more
```

or:

```text
Infinite scroll
```

Both must use Firestore cursor pagination.

For MVP, explicit Load More is preferred if it produces simpler and more predictable behavior.

---

# 18. Post Card

A Feed Post Card should communicate:

- Vote score
- Author
- Author avatar
- Username
- Publication time
- Community when applicable
- Category
- Title
- Excerpt
- Tags
- Thumbnail when available
- Comment count
- View count
- Bookmark action

---

# 19. Desktop Post Card

Conceptual structure:

```text
┌───────┬───────────────────────────────┬──────────────┐
│ Vote  │ Content                       │ Thumbnail    │
│       │                               │              │
│  ↑    │ Author · Time                 │              │
│ 604   │                               │   Image      │
│  ↓    │ Post title                    │              │
│       │ Excerpt...                    │              │
│       │                               │              │
│       │ Tags                          │              │
│       │ Comments · Views · Bookmark   │              │
└───────┴───────────────────────────────┴──────────────┘
```

Approximate grid:

```text
72px minmax(0, 1fr) 226px
```

Exact styling belongs in UI specifications.

---

# 20. Post Card Navigation

Clicking the Post title or primary content area should open:

```text
/post/{id}
```

Author interaction should open:

```text
/u/{username}
```

Community interaction should open:

```text
/c/{slug}
```

Interactive controls must not accidentally trigger Post navigation.

---

# 21. Voting

Authenticated Users may vote directly from Feed cards.

Guest:

```text
click vote
→ authentication required
```

Vote UI should optimistically update only if the implementation can safely recover from failed writes.

On failure:

- Restore previous state
- Show usable error feedback

Voting logic belongs in:

```text
specs/features/voting.md
```

---

# 22. Bookmark

Authenticated Users may bookmark Posts from the Feed.

Guest:

```text
click bookmark
→ authentication required
```

Bookmark state should visually indicate whether the Post is currently saved.

---

# 23. Comments

The Feed displays:

```text
commentCount
```

Clicking the comment action opens the Post detail, ideally positioned near the discussion area when appropriate.

The Feed must not load all Comments for every Post.

---

# 24. Views

The Feed displays the denormalized:

```text
viewCount
```

The Feed itself should not increment Post views simply because a card was rendered.

View counting should occur according to the Posts feature rules.

---

# 25. Author Data

Feed cards use denormalized author fields from Post documents where available.

This prevents:

```text
20 Posts
→ 20 extra User reads
```

Canonical ownership remains:

```text
authorId
```

---

# 26. Images

Feed cards should use appropriately transformed Cloudinary images.

Do not load unnecessarily large original images for small thumbnails.

Images should:

- Preserve layout stability
- Use lazy loading where appropriate
- Have suitable alt text
- Use responsive sizing

---

# 27. Missing Thumbnail

Posts without thumbnails must still render correctly.

The card should adapt its layout rather than showing a broken placeholder.

---

# 28. Empty Feed

If no Posts match the selected filter:

Display a meaningful empty state.

Example concept:

```text
Chưa có bài viết nào trong mục này.
```

Do not render an empty blank column.

---

# 29. Initial Loading

During initial Feed loading, use a layout-stable loading state.

Skeletons should approximately match Post Card dimensions.

Avoid large layout shifts when content arrives.

---

# 30. Loading Next Page

When loading additional results:

- Keep existing Posts visible
- Show loading state near the pagination boundary
- Prevent duplicate pagination requests

---

# 31. End of Feed

When no additional results exist:

- Disable/remove Load More
- Optionally display a subtle end state

Do not repeatedly issue empty queries.

---

# 32. Query Error

On Feed failure:

- Keep existing loaded Posts if possible
- Display readable error feedback
- Allow retry

Do not replace already loaded content with a blank screen because a later pagination request failed.

---

# 33. Duplicate Prevention

Pagination must avoid rendering duplicate Post documents.

The Post document ID is the canonical identity for deduplication.

---

# 34. Filter Changes

When filter or sorting changes:

1. Reset pagination cursor.
2. Clear or replace the current Feed result set.
3. Run the new query.
4. Update UI state.

Do not continue using the previous query cursor.

---

# 35. URL State

Where practical, Feed sorting/filter state may be represented in the URL.

Example:

```text
/?sort=popular
```

or:

```text
/?category=creepypasta
```

This allows:

- Refresh persistence
- Shareable Feed views
- Browser navigation

Do not require URL state for every purely visual UI control.

---

# 36. Responsive Behavior

Desktop:

```text
Left Sidebar
Main Feed
Right Sidebar
```

Below approximately:

```text
1280px
```

the Right Sidebar may be hidden.

Below approximately:

```text
900px
```

the Left Sidebar may be hidden or moved into mobile navigation.

Main Feed becomes the dominant layout.

Exact breakpoints belong in:

```text
specs/ui/responsive.md
```

---

# 37. Mobile Feed

Mobile Post Cards should prioritize:

```text
Author metadata
Title
Excerpt
Thumbnail
Vote/comment actions
```

Avoid forcing the desktop three-column Post Card layout onto narrow screens.

---

# 38. Accessibility

Interactive Feed elements must be keyboard accessible where appropriate.

Icon-only buttons should have accessible labels.

Examples:

```text
Upvote
Downvote
Bookmark
Open comments
```

Do not rely on red color alone to communicate active state.

---

# 39. Firestore Indexes

Feed queries may require indexes such as:

```text
status + createdAt
status + voteScore
status + viewCount
status + category + createdAt
communityId + status + createdAt
```

Canonical indexes are defined in:

```text
specs/database/indexes.md
```

---

# 40. Performance

The Home Feed must avoid:

- Loading entire Post collection
- Loading all Comments
- Loading all Votes
- One User query per Post
- Original full-resolution images
- Unnecessary realtime listeners

Prefer:

- Pagination
- Denormalized metadata
- Cloudinary transformations
- Cached/local state where appropriate

---

# 41. Realtime Behavior

The Home Feed does not require realtime updates for every Post.

Normal paginated Firestore reads are sufficient for MVP.

Realtime behavior may be introduced later for specific interactions if justified.

---

# 42. SEO

Public Feed content should remain compatible with SvelteKit SEO strategies.

Important public Post metadata should be available to public routes.

Detailed SEO implementation belongs to a future implementation/SEO specification.

---

# 43. Acceptance Criteria

The Home Feed is complete for MVP when:

- `/` displays published Posts
- Newest sorting works
- Popular sorting works
- Supported category filters work
- Pagination works with Firestore cursors
- Post cards display required metadata
- Post cards support navigation
- Vote action integrates correctly
- Bookmark action integrates correctly
- Guest interactions request authentication
- Loading state exists
- Empty state exists
- Error state exists
- Pagination error does not destroy existing Feed
- Desktop layout follows the design system
- Mobile layout remains usable
- Feed does not perform N+1 User reads for normal Post cards
- Feed does not load all Votes or Comments

---

# 44. Out of Scope

Unless introduced later:

- Machine-learning recommendations
- Personalized ranking algorithm
- Sponsored Posts
- Advertising
- Realtime global Feed
- TikTok-style Feed
- Infinite personalized recommendation engine

---

# 45. Related Specifications

Database:

```text
specs/database/posts.md
specs/database/indexes.md
```

Voting:

```text
specs/features/voting.md
```

Bookmarks:

```text
specs/features/bookmarks.md
```

UI:

```text
specs/ui/screens/home.md
specs/ui/layout.md
specs/ui/responsive.md
```
