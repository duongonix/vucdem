# Direct messages

## Conversations

Path: `conversations/{conversationId}`. For direct messages the ID is the two participant UIDs,
sorted and joined with `--`, so one pair can have only one conversation.

| Field            | Type               | Purpose                                     |
| ---------------- | ------------------ | ------------------------------------------- |
| `participantIds` | `string[2]`        | The two authenticated User UIDs             |
| `lastMessage`    | `string`           | Denormalized conversation preview           |
| `lastMessageAt`  | `Timestamp`        | Feed ordering                               |
| `lastSenderId`   | `string \| null`   | Sender of the latest message                |
| `unreadCounts`   | `map<uid, number>` | Per-participant unread totals               |
| `mutedBy`        | `string[]`         | Participants who muted the conversation     |
| `hiddenBy`       | `string[]`         | Participants who hid it from their own list |
| `createdAt`      | `Timestamp`        | Creation time                               |
| `updatedAt`      | `Timestamp`        | Last mutation time                          |

Only active authenticated users may create a conversation. Users cannot message themselves.
Only participants may read or mutate it. Hiding a conversation affects only the actor; sending a
new message makes it visible to both participants again.

## Messages

Path: `conversations/{conversationId}/messages/{messageId}`.

| Field       | Type        | Purpose                                     |
| ----------- | ----------- | ------------------------------------------- |
| `senderId`  | `string`    | Authenticated sender UID                    |
| `content`   | `string`    | Trimmed plain text, 1–4000 characters       |
| `createdAt` | `Timestamp` | Server creation time                        |
| `readBy`    | `string[]`  | Participant UIDs that have read the message |

Messages are returned newest 100 at a time by the current API. The trusted send transaction creates
the message and updates the preview/unread counter atomically. Opening a conversation resets the
viewer's unread counter and adds the viewer to `readBy` for the recent messages.

## Access architecture

Browser Firestore access remains denied. All reads and mutations use authenticated SvelteKit APIs
and Firebase Admin after verifying the caller is a participant. No Firebase Storage is used.

## Indexes

Current queries use single-field indexes: `participantIds array-contains` and message `createdAt`.
No composite index is required.
