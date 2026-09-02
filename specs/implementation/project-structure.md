# Project Structure

This document defines the canonical source boundaries established in Phase 0.

## Source layout

```text
src/
├── lib/
│   ├── components/   # reusable layout, feature, and UI components
│   ├── firebase/     # one Firebase client initialization and converters
│   ├── cloudinary/   # browser-safe upload and delivery helpers
│   ├── services/     # feature-oriented application/data operations
│   ├── stores/       # genuinely cross-route reactive state
│   ├── types/        # canonical shared domain models
│   └── utils/        # small reusable, domain-neutral helpers
└── routes/           # SvelteKit pages, layouts, and server endpoints
```

Feature code may add meaningful subdirectories without changing this contract. Server-only modules must use SvelteKit server boundaries and must never be re-exported through browser-safe barrels.

## Component boundary

Routes compose screens. Components render and coordinate user interaction. Services own reusable business and persistence workflows. Firebase and Cloudinary modules isolate provider-specific code.

## UI primitives

shadcn-svelte-compatible primitives live under `src/lib/components/ui/`. They use the aliases in `components.json` and must be restyled to match the VỰC ĐÊM design system rather than retaining generic defaults.

## Imports

Shared application modules use SvelteKit's `$lib` alias. Relative imports are appropriate within a small cohesive module. Avoid circular barrel exports and do not expose server-only code from `src/lib/index.ts`.
