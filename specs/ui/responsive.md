# Responsive Design

This document defines responsive behavior for vucdem.

---

# 1. Principle

vucdem is desktop-first but all core features must remain usable on mobile.

Responsive behavior should adapt information hierarchy rather than simply shrink desktop UI.

---

# 2. Primary Breakpoints

Conceptual breakpoints:

```text
Mobile
< 640px

Tablet
640px–899px

Compact Desktop
900px–1279px

Desktop
>= 1280px
```

Tailwind breakpoints may be mapped appropriately.

---

# 3. Desktop

At:

```text
>= 1280px
```

use the full application layout:

```text
Left Sidebar
Main Content
Right Sidebar
```

---

# 4. Compact Desktop

At approximately:

```text
900px–1279px
```

move the Right Sidebar blocks below the Left Sidebar in a compact presentation.

Layout:

```text
Left Sidebar + supplementary discovery blocks
Main Content
```

Main content receives the freed space.

---

# 5. Tablet

Below approximately:

```text
900px
```

hide the persistent Left Sidebar.

Layout becomes:

```text
Header
Main Content
```

Sidebar navigation should remain accessible through:

- Menu
- Sheet
- Drawer

When the temporary Left Sidebar opens, supplementary Right Sidebar discovery blocks appear below
the primary navigation. Focused reading, Messages, and Settings routes continue to omit them.

---

# 6. Mobile

Below approximately:

```text
640px
```

use a single-column layout.

Prioritize:

- Content
- Navigation
- Core actions

Remove decorative secondary content before removing functional controls.

---

# 7. Header

Desktop Header may show:

```text
Logo
Full navigation
Search
Notifications
Avatar
Đăng bài
```

Tablet may reduce navigation.

Mobile may show:

```text
Menu
Logo
Search
Profile / Create
```

Exact arrangement is screen-dependent.

---

# 8. Search

Desktop may use a visible search field.

Mobile may collapse search into an icon that opens a dedicated search surface.

---

# 9. Post Card

Desktop:

```text
Vote | Content | Thumbnail
```

Mobile:

```text
Metadata
Title
Excerpt
Thumbnail
Actions
```

Do not keep the desktop vertical Vote column if it causes cramped content.

Voting may move into the horizontal action row.

---

# 10. Story Cards

Desktop may display cover and metadata side-by-side.

Mobile should use a compact layout with:

- Smaller cover
- Title
- Author
- Status
- Essential metadata

---

# 11. Post Detail

Desktop may use:

```text
Main Post
+
Secondary sidebar
```

Mobile:

```text
Post
Actions
Comments
```

Secondary recommendations move below content or disappear.

---

# 12. Story Detail

Desktop:

```text
Cover
Story metadata
Actions
Chapter list
Secondary information
```

Mobile:

```text
Cover
Title
Author
Actions
Description
Chapter list
```

---

# 13. Story Reader

Mobile Story Reader should maximize readable space.

Hide unnecessary global navigation while reading if appropriate.

Maintain easy access to:

- Previous Chapter
- Next Chapter
- Chapter list
- Reader settings

---

# 14. Editors

Desktop editors may use side panels for metadata.

Mobile editors should use a single vertical flow.

Example:

```text
Title
Category
Tags
Content
Media
Publish
```

Avoid side-by-side editor controls on narrow screens.

---

# 15. Dialogs

Desktop may use centered dialogs.

Mobile should use:

- Near-full-width dialog
- Sheet
- Bottom sheet

depending on interaction.

---

# 16. Touch Targets

Mobile interactive targets should generally be at least approximately:

```text
44 × 44px
```

even when the visible icon is smaller.

---

# 17. Horizontal Overflow

Core screens must not create accidental horizontal page scrolling.

Long:

- Titles
- Usernames
- URLs
- Tags

must wrap or truncate appropriately.

---

# 18. Images

Images must use responsive sizing.

Avoid fixed dimensions that overflow mobile containers.

---

# 19. Typography

Large desktop typography must scale down.

Example:

```text
Story title

Desktop: 48px
Tablet: 40px
Mobile: 32px
```

Exact implementation may use responsive Tailwind classes.

---

# 20. Feature Parity

Mobile must retain core functionality.

Do not remove:

- Voting
- Comments
- Bookmark
- Follow
- Publishing
- Story reading

simply because the viewport is small.

## Mobile bottom navigation

Below 900px, primary navigation is available through the header drawer; there is no persistent
bottom navigation. The header retains a compact publish button at every mobile width, showing its
accessible plus icon on narrow screens and the `Đăng` label when space permits. Guest publishing
uses the existing authentication redirect. Header controls remain compact enough to avoid
horizontal overflow, and motion must respect `prefers-reduced-motion`.

The mobile drawer adds `Bảng Xếp Hạng` to its discovery navigation and links it to `/ranks`, because
the desktop header navigation is hidden at this viewport width. Its active state follows the current
route like the other drawer destinations.

Only secondary presentation may be reduced.

## Comment replies

Compact reply composers must remain within the nested thread column on mobile. They hide the
duplicated composer avatar and unsupported media controls below 640px, allow the toolbar to wrap,
and keep Spoiler plus Gửi accessible without horizontal scrolling. The root composer retains its
normal identity and tool layout.
