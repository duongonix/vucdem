# Moderation Reviews

Review history is stored below its reviewed document:

```text
posts/{postId}/moderationReviews/{reviewId}
stories/{storyId}/moderationReviews/{reviewId}
stories/{storyId}/chapters/{chapterId}/moderationReviews/{reviewId}
```

Each immutable record contains `decision` (`approved` or `rejected`), nullable `reason`,
`reviewerId`, denormalized `reviewerName`, integer `submissionVersion`, and trusted `createdAt`.
Only trusted Admin server endpoints create these records. Direct browser Firestore access remains
denied by the global rules.
