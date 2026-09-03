# Community Discussion Chat

## Goal and route

`/discussion` is VỰC ĐÊM's public site-wide chat room. It replaces the former Post-only feed alias.

## Behavior

- Guests can read the room and are prompted to sign in before sending.
- Active authenticated Users can send plain-text messages up to 1,000 characters.
- The room refreshes incrementally while visible and merges messages by document ID.
- New messages preserve the reader's scroll position unless they are already near the bottom.
- Enter sends; Shift+Enter inserts a line break.
- The UI shows real recent participants derived from loaded messages, not fake online presence.

## UI

The room uses a near-black, thin-border chat surface with crimson active accents, compact avatars,
verified badges, timestamps, a scrollable transcript, and a composer fixed to the bottom of the
room surface. Mobile uses the full main column without horizontal overflow.

## Security

All persistence is server-mediated. The server derives the author snapshot from the authenticated
active User document. Clients cannot provide author IDs, roles, verification state, status, or
timestamps.
