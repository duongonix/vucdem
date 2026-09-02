# Story Reader Screen

Interactive chapters render inside a realistic branded phone shell on desktop: metal bezel, hardware buttons, dynamic island, status bar, contact header, message viewport, composer and home indicator. Mobile retains the phone language while using nearly all available reading height. The visual language remains near-black/crimson. Tapping the screen advances exactly one event; choices and restart remain native keyboard-accessible buttons.

The simulated device uses the iPhone 16 Pro Max body proportion (`77.6 / 163`) and scales uniformly from available viewport height. Its reader must preserve this aspect ratio rather than independently stretching width and height.

Canonical route:

```text
/story/{slug}/{chapter}
```

---

# 1. Goal

Story Reader provides a distraction-minimized long-form horror reading experience.

Reading comfort takes priority over the normal dense community layout.

---

# 2. Layout

Recommended desktop structure:

```text
┌───────────────────────────────────────────────────────┐
│ Compact Header                                        │
├───────────────────────────────────────────────────────┤
│                                                       │
│               Story Title                             │
│               Chapter 04                              │
│               Chapter Title                           │
│                                                       │
│               Long-form content                       │
│               Long-form content                       │
│               Long-form content                       │
│                                                       │
│          Previous        Chapter List       Next      │
│                                                       │
└───────────────────────────────────────────────────────┘
```

---

# 3. Reading Column

Recommended width:

```text
680–760px
```

Center the reading column.

Do not stretch Chapter text across the entire viewport.

---

# 4. Chapter Header

Display:

- Story title
- Chapter number
- Chapter title
- Optional publication date

Story title is secondary to Chapter title.

---

# 5. Typography

Recommended Chapter body:

```text
18–20px
line-height: 1.75–1.9
```

Body font should prioritize readability.

A high-quality serif may be used for reading body if Vietnamese rendering is excellent.

Otherwise use the primary readable sans-serif.

---

# 6. Paragraph Spacing

Paragraphs require enough separation for long reading sessions.

Avoid dense walls of text.

Do not indent and add large paragraph margins simultaneously unless deliberately chosen.

---

# 7. Reader Background

Use a near-black reading surface.

Avoid pure black + pure white high-contrast combinations that can cause eye strain.

Use:

```text
background → #050505 / related dark surface
text → #e8e5e5
```

---

# 8. Global Navigation

The full desktop application Header may be simplified while reading.

Keep access to:

- vucdem
- Back to Story
- Chapter list
- User controls where appropriate

Avoid distracting discovery content beside Chapter text.

---

# 9. Previous Chapter

Show when a previous published Chapter exists.

Otherwise disable or omit.

---

# 10. Next Chapter

Show when a next published Chapter exists.

This should be the strongest navigation action at the end of a Chapter.

---

# 11. Chapter List

Provide access to Chapter selection.

Desktop may use:

- Dropdown
- Sheet
- Side panel

Mobile may use:

- Bottom sheet
- Full-screen sheet

Do not permanently consume large reading width with a Chapter sidebar.

---

# 12. Reader Settings

Optional reader settings may include:

```text
Font size
Reading width
Line height
```

MVP should keep these settings simple.

Do not build a complex theme engine unless required.

---

# 13. Reading Progress

Future or MVP implementation may remember the last Chapter read.

If implemented, reading progress should allow Story Detail to display:

```text
Đọc tiếp
```

Do not mark a Chapter completed merely because it was loaded if the feature requires meaningful reading progress.

---

# 14. Chapter End

At the end display:

```text
Previous Chapter
Back to Story
Next Chapter
```

Optional:

```text
Follow Story
```

when not already followed.

---

# 15. Comments

If Chapter comments are introduced, they should appear after the reading experience.

Do not place discussion beside long-form text.

If comments are not explicitly supported by the content model, do not invent them.

---

# 16. Mobile

Mobile reading should use nearly full available width with controlled horizontal padding.

Recommended:

```text
16–20px horizontal padding
```

Hide unnecessary global UI.

---

# 17. Accessibility

Reader must support:

- Text zoom
- Browser zoom
- Keyboard scrolling
- Keyboard navigation where appropriate
- Sufficient contrast

Do not disable normal browser text selection.

---

# 18. Loading

Loading should preserve the reading column position.

Avoid flashing unrelated Feed UI while Chapter content loads.

---

# 19. Not Found

If:

- Story does not exist
- Chapter does not exist
- Chapter is not published for this User

show the appropriate unavailable/Not Found state.

Do not leak unpublished Chapter content.
