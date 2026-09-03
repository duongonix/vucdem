# Post Detail Screen

Canonical route:

```text
/post/{id}
```

---

# 1. Goal

Display the complete Post and provide focused community interaction.

Primary activities:

```text
Read
Vote
Comment
Bookmark
Share
Explore Author/Community
```

---

# 2. Desktop Structure

```text
┌───────────────────────────────────────────────────────┐
│ Header                                                │
├──────────────────────────────────┬────────────────────┤
│ Main Post                        │ Secondary Sidebar  │
│                                  │                    │
│ Author                           │ Related content    │
│ Title                            │ Community          │
│ Content                          │ Author             │
│ Images                           │                    │
│ Tags                             │                    │
│ Actions                          │                    │
│                                  │                    │
│ Comments                         │                    │
└──────────────────────────────────┴────────────────────┘
```

---

# 3. Post Header

Display:

- Community when applicable
- Category
- Author avatar
- Display name
- Username
- Publication time
- Edited state when applicable

---

# 4. Title

Post title uses editorial serif typography.

It should be the strongest visual element on the page.

---

# 5. Body

Post body should use a comfortable reading width.

Recommended:

```text
720–900px
```

Body typography prioritizes readability.

Do not apply decorative gothic fonts to body text.

---

# 6. Images

Images appear naturally within or after Post content according to editor/storage format.

Images should:

- Fit content width
- Preserve aspect ratio
- Support responsive sizes
- Avoid layout shift

---

# 7. Actions

Primary interaction row:

```text
Heart
Heart count

Comments

Bookmark

Share

More
```

Owner's More menu may include:

```text
Edit
Delete
```

Other Users may see:

```text
Report
```

---

# 8. Tags

Tags appear below content or near metadata.

They should remain visually secondary.

---

# 9. Comments

Comments begin after the main Post.

Structure:

```text
Comments header
Comment composer
Sort controls if implemented
Comment tree
```

---

# 10. Comment Nesting

Visible indentation should normally stop after approximately:

```text
2–3 levels
```

Deeper replies should remain readable without pushing text into extremely narrow columns.

---

# 11. Secondary Sidebar

The global discovery Right Sidebar is hidden on the Post reading route. Related content, Community
or Author context may be placed after the focused content in a later feature, but must not consume a
persistent right column while reading.

It may contain, when rendered below the primary content:

- Community information
- More from Author
- Related Posts
- Trending content

Secondary content must not interrupt reading.

---

# 12. Owner State

Post owner receives access to:

```text
Edit
Delete / Remove
```

Protected fields remain controlled by backend/security rules.

---

# 13. Guest State

Guest can read public Post and Comments.

Attempting:

```text
Vote
Comment
Bookmark
Report
```

requires authentication.

Sharing remains public.

---

# 14. Not Found

Missing or inaccessible content must display a proper Not Found state.

Do not leak Draft content through metadata or partial rendering.

---

# 15. Loading

Use a layout-stable skeleton for:

- Metadata
- Title
- Body
- Comments

---

# 16. Mobile

Mobile order:

```text
Author
Title
Post body
Images
Tags
Actions
Comments
Related content
```

Voting becomes horizontal when necessary.

No desktop sidebar is required.
