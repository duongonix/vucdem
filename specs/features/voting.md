# Voting

## Goal

Authenticated Users can express one active Post vote: `+1`, `-1`, or no vote.

## Data and API

Votes are stored at `posts/{postId}/votes/{uid}`. Absence means no vote; zero is never persisted. `GET /api/posts/{id}/vote` returns `{ value, score }`. Authenticated `POST` accepts `{ value: -1 | 0 | 1 }`.

The trusted SvelteKit endpoint runs a Firestore transaction that reads the current vote and Post, persists the vote transition, and applies exactly `next - previous` to `voteScore`. Only published Posts are voteable.

## UI behavior

`VoteControl` supports vertical Feed and horizontal detail/mobile presentation. Mutations are optimistic, duplicate clicks are disabled while pending, and failures restore both score and vote state. Guest interaction redirects to login with the current route as `redirect`.

## Acceptance criteria

- All six transitions between none/up/down are idempotent.
- Refresh loads the signed-in User's current vote.
- The aggregate score cannot be supplied independently by the browser.
- Failed writes visibly roll back.

## Out of scope

Story and Comment voting wait for their respective requested phases.
