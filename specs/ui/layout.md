# Layout

This document defines the canonical layout system for vucdem.

---

# 1. Application Shell

Desktop application structure:

```text
┌──────────────────────────────────────────────────────────────┐
│ Header                                                       │
├──────────────┬─────────────────────────────┬─────────────────┤
│ Left Sidebar │ Main Content                │ Right Sidebar   │
│              │                             │                 │
│ Navigation   │ Feed / Page Content         │ Discovery       │
│ Topics       │                             │ Trending        │
│ Communities  │                             │ Authors         │
└──────────────┴─────────────────────────────┴─────────────────┘
```

---

# 2. Header

Approximate desktop height:

```text
72–84px
```

Header should remain visually compact.

Possible content:

```text
Logo
Primary navigation
Search
Notifications
Profile
Create action
```

---

# 3. Desktop Grid

Recommended Home layout:

```css
grid-template-columns:
	240px
	minmax(680px, 1fr)
	400px;
```

The exact width may adapt to available viewport space.

---

# 4. Maximum Width

The main application shell should have a sensible maximum width.

Recommended range:

```text
1440–1600px
```

Very large monitors should not stretch content indefinitely.

---

# 5. Left Sidebar

Approximate width:

```text
240px
```

Contains:

- Discovery navigation in this order: Trang Chủ (`/`), Thông Báo (`/notifications`), Tin Nhắn
  (`/messages`), Thảo Luận (`/discussion`), Trang Cá Nhân (`/u/{username}`), and Cài Đặt
  (`/settings`). Protected destinations use the existing login redirect for Guests. The active
  destination is derived from the current route. Notifications and Messages show a compact crimson
  count badge when their authenticated unread count is greater than zero.
- Categories
- Communities/topics
- Secondary content

The sidebar should not visually dominate the Feed.

---

# 6. Main Content

Main content receives the highest visual priority.

On Home:

```text
Feed filters
Feed sorting
Post Cards
Pagination
```

On detail pages:

```text
Primary content
Comments
Related information
```

---

# 7. Right Sidebar

Approximate width:

```text
360–400px
```

Possible content:

- Trending
- Top Authors
- Recommended Communities
- Editorial cards

It is supplementary. Below the full three-column breakpoint, its blocks move beneath the Left
Sidebar in compact form; on tablet/mobile they are available below navigation inside the temporary
menu. Focused routes that intentionally hide discovery content remain exempt.

---

# 8. Horizontal Spacing

Typical desktop gaps:

```text
16px
20px
24px
```

Avoid extremely large empty gaps associated with marketing landing pages.

---

# 9. Page Padding

Desktop:

```text
20–32px
```

Tablet:

```text
16–24px
```

Mobile:

```text
12–16px
```

---

# 10. Vertical Rhythm

Typical spacing scale:

```text
4
8
12
16
20
24
32
40
48
64
```

Prefer this shared rhythm over arbitrary spacing.

---

# 11. Feed Card Layout

Desktop Post Card:

```text
┌──────┬──────────────────────────────┬─────────────┐
│ Vote │ Content                      │ Thumbnail   │
└──────┴──────────────────────────────┴─────────────┘
```

Approximate grid:

```css
grid-template-columns:
	72px
	minmax(0, 1fr)
	226px;
```

---

# 12. Content Detail Width

Post detail should not use the full application width for body text.

Recommended readable body region:

```text
720–900px
```

Side content may occupy remaining space.

The global discovery Right Sidebar is hidden on focused reading routes:

```text
/post/{id}
/story/{slug}
/story/{slug}/{chapter}
```

These routes retain the Left Sidebar on desktop and let the main region use the released grid
column. Story management routes are not treated as public reading routes.

---

# 13. Story Reader Width

Story Reader requires stronger reading constraints.

Recommended reading column:

```text
680–760px
```

Do not place long-form text across a 1200px-wide column.

---

# 14. Sticky Elements

Desktop may use sticky:

- Header
- Sidebar sections
- Story reader controls

Only when useful.

Avoid excessive sticky UI that reduces reading space.

---

# 15. Mobile Layout

Mobile collapses to:

```text
Header
Main Content
Optional Bottom Navigation
```

Desktop sidebars disappear or move into temporary navigation surfaces.

---

# 16. Overlays

Mobile menus should use:

- Sheet
- Drawer
- Dialog

rather than forcing desktop sidebars into narrow layouts.

---

# 17. Scroll

The main page uses normal document scrolling.

Avoid creating unnecessary nested scroll containers.

Nested scrolling is acceptable only when a component genuinely requires it.

---

# 18. Z-Index

Use a controlled layering system.

Conceptually:

```text
content
sticky navigation
dropdown
overlay
dialog
toast
```

Do not assign arbitrary extremely large z-index values throughout components.

Canonical implementation layers:

```text
sticky: 20
dropdown: 40
overlay: 50
dialog: 60
toast: 70
```
