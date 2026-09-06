# Interactive stories

## Scope

`interactive` is the third Story/Chapter content format beside `text` and `audio`. It is available to short stories and to individual chapters of serial stories. Existing records without `contentFormat` continue to resolve as `text`.

V1 is a linear event timeline. A choice is shown as a message sent by the player and every option resumes the same following event. Branch graphs, variables and conditions are out of scope.

## Authoring

The editor creates exactly one `player` character by default and supports additional fiction characters. It provides message quick-compose and ordered message, choice, system, typing, delay, image and audio events. Events can be edited, duplicated, deleted and moved. A character referenced by an event cannot be deleted.

Interactive authoring has two compatible sub-tabs: the existing visual `Trình chỉnh sửa` and
`Nhập JSON`. JSON V1 is a portable import/export surface that normalizes into the same editor state;
it is not a content format or persistence model. Its schema, security and replacement behavior are
defined in `specs/features/interactive-json.md`.

The author selects a direct or group conversation header. A direct header references one fiction character and shows that character's identity/status. A group header stores a group title and shows the member count and character names. This is chapter-level presentation configuration and does not create global User or Community records.

Publish validation requires exactly one player, at least one event, valid character references, two to four non-empty choice options, and completed media uploads. Typing and delay values are limited to 250–10,000 ms. A chapter supports at most 450 events and a Story at most 24 characters. This leaves safe headroom below Firestore's 500-write transaction ceiling.

## Reading

Interactive chapters use the existing Story reader routes, comments, ratings, following and bookmarks. Normal events reveal only after an explicit screen tap/click; messages never advance automatically. A typing event is the exception: it locks screen advancement, runs for its full authored duration, then automatically reveals the immediately following event. Reader input cannot skip typing. Delay remains skippable but does not automatically reveal the following event. Choices pause playback and become a player message when selected. Timers are cleared on restart, chapter change and component destruction.

## Media

Images and voice messages use signed Cloudinary uploads. The browser never receives the Cloudinary API secret. Managed paths are:

```text
vucdem/stories/{storyId}/chapters/{chapterId}/interactive/event-{slot}/image
vucdem/stories/{storyId}/chapters/{chapterId}/interactive/event-{slot}/audio
```

Audio uses Cloudinary `resource_type=video`. The server validates asset ownership and the Cloudinary URL/public ID pair before persistence.
