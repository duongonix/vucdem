# Phase 45 extension — Browser Text-to-Speech

Status: Completed

## Scope

- Native Web Speech API playback for text Chapters only.
- Vietnamese voice preference, chunk queue, playback controls, local preferences, graceful
  fallback, cleanup, responsive UI, and accessibility.

## Files changed

- `src/lib/components/story/StoryReader.svelte`
- `src/lib/components/speech/TextToSpeechPlayer.svelte`
- `src/lib/speech/reader.ts`, `text.ts`, `types.ts`, and `text.spec.ts`
- Story Reader, shared component, and phase specifications.

## Components added

- `TextToSpeechPlayer.svelte`.

## Dependencies added

- None.

## Database and security changes

- None. Speech synthesis is browser-only and does not persist or transmit Chapter content.

## Specs updated

- `specs/features/story-reader.md`
- `specs/ui/components.md`

## Browser compatibility

- Capability-detected Web Speech API; available voices and quality depend on the operating system
  and browser.

## Real data used

- The current Chapter prose from the existing Story Reader.

## Mock data used

- None.

## Verification

- Formatter passed.
- `pnpm check`: 0 errors, 0 warnings.
- `pnpm lint`: passed.
- `pnpm test:unit -- --run`: 25 passed, 2 skipped.
- `pnpm build`: passed with SSR-safe browser capability checks.
- Automated Chrome visual interaction was unavailable because no connected Chrome browser
  extension was present in the environment; responsive behavior is implemented through stacking,
  bounded widths, and 44px touch targets and remains suitable for manual device QA.

## Known limitations

- Web Speech API provides no reliable duration; progress is chunk-based.
- Voice/rate changes during playback apply from the next chunk unless the User restarts.
