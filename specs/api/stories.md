# Stories API

All mutations verify Firebase ID tokens and use Firebase Admin transactions.

## `POST /api/stories`

Accepts a preallocated ID, immutable `format`, and Draft metadata, then reserves a globally unique
slug and creates trusted author snapshots, counters, timestamps, and `status = draft`. For
`format = short`, `shortContent` is required and the transaction also creates the sole published
Chapter `chapters/short-story`; for `serial`, Chapter creation remains separate.

## `GET /api/stories`

Returns a cursor-paginated newest-first list of public Stories (`ongoing`, `completed`, or `hiatus`) for the Home feed.

## `GET /api/stories/{id}` and `/api/stories/slug/{slug}`

Public statuses are `ongoing`, `completed`, and `hiatus`. Other states are returned only to the owner; otherwise the response is not found.

## `PATCH /api/stories/{id}`

Owner-only metadata/status mutation. `{ "action": "remove" }` performs logical removal. Slugs and trusted fields are not editable.

## `GET|PUT /api/stories/{id}/rating`

GET returns the public aggregate plus the authenticated User's current value when present. PUT
requires an active authenticated User, accepts a strict integer `value` from 1 to 5, and atomically
upserts `ratings/{uid}` with the Story's trusted aggregate fields.
