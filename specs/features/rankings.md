# Story rankings

## Route and data

`/ranks` is a public Story discovery page backed by `GET /api/ranks`. It shows two selectable
rankings: `Truyện ngắn` (`format = short`) and `Truyện dài` (`format = serial`, including legacy
Stories without `format`). Each list contains at most ten publicly readable Stories ordered by the
trusted `viewCount` descending, with document identity as a deterministic tie-breaker.

The normal query uses the documented `status + viewCount + __name__` index. While that index is
being provisioned, the server may load a bounded set of public Stories and rank it in memory.

## UI

Ranks one through three form the prominent gothic podium. Rank one receives the strongest crimson
accent and largest presentation; ranks two and three remain visually distinct. Ranks four through
ten use a compact readable list. Every item links to its canonical Story route and shows a 2:3
cover, author, and view count. Missing covers use the shared HTML/CSS fallback.

Loading, empty, and user-safe error states are required. The two formats use accessible tabs and
the layout must not overflow on mobile.
