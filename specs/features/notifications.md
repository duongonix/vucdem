# Notifications

## Contract

Notifications are private activity records created by trusted server mutations for comments, replies, follows, upvotes, and published story chapters. Self-notifications are suppressed and deterministic IDs are used for repeatable relation events where appropriate.

`/notifications` requires authentication, orders newest first, supports marking one or all records read, and exposes loading, empty, and error states. The header displays the authenticated recipient's unread count. Only `isRead` and `readAt` may be changed through recipient-authorized endpoints.

When notifications exist, the page header always shows the **Đã xem tất cả** control. It marks all
unread records as read, confirms success in the page, and becomes the disabled **Đã xem hết** state
when no unread records remain.

The server uses the documented composite indexes for normal operation. During index provisioning, it may fall back to a bounded recipient-only query and perform unread filtering/newest ordering in server memory; this fallback is capped and never downloads another user's records.

Because private Notification reads cross the authenticated SvelteKit server boundary, the Browser
does not attach a direct Firestore listener. Authenticated notification surfaces refresh every ten
seconds, immediately when the tab regains focus/visibility, and after local read mutations. The
header unread badge and `/notifications` list therefore update without a full page reload while
preserving the server-only data boundary.
