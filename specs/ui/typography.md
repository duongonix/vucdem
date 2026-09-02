# Typography

This document defines typography for vucdem.

---

# 1. Typography Strategy

vucdem combines:

```text
Editorial serif
+
Modern neutral sans-serif
```

Serif typography communicates storytelling and horror editorial identity.

Sans-serif typography maintains application usability.

---

# 2. UI Font

Preferred UI fonts:

```text
Geist
Inter
system-ui
sans-serif
```

Recommended stack:

```css
font-family:
	'Geist',
	'Inter',
	system-ui,
	-apple-system,
	BlinkMacSystemFont,
	'Segoe UI',
	sans-serif;
```

The implementation self-hosts `Geist Variable` through `@fontsource-variable/geist` so the UI does not depend on a runtime font CDN.

Use for:

- Navigation
- Buttons
- Metadata
- Inputs
- Labels
- Menus
- Comments
- Application controls

---

# 3. Editorial Font

Preferred:

```text
Cormorant Garamond
```

Alternatives:

```text
Crimson Pro
Georgia
serif
```

Recommended stack:

```css
font-family: 'Cormorant Garamond', 'Crimson Pro', Georgia, serif;
```

The implementation self-hosts `Cormorant Garamond Variable` through `@fontsource-variable/cormorant-garamond`, including Vietnamese glyph coverage.

Use selectively for:

- Post titles
- Story titles
- Story reader headings
- Editorial quotations
- Major literary headings

---

# 4. Do Not Overuse Serif

Do not use serif typography for:

- Buttons
- Input labels
- Navigation
- Technical metadata
- Dropdowns
- Settings
- Form controls

The contrast between serif and sans-serif is intentional.

---

# 5. Body Text

Normal UI body:

```text
14–16px
line-height: 1.5–1.7
```

Long-form reading:

```text
17–20px
line-height: 1.7–1.9
```

Long-form text should prioritize comfort.

---

# 6. Post Card Title

Recommended desktop range:

```text
22–28px
```

Use editorial serif.

Weight:

```text
500–700
```

depending on the selected font.

---

# 7. Story Title

Story detail title may use:

```text
36–56px
```

depending on viewport.

Avoid oversized hero typography that consumes most of the screen.

---

# 8. Story Reader

Chapter title:

```text
32–44px
```

Body:

```text
18–20px
```

Line height:

```text
1.75–1.9
```

Reader width must remain constrained.

---

# 9. Metadata

Metadata should normally use:

```text
12–14px
```

and:

```text
var(--text-secondary)
```

Examples:

- Username
- Time
- Views
- Comment count
- Chapter count

---

# 10. Section Labels

Small uppercase labels may be used for sidebar sections.

Example:

```text
KHÁM PHÁ
CHỦ ĐỀ
ĐANG THỊNH HÀNH
```

Recommended:

```text
11–12px
letter-spacing: 0.08em–0.14em
```

Use sparingly.

---

# 11. Line Length

Long-form Story reader body should generally remain around:

```text
60–80 characters per line
```

Do not stretch reading text across the full desktop viewport.

---

# 12. Weight

Avoid using bold everywhere.

Hierarchy should use combinations of:

- Font family
- Size
- Weight
- Color
- Spacing

rather than only font weight.

---

# 13. Vietnamese

All selected fonts must render Vietnamese diacritics correctly.

Do not use a decorative font that lacks Vietnamese character support for primary content.
