# Phase 45 extension — Audio Stories

Status: Completed

## Scope

- Text/Audio publishing for short Stories and each serialized Chapter.
- Secure signed direct Cloudinary audio uploads and trusted replacement cleanup.
- Custom accessible audio player in Story reader and editor preview.
- SoundCloud-inspired interactive waveform timeline with real seek/progress state.
- Audio/mixed indicators and duration metadata on Story surfaces.

## Files changed

- Story, Chapter, media types, validation, serializers, client services, and trusted APIs.
- Story create/chapter editors, manager, detail, feed card, and reader.
- New `AudioUploader`, `AudioPlayer`, and `StoryContentFormatSelector` components.
- Story, Chapter, Cloudinary, validation, and editor specifications.

## Dependencies added

- None. The implementation uses native browser media/XHR APIs and the existing Cloudinary SDK.

## Database changes

- Added `Story.contentFormat` (`text | audio | mixed`).
- Added `Chapter.contentFormat` (`text | audio`) and `Chapter.audio` metadata.

## Security changes

- Added authenticated owner-bound `story-audio` signing paths.
- Audio uploads use server-selected public IDs and Cloudinary video resource type.

## Important decisions

- Short Stories reuse the stable `short-story` Chapter.
- Serialized Stories may mix text and audio Chapters.
- Unpersisted cancelled uploads may require operational orphan cleanup; persisted replacement never
  deletes the old asset before the new Chapter reference is saved.

## Verification

- Prettier completed for every changed implementation/specification file.
- `pnpm check`: 0 errors, 0 warnings.
- `pnpm lint`: passed.
- `pnpm test:unit -- --run`: 22 passed, 2 skipped.
- `pnpm build`: passed.
