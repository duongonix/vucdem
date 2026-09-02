# Stories

Stories support `text`, `audio`, and `interactive` content. Interactive is a structured messaging experience described in `specs/features/interactive-stories.md`; it is not HTML or a text-area variant.

## Goal and Phase 17 scope

Phase 17 implements Story metadata persistence. Story creation UI, Chapters, Story management, detail, reader, voting, and following are handled by later requested phases.

## Routes and services

- `POST /api/stories` creates an owner Draft using a preallocated ID.
- `GET /api/stories/{id}` reads public metadata or an owner-only non-public Story.
- `PATCH /api/stories/{id}` edits owner metadata/status or performs logical removal.
- `GET /api/stories/slug/{slug}` resolves `storySlugs/{slug}` to the Story.

The client service exposes ID generation, create, update, remove, ID read, and slug read operations.

## Story ratings

Public Story detail displays the aggregate rating and count. Authenticated active Users may assign
one integer rating from 1 to 5 and may later replace it. Guests can view aggregate ratings; selecting
a star starts the existing login flow. Rating writes use a trusted transaction at
`PUT /api/stories/{id}/rating`; clients cannot mutate aggregate fields directly.

## Story formats

`serial` Stories contain one or more Chapters and follow the ongoing/hiatus/completed lifecycle.
`short` Stories contain exactly one immutable-identity Chapter holding the complete prose. They do
not expose Chapter creation/removal or a Chapter list and publish from Draft directly to Completed.
Existing Stories without `format` are treated as `serial`.

Both formats support prose and audio. A short Story selects text or audio for its single stable
`short-story` Chapter. Every serialized Chapter independently selects text or audio, so a serial
Story may aggregate to `contentFormat = mixed`. Detail and discovery surfaces show an audio or
mixed badge and audio Chapter durations. Reading stays on the canonical Chapter route and retains
the same comments, bookmarks, following, reporting, and navigation behavior.

## Slugs

Slug normalization is deterministic lowercase ASCII with Vietnamese `đ → d`, diacritic removal, dash separation, and a maximum base length of 72. Creation reserves `storySlugs/{slug}` atomically with the Story. Collisions try `-2` through `-100`. Slugs are immutable and retained after logical removal to avoid unsafe URL reuse.

## Status transitions

- `draft → draft | ongoing`
- `ongoing → ongoing | hiatus | completed`
- `hiatus → hiatus | ongoing | completed`
- `completed → completed`
- any owner-managed state may be logically removed

First publication requires a valid title, description, cover, and at least one Chapter; it sets `publishedAt` once and increments the author's `storyCount`. Removing a public Story decrements that counter once.

## Security and protected fields

Ownership and author snapshots come from trusted User data. Slug, counters, timestamps, first-publication time, and moderation states cannot be supplied independently by the browser. Cover metadata must match `vucdem/stories/{storyId}/cover` in the configured Cloudinary cloud.
