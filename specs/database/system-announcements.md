# System announcements

System announcement audit records live at `systemAnnouncements/{announcementId}`. They are created
only by an active Admin through `POST /api/admin/announcements`; direct client access remains
denied by the server-mediated Firestore rules.

```ts
type SystemAnnouncement = {
	id: string;
	title: string;
	message: string;
	destination: string;
	createdBy: string;
	createdAt: Timestamp;
	recipientCount: number;
};
```

`title` is 2–100 characters, `message` is 2–600 characters, and `destination` is either
`/notifications` or an internal path beginning with one `/` (never `//`). One private
`notifications/{notificationId}` document of type `system_announcement` is fanned out to every
active User. This root record is an audit record only; recipients read their private Notification,
not this collection.
