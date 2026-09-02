# Story Detail Screen

Canonical route:

```text
/story/{slug}
```

---

# 1. Goal

Story Detail introduces a Story and helps the User decide whether to read or follow it.

Primary actions:

```text
Read
Continue Reading
Follow Story
Bookmark
View Chapters
View Author
```

---

# 2. Desktop Structure

```text
┌───────────────────────────────────────────────────────┐
│ Header                                                │
├───────────────────────────────────────────────────────┤
│                                                       │
│ Cover     Story Title                                 │
│           Author                                      │
│           Status                                      │
│           Description                                 │
│           Tags                                        │
│           Stats                                       │
│           [Read] [Follow] [Bookmark]                  │
│                                                       │
├──────────────────────────────────┬────────────────────┤
│ Chapters                         │ Story Information  │
│                                  │ / Author           │
└──────────────────────────────────┴────────────────────┘
```

---

# 3. Cover

Story cover is a strong visual anchor.

Recommended desktop aspect ratio:

```text
2:3
```

Do not stretch or distort cover images.

---

# 4. Story Title

Use editorial serif typography.

Recommended desktop range:

```text
40–56px
```

Mobile:

```text
30–36px
```

---

# 5. Author

Display:

```text
Avatar
Display name
Username
Follow Author where appropriate
```

Clicking Author opens:

```text
/u/{username}
```

---

# 6. Story Status

Public statuses:

```text
ongoing
→ Đang ra

completed
→ Hoàn thành

hiatus
→ Tạm dừng
```

Status should be visible but not visually overpower the title.

---

# 7. Description

Story description should be readable and clearly separated from metadata.

Long descriptions may support expand/collapse on compact screens.

---

# 8. Statistics

May display:

```text
Views
Followers
Chapters
```

Do not display fake ratings or statistics that are not represented in the product model.

---

# 9. Primary Actions

Primary:

```text
Đọc truyện
```

If reading progress exists:

```text
Đọc tiếp
```

Secondary:

```text
Theo dõi
Lưu
```

---

# 10. Chapter List

Chapter list should display:

```text
Chapter number
Chapter title
Publication/update time
Optional reading state
```

Example:

```text
01  Tiếng gõ cửa                 2 ngày trước
02  Người phụ nữ cuối hành lang  5 ngày trước
03  Tầng không tồn tại           1 tuần trước
```

---

# 11. Chapter Navigation

Clicking a Chapter opens:

```text
/story/{slug}/{chapter}
```

---

# 12. Story Owner

Story owner may receive:

```text
Quản lý truyện
Thêm chương
Chỉnh sửa
```

These controls must not appear as primary reading actions for normal readers.

---

# 13. Follow

Follow Story is distinct from Follow Author.

The UI should make this distinction understandable.

---

# 14. Bookmark

Bookmark Story means saving it privately.

It does not subscribe the User to Story updates.

---

# 15. Sidebar

The global discovery Right Sidebar is hidden on public Story detail and Chapter reader routes. Story
information remains part of the main content flow rather than occupying the application discovery
column.

Additional inline sections may contain:

- Author information
- Story metadata
- Similar Stories
- Tags

Keep the main Story information dominant.

---

# 16. Mobile

Recommended order:

```text
Cover
Title
Author
Status + stats
Primary actions
Description
Tags
Chapter list
Additional information
```

Cover may become centered and smaller.

---

# 17. Empty Chapters

A Draft Story may contain no Chapters.

A public Story should follow publication requirements defined by the Story feature specification.

If no public Chapters exist, display an explicit state rather than an empty list.
