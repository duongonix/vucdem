# Home Screen

Canonical route:

```text
/
```

---

# 1. Goal

Home is the primary discovery surface of vucdem.

The screen should immediately communicate:

```text
Horror
Community
Stories
Discovery
```

without behaving like a marketing landing page.

Content begins immediately.

---

# 2. Desktop Structure

```text
┌───────────────────────────────────────────────────────────────┐
│ HEADER                                                        │
├───────────────┬───────────────────────────────┬───────────────┤
│ LEFT SIDEBAR  │ MAIN FEED                     │ RIGHT SIDEBAR │
│               │                               │               │
│ Explore       │ Filter Tabs                   │ Trending      │
│ Categories    │ Sort                          │               │
│ Communities   │                               │ Top Authors   │
│               │ Post Card                     │               │
│ Quote         │ Post Card                     │ Community     │
│               │ Post Card                     │ Discovery     │
└───────────────┴───────────────────────────────┴───────────────┘
```

---

# 3. Header

Desktop Header contains:

```text
vucdem logo

Khám phá
Cộng đồng
Bảng xếp hạng

Search

Notifications
Avatar

+ Đăng bài
```

Guest state replaces authenticated actions appropriately.

---

# 4. Brand

Brand area contains:

- Custom vucdem horror/occult symbol
- `vucdem` wordmark

The logo should be recognizable without becoming excessively decorative.

---

# 5. Community Rules Banner

Before the Feed controls, Home displays a permanent community-rules banner. It clearly states that
content is entertainment rather than support for superstition; member-uploaded copyright or
complaint issues should be reported to Admin for removal; and only horror, fantasy, supernatural
science, and speculative content is allowed. Religious insults, political distortion, abuse or
harm toward others, and obscene content are prohibited and may result in content removal and a
permanent ban. The banner uses a restrained near-black/crimson gothic treatment and must remain
readable on mobile without overpowering the Feed.

---

# 6. Main Feed Controls

Top Feed controls:

```text
Tất cả
Thảo luận
Truyện
```

Sort control:

```text
Mới nhất
Phổ biến
Xem nhiều
```

---

# 7. Post Cards

Desktop Post Card:

```text
┌──────┬──────────────────────────────┬─────────────┐
│  ↑   │ Author · Time               │             │
│      │                              │             │
│ 604  │ Kẻ gõ cửa lúc nửa đêm       │ Thumbnail   │
│      │                              │             │
│  ↓   │ Ba tiếng gõ cửa vang lên... │             │
│      │                              │             │
│      │ #bíẩn #tâmlinh              │             │
│      │                              │             │
│      │ Comments · Views · Bookmark  │             │
└──────┴──────────────────────────────┴─────────────┘
```

---

# 8. Left Sidebar

Suggested sections:

```text
KHÁM PHÁ

Mới nhất
Phổ biến
Đáng sợ
Truyện dài
Chuyện có thật
Thảo luận
```

Additional section:

```text
CHỦ ĐỀ

Tâm linh
Creepypasta
Bí ẩn
Truyền thuyết đô thị
```

An atmospheric quote/image card may appear near the bottom.

---

# 9. Right Sidebar

Suggested blocks:

```text
ĐANG THỊNH HÀNH
```

with trending content/topics.

```text
TÁC GIẢ NỔI BẬT
```

with compact Author rows.

Optional:

```text
Community recommendations
Editorial horror image
Quote
```

---

# 10. Loading

Initial load uses Post Card skeletons.

Sidebars may load independently.

Do not block the entire page because a secondary sidebar query fails.

---

# 11. Empty

If Feed has no matching content:

```text
Chưa có bài viết nào trong mục này.
```

Provide a relevant action when appropriate.

---

# 12. Error

Feed error should provide:

```text
Không thể tải bài viết.
Thử lại
```

Already-loaded Posts should remain visible when only pagination fails.

---

# 13. Responsive

Desktop:

```text
Left + Feed + Right
```

Compact desktop:

```text
Left + Feed
```

Tablet/mobile:

```text
Feed
```

Navigation moves into responsive controls.

---

# 14. Visual Priority

Priority order:

```text
Post title
Post content/excerpt
Thumbnail
Author/context
Engagement
Secondary discovery
```

Do not allow sidebars to visually overpower the Feed.

The discovery sidebar must not use presentation-only seed data. Trending topics are tags actually
used by public Posts and Stories. They are ranked by occurrence across a bounded set of the most
recent public content, with a tag counted at most once per content document. Selecting a tag opens
search for that tag. Top Authors are active Users ranked by the trusted `followersCount` field, with
real profile links, avatars, and follower totals. Loading, empty, and error states must not
substitute fake values.
