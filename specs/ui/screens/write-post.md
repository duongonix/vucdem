# Write Post Screen

Canonical route:

```text
/write
```

with Post mode selected.

---

# 1. Goal

Provide a focused interface for creating standalone Posts.

The editor should feel like a writing tool, not an administrative form.

---

# 2. Mode Selection

Top-level content type selection:

```text
Bài viết
Truyện
```

Active:

```text
Bài viết
```

Switching to Story should move to the Story creation experience.

If unsaved Post content exists, confirm before discarding it.

---

# 3. Desktop Layout

Recommended:

```text
┌───────────────────────────────────────────────────────┐
│ Header                                                │
├──────────────────────────────────┬────────────────────┤
│ Editor                           │ Post Settings      │
│                                  │                    │
│ Title                            │ Category           │
│ Content                          │ Community          │
│                                  │ Tags               │
│                                  │ Thumbnail          │
│                                  │                    │
│                                  │ Draft / Publish    │
└──────────────────────────────────┴────────────────────┘
```

The writing area should receive more width than settings.

---

# 4. Title

Large clean title input.

Do not visually style it like a normal small form input.

Placeholder example:

```text
Tiêu đề câu chuyện...
```

---

# 5. Content Editor

The content editor is the primary screen element.

It should support the canonical content format selected by implementation.

Potential formatting:

- Paragraph
- Heading
- Bold
- Italic
- Quote
- List
- Image insertion

Do not create a full enterprise CMS editor.

---

# 6. Category

Required for publication.

Use controlled options corresponding to canonical Post categories.

---

# 7. Community

Optional unless specific Community workflow requires it.

Provide:

```text
Không chọn cộng đồng
```

as a valid state where allowed.

---

# 8. Tags

Allow bounded Tag entry.

UI should prevent:

- Empty Tags
- Duplicate Tags
- Excessive Tags

---

# 9. Thumbnail

Allow:

- Select image
- Preview
- Replace
- Remove

Upload uses signed Cloudinary flow.

---

# 10. Additional Images

If supported by the editor, show:

- Upload progress
- Preview
- Remove
- Retry

Do not allow image count beyond validation limits.

---

# 11. Draft Action

Provide:

```text
Lưu bản nháp
```

Draft does not require every publication field.

Successful save should provide clear feedback.

---

# 12. Publish Action

Primary action:

```text
Đăng bài
```

Before publishing:

1. Validate fields.
2. Complete required uploads.
3. Prevent duplicate submission.
4. Create/update Firestore document.
5. Navigate to Post Detail on success.

---

# 13. Validation Errors

Errors should appear near relevant fields.

Example:

```text
Tiêu đề không được để trống.
```

Do not rely only on a generic Toast for form validation.

---

# 14. Upload State

Each media item may have:

```text
idle
uploading
success
error
```

Do not allow publishing with unresolved required uploads.

---

# 15. Publish Loading

While publishing:

- Disable duplicate Publish
- Keep content visible
- Show progress state

Do not clear editor state until publication succeeds.

---

# 16. Failure

If publication fails:

- Preserve content
- Preserve successful media metadata
- Explain failure
- Allow retry

---

# 17. Unsaved Changes

Warn before leaving when meaningful unsaved changes exist.

Examples:

```text
Navigate away
Switch Post → Story
Close editor
```

Do not show the warning when the form is effectively empty.

---

# 18. Mobile

Mobile layout becomes:

```text
Mode
Title
Content
Category
Community
Tags
Thumbnail
Images
Save Draft
Publish
```

Do not keep a desktop settings sidebar.

---

# 19. Guest

Guest cannot use the editor.

Opening:

```text
/write
```

should redirect to authentication while preserving the intended destination.

---

# 20. Accessibility

Inputs require proper labels.

Formatting controls require accessible names.

Keyboard writing experience must remain usable.
