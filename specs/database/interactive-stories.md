# Interactive Story persistence

Characters belong to a Story:

```text
stories/{storyId}/characters/{characterId}
```

Fields: `id`, `name`, `avatar`, `role` (`player | character`), `updatedAt`.

Timeline events belong to a Chapter (including the `short-story` chapter used by short stories):

```text
stories/{storyId}/chapters/{chapterId}/interactiveEvents/{eventId}
```

Every event stores `id`, `type`, integer `order`, and the type-specific structured fields documented in `specs/features/interactive-stories.md`. Events are read with `orderBy('order', 'asc')`. Sender fields reference a Story character ID; names and avatars are not duplicated into each event.

Interactive Chapter documents additionally persist:

- `contentFormat: interactive`
- `conversationTitle: string`
- `conversationType: direct | group`
- `conversationCharacterId: string | null` — contact displayed by a direct-chat header
- `interactiveEventCount: number`
- `content: ""`
- `audio: null`

The event list is deliberately not embedded in the Story or Chapter document, preventing growth toward Firestore's document size limit. All reads and writes use trusted SvelteKit server endpoints under the existing Firebase Admin authorization model.
