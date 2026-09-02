# Post Categories

## Purpose

`postCategories` is the administrator-managed taxonomy shared by the Post editor and the Home left-sidebar topic list.

## Firestore path

```text
postCategories/{categoryId}
```

The document ID is the stable lowercase kebab-case category identifier. It is immutable after creation because Posts persist it in `posts.category`.

## Fields

| Field         | Type                 | Required | Description                                                                                   |
| ------------- | -------------------- | -------: | --------------------------------------------------------------------------------------------- |
| `name`        | string               |      yes | Vietnamese display name, 2–80 characters.                                                     |
| `description` | string               |      yes | Optional-display description, at most 240 characters; stored as an empty string when omitted. |
| `order`       | integer              |      yes | Display order from 0 through 999.                                                             |
| `status`      | `active \| inactive` |      yes | Only active categories are available to ordinary users.                                       |
| `createdAt`   | timestamp            |      yes | Trusted server creation time.                                                                 |
| `updatedAt`   | timestamp            |      yes | Trusted server modification time.                                                             |

Initial documents are `thong-bao`, `dong-gop`, `thac-mac`, `chia-se`, and `ke-chuyen`. The trusted categories endpoint idempotently creates this initial set when the collection is empty.

## Permissions

- Anyone may read the active category list through `GET /api/post-categories`.
- Only an active persisted Admin may list all categories or create, update, and delete through `/api/admin/post-categories`.
- Direct Browser Firestore access remains denied.
- A category referenced by any Post cannot be deleted. Admins must mark it inactive instead.
- Post create/update endpoints reject missing or inactive category IDs.

## Indexes

No composite index is required. The bounded category collection is sorted by `order` on the trusted server.
