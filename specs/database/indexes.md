# Firestore Indexes

Phase 9 introduces the initial Post indexes represented in `firestore.indexes.json`:

- `status ASC, createdAt DESC, __name__ DESC` — newest published Posts.
- `status ASC, voteScore DESC, __name__ DESC` — popular published Posts.
- `status ASC, viewCount DESC, __name__ DESC` — most-viewed published Posts.
- `category ASC, status ASC, createdAt DESC, __name__ DESC` — newest category feed.
- `communityId ASC, status ASC, createdAt DESC, __name__ DESC` — newest Community feed.
- `authorId ASC, status ASC, createdAt DESC, __name__ DESC` — newest public Author Posts.

Filtered Post feeds intentionally support `newest` sorting only in MVP to avoid undocumented combinatorial indexes. Phase 33 audits all production queries and adds later feature indexes.

Phase 14 adds:

- `targetType ASC, targetId ASC, parentId ASC, status ASC, createdAt DESC, __name__ DESC` — paginated root Comments for a target.
- `parentId ASC, status ASC, createdAt ASC` — ordered replies for batched parent IDs.

Phases 26–30 add:

- `reports: status ASC, createdAt DESC` — private moderation queues.
- `posts: tags ARRAY_CONTAINS, status ASC` — bounded exact-tag discovery.
- `stories: tags ARRAY_CONTAINS, status ASC` — bounded exact-tag discovery.
- `posts: tags ARRAY_CONTAINS, status ASC, createdAt DESC, __name__ DESC` — paginated Post tag pages.
- `stories: tags ARRAY_CONTAINS, status ASC, createdAt DESC, __name__ DESC` — paginated Story tag pages.
- `posts: authorId ASC, createdAt DESC, __name__ DESC` — owner profile content including drafts.
- `stories: authorId ASC, createdAt DESC, __name__ DESC` — owner profile content including drafts.
- `stories: authorId ASC, status ASC, createdAt DESC, __name__ DESC` — public Author Stories.
- `stories: status ASC, createdAt DESC, __name__ DESC` — newest published Story feed used by Home.
- `stories: status ASC, viewCount DESC, __name__ DESC` — public Story ranking candidates for `/ranks`.

`__name__ DESC` is explicit because cursor-paginated queries order by the document identifier as a deterministic tie-breaker. Omitting it creates a different composite index and causes Firestore `FAILED_PRECONDITION` errors.

Sidebar discovery adds `users: status ASC, followersCount DESC` for the five active Users with the
largest trusted follower counters. Category post totals use Firestore count aggregation and the
existing single-field/composite Post indexes.
