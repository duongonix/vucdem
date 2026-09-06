# Validation

This file defines shared MVP validation limits. UI and trusted endpoints must import or mirror these values; HTML attributes alone are not authoritative.

## Authentication and profile setup

- Username: 3–24 characters, ASCII letters, digits, and underscore only; trim and lowercase with the `en-US` locale before reservation.
- Display name: 2–50 trimmed Unicode characters.
- Bio: at most 300 trimmed Unicode characters.
- Password: 8–128 characters. Firebase Authentication remains responsible for credential policy and storage.
- Email: syntactically valid after trimming.

Username reservation uses the normalized value as `usernames/{usernameNormalized}`. The trusted profile endpoint always writes `role = user`, `status = active`, and zero counters; these values are not accepted from the browser.

## Images

- Accepted MIME types: `image/jpeg`, `image/png`, `image/webp`.
- Avatar maximum: 5 MiB.
- Other image maximum: 10 MiB.
- Empty files are rejected.
- Post image slots are integers from 1 through 10.

## Story audio

- Accepted MIME types: MP3, M4A, AAC, OGG, and WAV audio.
- Maximum file size: 100 MiB; empty files are rejected before upload.
- Cloudinary signing restricts formats and always chooses `resource_type=video` server-side.
- Persisted metadata must match the exact server-derived Story/Chapter public ID and configured
  Cloudinary video delivery URL. Audio Chapters require an asset; text Chapters reject one.

## Posts

- Title: at most 180 trimmed characters; publication requires at least 5.
- Content: safe Markdown text, at most 50,000 trimmed characters; publication requires at least 20.
- Markdown images, raw HTML tags, and links outside `http`, `https`, or `mailto` are invalid.
- Excerpt: generated from punctuation-stripped plain text and capped at 240 characters.
- Tags: at most 5 unique normalized tags, each 1–24 characters.
- Category: one canonical `PostCategory`; arbitrary strings are rejected.
- Drafts may be incomplete. Published Posts must satisfy every publication minimum.

Browser validation provides immediate feedback. Cloudinary must also restrict the resource type through signed endpoints/account policy; persisted media uses only the returned `secure_url` and `public_id`.

## Stories

- Title: at most 180 trimmed characters; publication requires at least 5.
- Description: at most 2,000 trimmed characters; publication requires at least 20.
- Tags: at most 8 unique normalized tags, each 1–24 characters.
- Drafts may be incomplete.
- First publication requires a cover and at least one Chapter.
- Text Chapter and short Story prose may include safe Markdown. Markdown images, raw HTML tags, and
  links outside `http`, `https`, or `mailto` are invalid.
- Slug bases are deterministic lowercase ASCII, at most 72 characters; collision suffixes are reserved atomically.
