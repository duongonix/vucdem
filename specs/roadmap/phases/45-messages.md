# Phase 45 extension — Messages UI

Status: Completed

## Scope

- Authenticated Messages workspace inside the shared header and left navigation shell.
- Conversation search/filter, new message dialog, timeline, text sending, menus, states, and mobile
  list-to-chat navigation.

## Real data used

- Firebase authentication/current User, User search, persistent Firestore conversations/messages,
  unread/read state, profile entry points, and sidebar unread badge.

## Mock data used

- None. Presence is intentionally not displayed as real because the product has no presence backend.

## Database and security changes

- Added private `conversations/{conversationId}` and nested `messages/{messageId}` persistence.
- All access remains behind Firebase-token-authenticated SvelteKit APIs and Firebase Admin; direct
  browser Firestore access stays denied.
- Participant checks, active-account checks, server-derived sender IDs, bounded reads, atomic send
  metadata/unread updates, and per-user hide/mute state are enforced server-side.

## Dependencies added

- None.

## Files changed

- Message domain types, authenticated API service, polling watchers, server helpers and API routes.
- Messages workspace, conversation sidebar, new-message dialog, chat panel, timeline, bubbles,
  composer, and avatar components.
- `/messages`, shared application shell behavior, feature/database/UI specifications, and service
  tests.

## Components added

- `MessagesPage`, `ConversationSidebar`, `NewMessageDialog`, `ChatPanel`, `MessageList`,
  `MessageComposer`, and `MessageAvatar`.

## Responsive verification

- The global header and left navigation remain visible on desktop; the global right sidebar is hidden.
- The inner workspace uses two columns; mobile switches between list and full-screen Chat at 768px.
- Independent scroll regions, fixed header/composer, bounded bubbles, and 44px mobile controls.

## Known limitations

- Updates use bounded 2–3 second polling rather than opening direct browser Firestore listeners.
- Presence is unavailable. Conversation deletion is a safe per-user hide operation rather than
  deleting the other participant's message history.
- Attachments are visibly disabled; no fake upload path was introduced.

## Verification

- Formatter passed.
- `pnpm check`: 0 errors, 0 warnings.
- `pnpm lint`: passed.
- Unit tests and production build passed; final counts recorded after the last verification run.
