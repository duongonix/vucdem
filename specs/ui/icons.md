# Icons

This document defines icon usage in vucdem.

---

# 1. Icon Library

Canonical icon library:

```text
@lucide/svelte
```

Use Lucide for application UI icons.

---

# 2. Do Not Mix Libraries

Do not introduce:

- Font Awesome
- Material Icons
- Heroicons
- Bootstrap Icons

for icons already available in Lucide.

A custom icon is acceptable only when the vucdem brand or a unique product concept requires it.

---

# 3. Common Icons

Recommended mappings:

```text
Home
→ House

Search
→ Search

Notifications
→ Bell

Create
→ Plus

Comments
→ MessageCircle

Views
→ Eye

Bookmark
→ Bookmark

Settings
→ Settings

User
→ User

Community
→ Users

More actions
→ MoreHorizontal

Edit
→ Pencil

Delete
→ Trash2

Share
→ Share2

Back
→ ArrowLeft

Next
→ ChevronRight

Previous
→ ChevronLeft

Close
→ X

Menu
→ Menu
```

---

# 4. Voting

Possible Lucide icons:

```text
ChevronUp
ChevronDown
```

or:

```text
ArrowUp
ArrowDown
```

Use one pair consistently throughout the application.

Do not mix voting icon styles between Feed and Post Detail.

---

# 5. Default Size

Typical UI icons:

```text
16px
18px
20px
```

Large navigation/action icons may use:

```text
22–24px
```

Avoid oversized decorative UI icons.

---

# 6. Stroke Width

Prefer consistent Lucide stroke width.

Do not randomly mix heavy and thin icons.

---

# 7. Icon Buttons

Icon-only buttons require accessible labels.

Example:

```text
Bookmark icon
aria-label="Lưu bài viết"
```

---

# 8. Active State

Active icons may use:

```text
var(--red)
```

Inactive:

```text
var(--text-secondary)
```

Hover:

```text
var(--text)
```

---

# 9. Brand Icon

The vucdem logo is not required to use Lucide.

A custom occult/horror eye symbol may be used as the primary brand mark.

The brand mark must remain visually simple enough for:

- Header
- Favicon
- Mobile navigation
- Avatar-sized contexts

---

# 10. Decorative Icons

Avoid adding icons to every text label.

Use icons when they improve:

- Recognition
- Navigation
- Interaction
- Scannability

not merely as decoration.
