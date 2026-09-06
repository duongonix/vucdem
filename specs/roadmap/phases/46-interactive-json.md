# Phase 46 — Interactive JSON authoring

## Status

- [ ] Not started
- [ ] In progress
- [x] Completed

## Goal

Allow authors to import, validate, visually edit and export Interactive Story content using a safe,
versioned JSON V1 format.

## Tasks

- [x] Add the portable JSON V1 schema and semantic validation.
- [x] Convert JSON to/from the existing Interactive domain model.
- [x] Add visual editor and JSON sub-tabs for short Stories and serial Chapters.
- [x] Support paste, local file, template, formatting, validation, replacement and export.
- [x] Preserve the existing save, moderation, Reader and Admin preview workflows.
- [x] Add security and round-trip tests and formal specifications.

## Files Changed

- Added `src/lib/interactive-json/` schema, types and conversion modules.
- Added `InteractiveJsonEditor.svelte` and `InteractiveStoryAuthoring.svelte`.
- Integrated authoring tabs into short Story creation and Chapter editing.
- Added validation/round-trip tests and Interactive JSON specifications.

## Dependencies Added

- None; the implementation reuses Zod and Lucide.

## Database Changes

- None. JSON normalizes into the existing Story Characters and Chapter `interactiveEvents` model.

## Security Changes

- JSON is treated as untrusted data and never evaluated.
- Unsafe protocols, cross-Story media paths and media without managed ownership metadata are
  rejected before import; trusted endpoints retain final ownership verification.

## Specs Added or Updated

- Added `specs/features/interactive-json.md`.
- Updated Interactive Stories and Story Editor specs.

## Important Decisions

- JSON is an authoring interchange format, not `contentFormat = json`.
- V1 replaces rather than merges content and remains linear/non-branching.
- Existing limits of 24 Characters and 450 Events remain authoritative.

## Known Limitations

- Whole-Story serial import, merge mode, branching, JSON5, remote URL import and external media
  re-hosting are intentionally outside V1.

## Verification

- [x] Formatting
- [x] Type checking
- [x] Relevant tests
- [x] Production build
- [x] Manual workflow/code-path verification

## Completed At

2026-09-06
