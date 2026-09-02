# Search

## Goal and route

`/search?q={query}` provides scalable MVP discovery. A query must contain at least two
trimmed characters. The Header submits directly to this route.

## Supported discovery

- Users: normalized substring matching across username, display name, and bio.
- Posts: normalized substring matching across title, excerpt/body, tags, and author snapshot.
- Stories: normalized substring matching across title, description, tags, and author snapshot.

One query renders all three result lists together; Search has no content-type tabs and does not
return Communities. Until a dedicated full-text engine is introduced, matching runs server-side
against a bounded candidate window for each public collection. The browser never downloads whole
collections. Search is accent-insensitive and case-insensitive, but results outside the bounded
candidate window are not guaranteed in this transitional MVP implementation.

## Acceptance criteria

Queries are bounded, public results do not reveal draft/hidden/removed content, and links
resolve to canonical profile, Post, and Story routes.
