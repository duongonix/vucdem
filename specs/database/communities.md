# Communities

## Purpose and path

Communities are public, subreddit-like content spaces stored at:

```text
communities/{communityId}
```

## Canonical fields

```typescript
type CommunityStatus = 'active' | 'hidden' | 'removed';

type Community = {
	id: string;
	ownerId: string;
	slug: string;
	name: string;
	nameNormalized: string;
	description: string;
	icon: CloudinaryAsset | null;
	banner: CloudinaryAsset | null;
	memberCount: number;
	postCount: number;
	status: CommunityStatus;
	createdAt: Timestamp;
	updatedAt: Timestamp;
};
```

`nameNormalized` is the locale-aware lower-case search key written by the trusted
Community creation endpoint. It is required for new Communities and supports bounded
prefix discovery without downloading Community documents to the browser.

`slug` is unique and URL-safe. `ownerId` is immutable after creation. Media must contain Cloudinary `url` and `publicId`; Firebase Storage is not used. Counts are non-negative trusted counters. Membership and moderation relationships must not be stored as unbounded arrays and will use documented subcollections when implemented.

Slug reservations use `communitySlugs/{slug}` with immutable `communityId`. Membership uses `communities/{communityId}/members/{uid}` with `role: owner | member` and trusted `createdAt`. Owners cannot leave through the normal membership action.

Active Communities are publicly readable. Creation, moderation, membership, counter changes, and Cloudinary deletion require the authorization defined by the Community implementation phase.
