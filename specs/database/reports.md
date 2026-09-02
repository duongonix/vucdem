# Reports

## Purpose and path

Private moderation reports live at:

```text
reports/{reportId}
```

## Canonical fields

```typescript
type ReportTargetType = 'post' | 'story' | 'comment';
type ReportReason = 'spam' | 'harassment' | 'nsfw' | 'stolen_content' | 'other';
type ReportStatus = 'open' | 'reviewing' | 'resolved' | 'dismissed';

type Report = {
	id: string;
	reporterId: string;
	targetType: ReportTargetType;
	targetId: string;
	reason: ReportReason;
	explanation: string;
	status: ReportStatus;
	createdAt: Timestamp;
	reviewedBy: string | null;
	reviewedAt: Timestamp | null;
};
```

Authenticated Users may create a report as themselves against an existing supported target. Initial moderation fields are `status = open`, `reviewedBy = null`, and `reviewedAt = null`. Only moderators/admins may read report queues or update moderation fields. Reports are never publicly readable.

Duplicate prevention may use a deterministic identity or transaction when report persistence is implemented; it must not depend on an unsafe query-then-create sequence.
