# Colors

This document defines the canonical color system for vucdem.

---

# 1. Base Palette

```css
--background: #050505;

--surface: #090909;
--surface-2: #0d0d0d;
--surface-hover: #130b0b;

--border: #222222;
--border-red: #3a1010;

--red: #d82323;
--red-bright: #ff3434;
--red-dark: #7a1010;
--red-muted: #4d1212;

--text: #e8e5e5;
--text-secondary: #969191;
--text-muted: #666161;
```

These values define the base visual identity.

---

# 2. Background

Primary application background:

```css
--background: #050505;
```

Use for:

- Main page background
- Large empty regions
- Root application surface

Avoid pure:

```css
#000000
```

for every surface because it removes useful visual depth.

---

# 3. Surface

Primary surface:

```css
--surface: #090909;
```

Use for:

- Cards
- Sidebars
- Content containers
- Editors

Secondary/elevated surface:

```css
--surface-2: #0d0d0d;
```

Use for:

- Menus
- Nested controls
- Secondary panels
- Elevated content

---

# 4. Hover

```css
--surface-hover: #130b0b;
```

Use selectively for hover states.

Do not turn every hover into bright red.

---

# 5. Borders

Default:

```css
--border: #222222;
```

Accent:

```css
--border-red: #3a1010;
```

Use `--border-red` for:

- Selected items
- Active navigation
- Horror accent sections
- Focused content

---

# 6. Primary Red

```css
--red: #d82323;
```

Use for:

- Primary buttons
- Active vote
- Active navigation indicator
- Important links
- Selected states

---

# 7. Bright Red

```css
--red-bright: #ff3434;
```

Use sparingly.

Appropriate for:

- Strong hover
- Critical accent
- Small highlights

Do not use as large background surfaces.

---

# 8. Dark Red

```css
--red-dark: #7a1010;
```

Use for:

- Dark active backgrounds
- Destructive states
- Secondary red accents

---

# 9. Muted Red

```css
--red-muted: #4d1212;
```

Use for:

- Selected backgrounds
- Subtle tags
- Low-intensity horror accents

---

# 10. Primary Text

```css
--text: #e8e5e5;
```

Use for:

- Titles
- Main body
- Important labels

Avoid pure white for all typography.

---

# 11. Secondary Text

```css
--text-secondary: #969191;
```

Use for:

- Metadata
- Secondary descriptions
- Timestamps
- Supporting labels

---

# 12. Muted Text

```css
--text-muted: #666161;
```

Use for:

- Disabled metadata
- Placeholder-like secondary information
- Very low-priority labels

Do not use muted text for important long-form content.

---

# 13. Semantic Colors

Canonical semantic colors:

```css
--success: #4c956c;
--warning: #c38b43;
--error: #e04444;
--info: #648cad;
```

Use these for:

```text
success
warning
error
info
```

They remain muted enough to fit the dark visual system.

Do not reuse crimson for every semantic meaning.

---

# 14. Text Selection

Text selection may use a dark crimson background.

Example:

```css
::selection {
	background: #7a1010;
	color: #ffffff;
}
```

---

# 15. Scrollbars

Custom scrollbars may use:

```text
track → background/surface
thumb → border/light neutral
hover → muted red
```

Keep them subtle.

---

# 16. Theme

The MVP uses the canonical dark theme.

A light theme is not required for MVP.

Do not build a parallel light design system unless explicitly requested.
