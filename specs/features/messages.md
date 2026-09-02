# Messages

## Current scope

`/messages` is authenticated and provides persistent direct messaging between active Users.
Conversations, messages, unread counts, mute state, and read state are stored in Firestore through
trusted authenticated SvelteKit APIs. Presence remains unavailable and is not simulated.

## UI behavior

The route uses the shared application header and navigation sidebar. Inside the main content area,
desktop and tablet contain exactly two messaging columns: a 280–340px Conversation Sidebar and a
flexible Chat. The global right sidebar is hidden and there is no User Details panel. Both conversation and message lists scroll independently;
the page viewport itself is locked and does not scroll, while the header and composer remain visible. Search, All/Unread filters, new conversation selection,
profile navigation, mute/hide, text sending, Enter/Shift+Enter, empty/loading/error states,
and newest-message scrolling are supported.

Below 768px, only the Conversation List or Chat is visible. Selecting a conversation opens the Chat
full-screen and the header Back action returns to the list. Composer controls maintain 44px touch
targets and do not overflow.

## Architecture

```text
Messages components
→ messages service and bounded polling watchers
→ authenticated SvelteKit API
→ Firebase Admin / Firestore
```

The UI does not import mock message data. User search uses `/api/search`. Text messages are trimmed, empty sends
are rejected, and duplicate sends are disabled while pending. Attachment upload, emoji picker,
groups, calls, reactions, forwarding, and voice messages are out of scope.

The sidebar polls the bounded conversation summary and displays `Tin Nhắn (n)` when unread messages
exist. The active chat polls more frequently, so messages from another account appear without a
page reload. A profile action opens `/messages?with={uid}` and creates or reuses the deterministic
direct conversation.

After the initial unread baseline, an increase in an unmuted conversation shows a global toast with
the sender display name and latest message preview. Opening an active conversation marks newly
arriving messages read without requiring a reload.
