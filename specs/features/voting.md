# Heart reactions

## Goal

Authenticated Users can express one heart reaction on a Post or Comment. The reaction is either
active (`+1`) or absent; dislike is not supported.

## Data and API

Reactions retain the existing vote storage paths and `voteScore` aggregate field for compatibility.
Absence means no heart and zero is never persisted. The Post and Comment vote endpoints return
`{ value, score }`; authenticated mutation requests accept `{ value: 0 | 1 }` only.

The trusted SvelteKit endpoint runs a Firestore transaction that reads the current reaction and
target, persists the transition, and applies exactly `next - previous` to `voteScore`. Only public,
published targets can receive hearts. Historic `-1` documents are exposed as an inactive legacy
state and converted when that User next reacts.

## UI behavior

Post and Comment actions use one Heart control with its count beside it. A filled crimson heart and
`aria-pressed` communicate the active state. Post mutations are optimistic, duplicate clicks are
disabled while pending, and failures restore the count and reaction state. Guest interaction
redirects to login with the current route as `redirect`.

## Acceptance criteria

- Heart and unheart transitions are idempotent.
- Refresh loads the signed-in User's current heart state.
- The aggregate count cannot be supplied independently by the browser.
- Dislike is absent from the UI and rejected by mutation endpoints.
- Failed Post writes visibly roll back.
