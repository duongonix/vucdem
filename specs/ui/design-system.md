# Design System

This document defines the canonical visual design system for vucdem.

All pages and components must follow this specification unless a more specific screen specification overrides it.

---

# 1. Design Direction

vucdem uses a dark horror editorial design language.

The interface should feel like:

```text
Underground horror community
+
Premium horror publication
+
Reddit-like content hierarchy
```

The UI must remain readable and functional.

Horror atmosphere should primarily come from:

- Color
- Typography
- Photography
- Illustration
- Spacing
- Contrast
- Content

Do not create horror atmosphere by making the interface difficult to use.

---

# 2. Core Characteristics

The visual system uses:

- Near-black backgrounds
- Crimson red accents
- Thin borders
- Low-contrast surfaces
- Sharp or minimally rounded corners
- Serif typography for literary content
- Sans-serif typography for application UI
- Muted metadata
- Cinematic horror imagery
- Dense but controlled desktop layouts

---

# 3. Avoid

Do not make vucdem look like:

- Generic SaaS dashboard
- Corporate admin dashboard
- Gaming launcher
- Neon cyberpunk application
- Crypto dashboard
- Cartoon horror website
- Glassmorphism interface

Avoid excessive:

- Gradients
- Glow
- Blur
- Rounded cards
- Floating cards
- Shadows
- Decorative animations
- Red everywhere

Red should be an accent, not the default surface color.

---

# 4. Shape Language

Default components should feel relatively sharp.

Preferred:

```text
border-radius: 0px
border-radius: 2px
border-radius: 4px
```

Small exceptions may use:

```text
6px
```

for controls where necessary.

Avoid:

```text
12px
16px
20px
24px
9999px
```

for normal cards and containers.

Pills are allowed only when the component concept naturally requires a pill shape.

Examples:

- Tags
- Small status indicators
- Compact filters

---

# 5. Borders

Borders are important to the vucdem visual language.

Prefer:

```text
1px solid var(--border)
```

Use red-tinted borders for:

- Active states
- Important horror accents
- Selected navigation
- Focused content

Avoid thick borders unless used deliberately.

---

# 6. Surfaces

The interface uses several near-black layers rather than large color differences.

Conceptually:

```text
Background
    ↓
Surface
    ↓
Elevated Surface
    ↓
Hover Surface
```

Cards should often be separated through:

- Border
- Slight background difference
- Spacing

rather than large shadows.

---

# 7. Shadows

Use shadows sparingly.

Preferred:

```text
none
```

or subtle shadows for overlays.

Dialogs and menus may use a controlled dark shadow to separate them from the page.

Do not use large soft SaaS-style card shadows.

---

# 8. Red Accent

Crimson red communicates:

- Active state
- Voting
- Important action
- Selection
- Horror identity
- Alerts

Do not use bright red for large backgrounds.

Prefer red as:

- Icon color
- Text accent
- Border
- Small button
- Active indicator
- Focus indicator

---

# 9. Primary Action

Primary actions may use a solid crimson background.

Examples:

```text
Đăng bài
Xuất bản
Đăng chương
Theo dõi
```

Primary buttons should remain visually compact.

Avoid oversized CTA buttons inside normal application surfaces.

---

# 10. Secondary Action

Secondary actions should normally use:

- Dark surface
- Thin border
- Neutral text

Hover may introduce:

- Slightly lighter surface
- Red-tinted border
- Brighter text

---

# 11. Destructive Action

Destructive actions use red carefully.

Examples:

```text
Xóa bài
Xóa truyện
Gỡ nội dung
```

Destructive actions should require confirmation when data loss is meaningful.

---

# 12. Cards

Cards should normally use:

```text
background: var(--surface)
border: 1px solid var(--border)
border-radius: 2px–4px
```

Avoid cards nested inside multiple rounded cards.

Content hierarchy should remain visually simple.

---

# 13. Post Cards

Post Cards are editorial content blocks.

They should emphasize:

1. Title
2. Author/context
3. Excerpt
4. Thumbnail
5. Engagement

The title should visually dominate metadata.

---

# 14. Story Cards

Story Cards should feel slightly more literary than Post Cards.

They may emphasize:

- Cover
- Story title
- Author
- Status
- Chapter count
- Description
- Tags

Do not make Story Cards resemble product cards from an e-commerce site.

---

# 15. Inputs

Inputs should use:

- Dark background
- Thin border
- Clear focus state
- Neutral placeholder
- Minimal rounding

Focus:

```text
border → crimson
```

Avoid glowing input outlines.

---

# 16. Textareas and Editors

Writing surfaces should feel calm and spacious.

The editor must prioritize writing comfort over horror decoration.

Long-form writing areas may use a warmer/darker reading surface than normal UI controls.

---

# 17. Dialogs

Dialogs should use:

- Near-black background
- Thin border
- Minimal radius
- Strong title
- Clear actions

The background overlay should darken the page without excessive blur.

---

# 18. Dropdowns

Dropdowns should visually continue the dark application surface.

Use:

- Thin border
- Compact rows
- Clear active state
- Red accent where appropriate

---

# 19. Tabs

Tabs should normally use text + underline/border state rather than large pill containers.

Preferred:

```text
Tất cả    Truyện    Chuyện thật    Creepypasta
──────
active
```

Avoid oversized segmented-control styling unless a specific screen requires it.

---

# 20. Tags

Tags should be compact.

Preferred style:

```text
dark surface
thin border
muted text
small typography
```

Hover/active:

```text
red-tinted border
brighter text
```

---

# 21. Voting

Voting is a major interaction pattern.

Typical vertical desktop layout:

```text
↑
604
↓
```

Active Upvote:

```text
crimson
```

Active Downvote may use a distinct muted/cool state if defined later.

Do not rely exclusively on color.

---

# 22. Empty States

Empty states should remain atmospheric but useful.

They should contain:

- Short message
- Optional explanation
- Relevant action

Avoid giant illustrations unless a screen specifically benefits from them.

---

# 23. Loading States

Prefer skeletons for:

- Feed
- Story cards
- Profile content
- Comments

Skeletons should approximate final content dimensions.

Avoid distracting animated effects.

---

# 24. Error States

Errors should clearly explain:

- What failed
- Whether retry is possible
- What the User can do next

Technical backend errors must not be exposed directly.

---

# 25. Motion

Motion should be subtle.

Recommended:

```text
100–200ms
```

for:

- Hover
- Focus
- Dropdown
- Dialog
- Tab changes

Avoid:

- Bouncing
- Large scaling
- Excessive parallax
- Constant horror flickering
- Screen shaking

Horror effects must never interfere with usability.

---

# 26. Accessibility

All interactive controls require:

- Visible focus state
- Keyboard accessibility where appropriate
- Sufficient contrast
- Accessible names

Icon-only controls require accessible labels.

Do not communicate state using color alone.

---

# 27. shadcn-svelte

shadcn-svelte is used as a primitive component foundation.

Default shadcn appearance is not the final design.

Components must be restyled to match vucdem.

---

# 28. Lucide

Use the maintained official `@lucide/svelte` package for interface icons.

Do not mix unrelated icon libraries without a strong reason.

---

# 29. Consistency

Before creating a new UI pattern:

1. Check existing vucdem components.
2. Check `specs/ui/components.md`.
3. Reuse an existing pattern where possible.
4. Introduce a new pattern only when necessary.

Consistency takes priority over decorative novelty.
