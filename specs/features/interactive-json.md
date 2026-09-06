# Interactive JSON V1

## Purpose

Interactive JSON is a portable authoring/import/export format for existing `interactive` Story
content. It is not a fourth `contentFormat`, is never stored as a source file, and never bypasses
the normal draft, validation, moderation or persistence workflow.

## Authoring UI

Interactive authoring exposes `Trình chỉnh sửa` and `Nhập JSON` tabs. Both operate on one
`InteractiveStoryContent` state. Import validates and normalizes the entire document before one
atomic editor-state replacement. Existing content requires explicit replacement confirmation.
Switching to the visual editor after import immediately shows the imported Characters and Events.

The JSON tab supports paste, a local `.json` file up to 2 MiB, validation, readable errors,
formatting, a starter template, copying, reloading from current editor state, import and client-side
download export. A manually edited JSON draft is not overwritten merely by switching tabs.

## Root format

```json
{
	"version": 1,
	"conversation": { "title": "Tin nhắn lúc 3 giờ sáng" },
	"characters": [
		{ "id": "player", "name": "Bạn", "role": "player" },
		{ "id": "linh", "name": "Linh", "role": "character" }
	],
	"events": [
		{ "type": "message", "sender": "linh", "text": "Mày còn thức không?" },
		{ "type": "typing", "character": "linh", "duration": 2000 },
		{ "type": "choice", "options": ["Mở cửa", "Không trả lời"] }
	]
}
```

`version` must equal `1`. `conversation.title` is optional and falls back to the current Story or
Chapter title for presentation. Unknown future metadata fields are ignored, but unknown Event
types are rejected.

## Characters

Each Character contains:

- `id`: unique, 1–64 characters, using ASCII letters, numbers, `_` or `-`;
- `name`: 1–48 trimmed characters;
- `role`: `player | character`;
- optional `avatar`: managed media metadata.

There must be exactly one `player`. A document supports at most 24 Characters, matching the domain
model.

## Events

Array order is playback order. `id` is optional, must be unique when supplied, and is generated on
import when absent. V1 supports at most 450 Events:

- `message`: `sender`, `text` (1–2,000 characters);
- `choice`: optional `prompt`, 2–4 non-empty string `options`;
- `system`: non-empty `text`;
- `typing`: `character`, integer `duration` in milliseconds;
- `delay`: integer `duration` in milliseconds;
- `image`: `sender`, `image`, optional `caption`;
- `audio`: `sender`, `audio`.

Typing and delay durations are 250–10,000 ms. Durations from 8,000 ms produce a non-blocking UX
warning. Sender and character references must resolve to `characters[].id`. V1 is linear and does
not support branches, goto, conditions, variables, scripts or callbacks.

## Media security

JSON is untrusted declarative data and is parsed only with `JSON.parse` plus Zod validation. No
code, HTML or expression is evaluated. Media URLs must use HTTPS. Because the current persistence
model accepts only application-managed Cloudinary assets, imported Image, Audio and avatar values
must include a `publicId` inside the current Story/Chapter namespace and a Cloudinary HTTPS URL.
The trusted save endpoint still verifies the exact URL/public-ID metadata and ownership. An
external URL without trusted ownership metadata is rejected; authors must add that media through
the existing signed upload UI instead. Imported `publicId` alone is never authorization to delete
an asset.

## Export

Export uses a browser Blob and contains only `version`, optional `conversation`, `characters` and
ordered `events`. It excludes Story metadata, Firebase IDs/UIDs, timestamps, counters, status,
moderation state and other trusted fields. Exported managed media retains URL/public ID so content
can round-trip inside the owning Story/Chapter.

## Persistence and compatibility

Import updates the current editor draft only. Saving converts the normalized domain model through
the existing API into Story-level Characters and Chapter-level `interactiveEvents`; no JSON blob or
file is persisted. For a serial Story, import/export applies only to the Chapter being edited. For
a short Story, it applies to the stable `short-story` Chapter. Reader and Admin preview consume the
same normalized persisted model regardless of whether the author used JSON or the visual editor.
