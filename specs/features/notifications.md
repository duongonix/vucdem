# Notifications

## Contract

Notifications are private activity records created by trusted server mutations for comments, replies, follows, upvotes, ratings, content moderation, Story state changes, Admin announcements, and published Story chapters. Self-notifications are suppressed and deterministic IDs are used for repeatable relation events where appropriate.

User followers may explicitly opt into an author's activity through the bell beside the Follow button.
The first approved publication of a Post or Story emits `author_post` or `author_story`; each newly
approved Chapter emits `author_chapter`. The producer queries only the mirrored User-follow records
whose `notificationsEnabled` is true. A Story follower continues to receive `story_update` instead of
a second `author_chapter` if they have both follow relationships.

Following a serialized Story creates a deterministic `follow` Notification for its author. When a
new Chapter of that Story first becomes published, every current Story follower receives one
deterministic `story_update` Notification. Short Stories cannot be followed and do not produce
these follow/update events.

## Additional activity

- A Story author receives a `story_rating` Notification when another User creates or changes their
  rating. Repeating the same rating does not create another notification.
- When a followed serialized Story is approved with a changed public state (`ongoing`, `hiatus`, or
  `completed`), its followers receive `story_status`.
- The first report against a content item sends its author one neutral `content_reported` system
  notice; reporter identity and report details are never exposed. An Admin hiding or removing that
  content sends `content_hidden` with the trusted destination.
- Admins can publish an auditable `system_announcement` to all active Users. The server fans out one
  private Notification per recipient; the browser never writes these records.
- When a newly approved Chapter follows a Reader's unfinished saved progress, the Reader receives
  one `reading_reminder` for that Chapter. It links directly to the new Chapter. The deterministic
  key prevents duplicate reminders on retries.

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
