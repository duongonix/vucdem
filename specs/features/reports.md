# Reports

Authenticated Users can privately report a Post, Story, or Comment for `spam`,
`harassment`, `nsfw`, `stolen_content`, or `other`, with an optional explanation of at most
1,000 characters. The target must exist and self-reporting is rejected.

`POST /api/reports` verifies the Firebase ID token and writes a deterministic
`{reporterId}_{targetType}_{targetId}` document, preventing duplicate reports without a
query race. Only moderators/admins can list or review reports through trusted server APIs.
Report data is never returned by public pages.

The report dialog includes pending, success, validation, and error states and is available
on public Posts, Stories, and Comments not owned by the viewer.
