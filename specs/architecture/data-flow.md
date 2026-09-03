# Data Flow

This document defines the major application data flows in vucdem.

It describes system interaction at a high level.

Feature-specific specifications may define additional details.

---

# 1. Public Home Feed

```text
User opens /
    ↓
Home page requests published Posts
    ↓
posts service
    ↓
Firestore query
    ↓
Security Rules
    ↓
Post documents
    ↓
PostCard[]
```

Typical query characteristics:

```text
status == published
orderBy(...)
limit(...)
```

Pagination uses Firestore cursors.

---

# 2. Authentication State

```text
Application starts
    ↓
Firebase Auth initializes
    ↓
Auth state listener
    ↓
Authenticated?
   / \
 No   Yes
 │     │
 │     ↓
 │   Load users/{uid}
 │     │
 ▼     ▼
Guest  Authenticated User
```

---

# 3. Email Registration

```text
User submits registration form
    ↓
Frontend validation
    ↓
Firebase Auth createUser
    ↓
Receive uid
    ↓
Create users/{uid}
    ↓
Load application User
    ↓
Authenticated session
```

---

# 4. Google Authentication

```text
User clicks Google login
    ↓
Firebase Google provider
    ↓
Authentication succeeds
    ↓
Receive uid
    ↓
Check users/{uid}
    ↓
Exists?
  /      \
Yes       No
 │         │
 │         ↓
 │       Create User document
 │         │
 └────┬────┘
      ↓
Authenticated application
```

---

# 5. Create Post

```text
Authenticated User
    ↓
Open /write
    ↓
Choose Post
    ↓
Enter content
    ↓
Optional image upload
    ↓
Create Post document
    ↓
Published or Draft
```

If media exists:

```text
Client
  ↓
Request Cloudinary signature
  ↓
Upload image to Cloudinary
  ↓
Receive url + publicId
  ↓
Include asset metadata in Post
  ↓
Firestore
```

---

# 6. Post Image Upload

```text
Browser
    ↓
POST /api/cloudinary/sign
    ↓
SvelteKit verifies request
    ↓
Create signed upload parameters
    ↓
Browser
    ↓
Cloudinary
    ↓
Asset response
    ↓
Browser stores metadata temporarily
```

Returned asset metadata is later persisted with the Post.

---

# 7. Open Post Detail

```text
User opens /post/{id}
    ↓
posts service
    ↓
Firestore get Post
    ↓
Validate visibility through Rules
    ↓
Render Post
    ↓
Load Comments
```

View counting is a separate flow and must follow its feature specification.

---

# 8. Vote

Conceptual state machine:

```text
Current heart: none
Heart
→ +1

Current heart: +1
Heart
→ none
```

Data flow:

```text
Authenticated User
    ↓
Vote action
    ↓
votes service
    ↓
Read current vote state if necessary
    ↓
Transaction / trusted mutation
    ↓
Vote document update
    +
voteScore update
    ↓
UI refresh
```

The exact implementation must guarantee score consistency according to the voting specification.

---

# 9. Create Comment

```text
Authenticated User
    ↓
Submit Comment
    ↓
Validate content
    ↓
Create Comment document
    ↓
Increment target commentCount
    ↓
Potential Notification
    ↓
Render new Comment
```

The mutation must avoid trusting the client to arbitrarily set `commentCount`.

---

# 10. Reply to Comment

```text
Authenticated User
    ↓
Reply
    ↓
Create Comment
    ↓
parentId = targetCommentId
    ↓
Update relevant counters
    ↓
Potential reply Notification
```

Reply uses the Comment model rather than a separate Reply collection.

---

# 11. Bookmark

```text
Authenticated User
    ↓
Bookmark Post or Story
    ↓
users/{uid}/bookmarks/{contentId}
```

Remove:

```text
Authenticated User
    ↓
Remove Bookmark
    ↓
Delete bookmark document
```

Bookmarks are private by default.

---

# 12. Follow User

```text
User A
   ↓
Follow User B
   ↓
users/A/following/B
+
users/B/followers/A
   ↓
Update counters
   ↓
Potential Notification for User B
```

Consistency strategy is defined by the following feature/database specifications.

---

# 13. Create Story

```text
Authenticated User
    ↓
Create Story form
    ↓
Upload optional/required cover
    ↓
Create stories/{storyId}
    ↓
Story management page
```

The Story document stores metadata.

Chapter body content is not embedded in the Story document.

---

# 14. Create Chapter

```text
Story owner
    ↓
Open Story manager
    ↓
Create Chapter
    ↓
Validate ownership
    ↓
stories/{storyId}/chapters/{chapterId}
    ↓
Update chapterCount
```

---

# 15. Publish Chapter

```text
Story owner
    ↓
Publish Chapter
    ↓
Update Chapter publication state
    ↓
Update Story updatedAt
    ↓
Potentially notify Story followers
```

---

# 16. Story Reader

```text
Reader opens /story/{slug}/{chapter}
    ↓
Resolve Story by slug
    ↓
Resolve requested Chapter
    ↓
Check publication visibility
    ↓
Render Story Reader
    ↓
Provide previous/next navigation
```

---

# 17. Follow Story

```text
Authenticated User
    ↓
Follow Story
    ↓
Create Story-follow relationship
    ↓
Update followerCount
```

This is separate from:

- Bookmark Story
- Follow Author

---

# 18. Community Page

```text
User opens /c/{slug}
    ↓
Resolve Community
    ↓
Query published Posts
where communityId == target community
    ↓
Render Community feed
```

---

# 19. Create Community Post

```text
Authenticated User
    ↓
Create Post
    ↓
Select Community
    ↓
Validate posting permission
    ↓
Create Post with communityId
```

---

# 20. Notification Generation

Notifications are created as side effects of qualifying activity.

Example:

```text
User A comments on User B's Post
    ↓
Comment successfully created
    ↓
If A != B
    ↓
Create Notification for B
```

Notifications should not be created before the underlying action succeeds.

---

# 21. Read Notifications

```text
Authenticated User
    ↓
Open /notifications
    ↓
Query notifications
where userId == current uid
    ↓
Order by createdAt DESC
    ↓
Render list
```

Users must never be able to query another User's private notifications without permission.

---

# 22. Report Content

```text
Authenticated User
    ↓
Select Report
    ↓
Choose reason
    ↓
Submit
    ↓
Create reports/{reportId}
    ↓
Moderation queue
```

The client does not decide moderation outcome.

---

# 23. Moderator Review

```text
Moderator/Admin
    ↓
Open moderation surface
    ↓
Query Reports
    ↓
Review target
    ↓
Choose moderation action
    ↓
Trusted authorized mutation
```

Exact actions are defined in moderation specifications.

---

# 24. Search

MVP:

```text
User submits query
    ↓
Normalize query
    ↓
Perform supported Firestore queries
    ↓
Return limited matching entities
```

Do not:

```text
download every Post
→ search locally
```

A dedicated search service may replace this flow later.

---

# 25. Delete Post

Conceptual flow:

```text
Post owner / authorized moderator
    ↓
Delete or remove Post
    ↓
Verify permission
    ↓
Apply logical or physical deletion strategy
    ↓
Clean up Cloudinary media where appropriate
```

The exact deletion behavior is defined in feature/database specifications.

Do not assume cascading deletion.

---

# 26. Replace Image

```text
Authorized User
    ↓
Upload replacement image
    ↓
Cloudinary returns new asset
    ↓
Update Firestore document
    ↓
Delete previous Cloudinary asset
```

This ordering reduces the risk of leaving the application with a missing image if upload fails.

---

# 27. Pagination Flow

Initial:

```text
Query
  ↓
orderBy(...)
  ↓
limit(20)
  ↓
documents
  ↓
store lastDocument
```

Next:

```text
Query
  ↓
orderBy(...)
  ↓
startAfter(lastDocument)
  ↓
limit(20)
```

---

# 28. Error Flow

Every asynchronous operation should produce one of the appropriate application states:

```text
idle
loading
success
empty
error
unauthorized
not-found
```

The exact set depends on the feature.

---

# 29. Authorization Flow

For client Firestore operations:

```text
Browser request
    ↓
Firestore Security Rules
    ↓
Check auth
    ↓
Check ownership / role / state
    ↓
Allow or deny
```

For trusted SvelteKit operations:

```text
Browser request
    ↓
SvelteKit endpoint
    ↓
Verify authentication
    ↓
Verify authorization
    ↓
Perform privileged operation
```

Never trust authorization decisions supplied directly by the browser.

---

# 30. Source of Truth

Exact feature behavior:

```text
specs/features/
```

Exact schemas:

```text
specs/database/
```

Exact authorization:

```text
specs/security/
```

Exact API contracts:

```text
specs/api/
```
