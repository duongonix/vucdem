# vucdem MVP Roadmap

This document defines the complete implementation roadmap required to bring vucdem from an empty project to a complete MVP.

This roadmap is the primary execution plan for Codex.

Codex must implement phases in order unless a dependency clearly requires a small exception.

---

# 1. Roadmap Rules

Codex must follow these rules throughout implementation.

## 1.1 Phase order

Phases should normally be completed sequentially:

```text
Phase 0
↓
Phase 1
↓
Phase 2
↓
...
↓
Final Phase
```

Do not skip unfinished foundational work to implement later features.

---

## 1.2 Phase status files

Every phase has a status file under:

```text
specs/roadmap/phases/
```

Example:

```text
roadmap/
├── mvp.md
└── phases/
    ├── 0.md
    ├── 1.md
    ├── 2.md
    ├── 3.md
    └── ...
```

After completing a phase, Codex MUST update its corresponding phase file.

Example:

```text
Phase 0
→ specs/roadmap/phases/0.md
```

```text
Phase 5
→ specs/roadmap/phases/5.md
```

---

## 1.3 Required phase file contents

Each phase file must include:

```markdown
# Phase X

Status:

- [ ] Not started
- [ ] In progress
- [ ] Completed

## Goal

...

## Tasks

- [ ] ...
- [ ] ...
- [ ] ...

## Files Changed

- ...

## Dependencies Added

- ...

## Database Changes

- ...

## Security Changes

- ...

## Notes

...

## Verification

- [ ] npm run check
- [ ] tests pass
- [ ] manual verification complete

## Completed At

...
```

When the phase is completed:

```text
Status = Completed
```

and all finished tasks must be checked.

Codex must never mark a phase complete if required functionality is still broken or incomplete.

---

# 2. Phase 0 — Project Foundation

Goal:

Create the base SvelteKit project and establish project-wide conventions.

Tasks:

- Initialize SvelteKit with TypeScript.
- Configure Tailwind CSS.
- Configure shadcn-svelte.
- Install `@lucide/svelte` (the maintained official package; `lucide-svelte` is deprecated).
- Configure formatting.
- Configure linting.
- Configure TypeScript strict mode.
- Create canonical `src/lib/` structure.
- Create canonical `src/routes/` structure.
- Add base aliases if required.
- Create `.env.example`.
- Create Firebase configuration placeholders.
- Create Cloudinary configuration placeholders.
- Ensure development server starts correctly.
- Ensure `npm run check` succeeds.

Required structure:

```text
src/lib/
├── components/
├── firebase/
├── cloudinary/
├── services/
├── stores/
├── types/
└── utils/
```

Completion criteria:

- Project runs.
- No TypeScript errors.
- Tailwind works.
- shadcn-svelte works.
- Lucide works.

Update:

```text
specs/roadmap/phases/0.md
```

---

# 3. Phase 1 — Global Design System

Goal:

Implement the canonical vucdem visual foundation.

Read:

```text
specs/ui/design-system.md
specs/ui/colors.md
specs/ui/typography.md
specs/ui/icons.md
specs/ui/layout.md
specs/ui/responsive.md
specs/ui/components.md
```

Tasks:

- Add global color variables.
- Add background and surface tokens.
- Configure typography.
- Add serif editorial font.
- Add UI sans-serif font.
- Configure global borders.
- Configure focus states.
- Configure buttons.
- Configure inputs.
- Configure tabs.
- Configure cards.
- Configure dropdowns.
- Configure dialogs.
- Configure scrollbars where appropriate.
- Restyle shadcn-svelte components.
- Ensure minimal border radius.
- Remove generic shadcn visual appearance.
- Ensure mobile responsive foundation.

Completion criteria:

- Global UI matches vucdem identity.
- No generic SaaS appearance.
- Dark/crimson visual system is consistent.

Update:

```text
specs/roadmap/phases/1.md
```

---

# 4. Phase 2 — Application Shell

Goal:

Build the reusable global application layout.

Tasks:

- Build `AppHeader`.
- Build desktop navigation.
- Build responsive navigation.
- Build Left Sidebar.
- Build Right Sidebar.
- Build mobile navigation.
- Build search entry UI.
- Build authentication/profile placeholder state.
- Build create content button.
- Implement responsive visibility rules.
- Implement global max width.
- Implement page layout containers.

Desktop target:

```text
Header
├── Left Sidebar
├── Main Content
└── Right Sidebar
```

Responsive:

```text
>= 1280px
→ three columns

900px–1279px
→ left + main

< 900px
→ main only
```

Completion criteria:

- Layout works at desktop/tablet/mobile widths.
- No horizontal overflow.
- Shared shell is reusable by pages.

Update:

```text
specs/roadmap/phases/2.md
```

---

# 5. Phase 3 — Firebase Foundation

Goal:

Connect vucdem to Firebase.

Tasks:

- Install Firebase SDK.
- Create Firebase client initialization.
- Configure Firestore.
- Configure Firebase Authentication.
- Add environment variable handling.
- Create Firestore utility layer.
- Define shared Timestamp handling.
- Create Firestore converters where useful.
- Add Firebase emulator support if appropriate.

Do not use:

```text
Firebase Storage
Realtime Database
```

Completion criteria:

- Firebase initializes correctly.
- Firestore can be accessed.
- Authentication SDK works.
- Secrets/config are correctly separated.

Update:

```text
specs/roadmap/phases/3.md
```

---

# 6. Phase 4 — Shared Domain Types

Goal:

Implement canonical TypeScript models from specifications.

Create types for:

```text
User
CloudinaryAsset
Post
Story
Chapter
Comment
Community
Notification
Report
Vote
Bookmark
Follow
```

Tasks:

- Add enums/unions for canonical values.
- Add Post categories.
- Add content statuses.
- Add User roles.
- Add User account states.
- Add Story states.
- Avoid `any`.
- Keep Firestore models aligned with specs.
- Reuse shared types instead of duplicating models.

Completion criteria:

- Domain models compile.
- No conflicting duplicate models.

Update:

```text
specs/roadmap/phases/4.md
```

---

# 7. Phase 5 — Authentication

Goal:

Implement complete MVP authentication.

Read:

```text
specs/features/authentication.md
specs/architecture/auth-architecture.md
specs/database/users.md
```

Tasks:

- Implement centralized auth state.
- Implement Firebase auth initialization.
- Email/password registration.
- Email/password login.
- Google login.
- Logout.
- Password reset.
- Registration page.
- Login page.
- Loading state.
- Error handling.
- Auth-protected route behavior.
- Safe redirect behavior.
- Create Firestore User profile.
- First Google login onboarding.
- Username selection.
- Username normalization.
- Username reservation.
- Prevent duplicate usernames.
- Prevent client-created privileged roles.

Completion criteria:

- User can register.
- User can log in.
- User can log in with Google.
- User profile is created.
- Auth survives navigation.
- Logout works.
- Protected pages reject Guests.

Update:

```text
specs/roadmap/phases/5.md
```

---

# 8. Phase 6 — Firestore Security Foundation

Goal:

Create initial secure Firestore rules before implementing large write surfaces.

Tasks:

- Add `firestore.rules`.
- Protect User ownership.
- Protect role fields.
- Protect account state fields.
- Protect counters.
- Protect ownership fields.
- Allow public read only where appropriate.
- Ensure rules are not treated as filters.
- Add emulator tests for critical rules if practical.

Completion criteria:

- Normal User cannot become Admin.
- User cannot modify another User.
- Trusted fields cannot be arbitrarily modified.

Update:

```text
specs/roadmap/phases/6.md
```

---

# 9. Phase 7 — Cloudinary Foundation

Goal:

Implement secure media uploads.

Read:

```text
specs/architecture/cloudinary-architecture.md
```

Tasks:

- Add Cloudinary client helpers.
- Add server-side Cloudinary helper.
- Implement:

```text
POST /api/cloudinary/sign
```

- Verify authenticated User.
- Validate upload type.
- Determine trusted folder server-side.
- Generate signed upload parameters.
- Implement direct Browser → Cloudinary upload.
- Return/store:

```text
url
publicId
```

- Implement:

```text
POST /api/cloudinary/delete
```

or equivalent trusted deletion route.

- Verify asset ownership before deletion.
- Add image file validation.
- Add upload progress support.
- Add error handling.

Completion criteria:

- Browser can securely upload image.
- Cloudinary secret never reaches Browser.
- Uploaded asset returns `url + publicId`.
- Unauthorized asset deletion fails.

Update:

```text
specs/roadmap/phases/7.md
```

---

# 10. Phase 8 — User Profiles

Goal:

Build the User profile system.

Tasks:

- Implement User service.
- Implement profile lookup by username.
- Implement username reservation lookup.
- Build route:

```text
/u/[username]
```

- Display:

  - Avatar
  - Display name
  - Username
  - Bio
  - Followers
  - Following
  - Post count
  - Story count

- Build profile editing.
- Implement avatar upload.
- Implement avatar replacement/deletion.
- Validate User inputs.
- Protect trusted fields.

Completion criteria:

- Profiles load publicly.
- User can edit own profile.
- User cannot edit another profile.
- Avatar upload works.

Update:

```text
specs/roadmap/phases/8.md
```

---

# 11. Phase 9 — Post Data Layer

Goal:

Implement Post persistence before building full Feed UI.

Read:

```text
specs/database/posts.md
specs/features/posts.md
```

Tasks:

- Implement Post service.
- Create Post ID before media uploads.
- Create Draft Post.
- Publish Post.
- Edit Post.
- Read Post.
- Remove Post.
- Validate category.
- Validate Tags.
- Generate excerpt.
- Store denormalized author data.
- Protect counters.
- Store Cloudinary assets.
- Add trusted timestamps.

Queries:

- Newest.
- Popular.
- Most viewed.
- By category.
- By Community.
- By author.

Completion criteria:

- Post CRUD works.
- Draft/public visibility is correct.
- Post schema matches specs.

Update:

```text
specs/roadmap/phases/9.md
```

---

# 12. Phase 10 — Write Post UI

Goal:

Build complete Post editor experience.

Read:

```text
specs/ui/screens/write-post.md
```

Tasks:

- Build `/write`.
- Add:

```text
Bài viết
Truyện
```

mode switch.

- Build title editor.
- Build content editor.
- Build category selector.
- Build Community selector placeholder/integration.
- Build Tags UI.
- Build thumbnail uploader.
- Build image uploader.
- Build Draft save.
- Build Publish.
- Add validation.
- Add publish loading state.
- Preserve input on failure.
- Warn about unsaved changes.
- Build responsive/mobile editor.

Completion criteria:

- User can create a Draft.
- User can publish.
- Images upload.
- Validation works.
- Duplicate publishing is prevented.

Update:

```text
specs/roadmap/phases/10.md
```

---

# 13. Phase 11 — Home Feed

Goal:

Implement the main discovery Feed.

Read:

```text
specs/features/home-feed.md
specs/ui/screens/home.md
```

Tasks:

- Build `PostCard`.
- Build `AuthorMeta`.
- Build `TagList`.
- Build Feed filters.
- Build Feed sort control.
- Implement Newest query.
- Implement Popular query.
- Implement Most Viewed query.
- Implement category queries.
- Implement cursor pagination.
- Implement Load More.
- Prevent duplicate Posts.
- Add loading skeletons.
- Add empty state.
- Add retry state.
- Preserve existing Posts on pagination error.
- Responsive Post Cards.
- Use Cloudinary transformed thumbnails.

Completion criteria:

- `/` displays published Posts.
- Filters work.
- Sorting works.
- Pagination works.
- Mobile Feed works.

Update:

```text
specs/roadmap/phases/11.md
```

---

# 14. Phase 12 — Post Detail

Goal:

Build complete Post reading surface.

Read:

```text
specs/ui/screens/post-detail.md
```

Tasks:

- Build:

```text
/post/[id]
```

- Load published Post.
- Handle owner Draft.
- Handle unavailable Post.
- Render author metadata.
- Render title/content.
- Render media.
- Render Tags.
- Render category.
- Render Community context.
- Add owner action menu.
- Add edit navigation.
- Add remove/delete flow.
- Add share action.
- Add responsive layout.
- Add sidebar content placeholders/integrations.

Completion criteria:

- Public Post reads correctly.
- Draft remains private.
- Owner can manage own content.
- Mobile Post page works.

Update:

```text
specs/roadmap/phases/12.md
```

---

# 15. Phase 13 — Voting

Goal:

Implement secure Post voting.

Tasks:

- Implement:

```text
posts/{postId}/votes/{uid}
```

- Support:

```text
+1
-1
none
```

- Build shared `VoteControl`.
- Support vertical layout.
- Support horizontal layout.
- Implement safe vote mutations.
- Keep `voteScore` consistent.
- Prevent duplicate counter updates.
- Handle:

  - none → upvote
  - upvote → none
  - none → downvote
  - downvote → none
  - upvote → downvote
  - downvote → upvote

- Add optimistic UI where safe.
- Roll back UI on failure.
- Guests request authentication.

Completion criteria:

- Voting state remains consistent.
- Refresh preserves current vote.
- Vote score remains correct.

Update:

```text
specs/roadmap/phases/13.md
```

---

# 16. Phase 14 — Comments

Goal:

Implement community discussion.

Tasks:

- Implement Comment data model.
- Create Comment.
- Reply to Comment.
- Edit own Comment if supported.
- Remove own Comment if supported.
- Query Comments by content.
- Implement pagination if needed.
- Update trusted `commentCount`.
- Build Comment composer.
- Build Comment item.
- Build replies.
- Limit visible nesting to approximately 2–3 levels.
- Integrate Comments into Post Detail.
- Add Guest auth prompt.
- Add loading/error/empty states.

Completion criteria:

- User can comment.
- User can reply.
- Comments render correctly.
- Post comment counter stays correct.

Update:

```text
specs/roadmap/phases/14.md
```

---

# 17. Phase 15 — Bookmarks

Goal:

Implement private saved content.

Tasks:

- Implement:

```text
users/{uid}/bookmarks/{bookmarkId}
```

- Bookmark Post.
- Remove bookmark.
- Bookmark Story.
- Load bookmark state.
- Build BookmarkButton.
- Integrate into Feed.
- Integrate into Post Detail.
- Integrate into Story surfaces later.
- Ensure bookmarks are private.

Completion criteria:

- Bookmark state persists.
- User cannot access another User's private bookmarks.

Update:

```text
specs/roadmap/phases/15.md
```

---

# 18. Phase 16 — Following Users

Goal:

Implement User-to-User following.

Tasks:

- Implement:

```text
users/{uid}/following/{targetUid}
```

and:

```text
users/{targetUid}/followers/{uid}
```

- Follow User.
- Unfollow User.
- Prevent self-follow.
- Maintain:

```text
followingCount
followersCount
```

- Add Follow button to profile.
- Add Follow state.
- Handle duplicate requests safely.

Completion criteria:

- Follow/unfollow persists.
- Counters remain correct.
- Self-follow impossible.

Update:

```text
specs/roadmap/phases/16.md
```

---

# 19. Phase 17 — Story Data Layer

Goal:

Implement serialized Story persistence.

Read:

```text
specs/database/stories.md
```

Tasks:

- Implement Story service.
- Generate Story ID.
- Generate slug.
- Reserve slug.
- Create Draft Story.
- Edit Story metadata.
- Read Story by ID.
- Resolve Story by slug.
- Implement Story status.
- Store cover image.
- Maintain trusted:

  - chapterCount
  - viewCount
  - followerCount

- Implement Story removal behavior.

Completion criteria:

- Story Draft can be created.
- Slugs are unique.
- Story metadata can be edited.

Update:

```text
specs/roadmap/phases/17.md
```

---

# 20. Phase 18 — Create Story UI

Goal:

Build initial Story creation experience.

Read:

```text
specs/ui/screens/create-story.md
```

Tasks:

- Add Story mode to `/write`.
- Build title field.
- Build description field.
- Build Tags.
- Build cover uploader.
- Generate slug.
- Reserve slug.
- Create Story as Draft.
- Navigate to Story management after creation.
- Add validation.
- Add unsaved-change warning.
- Responsive layout.

Completion criteria:

- User can create Story Draft.
- Cover upload works.
- Slug uniqueness works.

Update:

```text
specs/roadmap/phases/18.md
```

---

# 21. Phase 19 — Chapters

Goal:

Implement Chapter persistence and ordering.

Tasks:

- Implement:

```text
stories/{storyId}/chapters/{chapterId}
```

- Create Chapter.
- Edit Chapter.
- Delete/remove Chapter.
- Publish Chapter.
- Draft Chapter.
- Store Chapter number.
- Store title.
- Store content.
- Store word count.
- Store timestamps.
- Maintain Story `chapterCount`.
- Update Story `updatedAt` when Chapter publishes.
- Prevent duplicate Chapter numbers where required.

Completion criteria:

- Story supports multiple Chapters.
- Chapter order is deterministic.
- Draft Chapter remains private.

Update:

```text
specs/roadmap/phases/19.md
```

---

# 22. Phase 20 — Story Manager / Story Editor

Goal:

Provide Author tools for managing a Story.

Tasks:

- Create Story management route.
- Display Story metadata.
- Edit Story details.
- List Chapters.
- Create Chapter.
- Edit Chapter.
- Publish Chapter.
- Remove Chapter.
- Reorder Chapters if specification allows.
- Show Story publication status.
- Publish Story.
- Set:

  - ongoing
  - hiatus
  - completed

- Show validation errors.
- Protect ownership.
- Build responsive management UI.

Completion criteria:

- Author can fully manage Story lifecycle.
- Other Users cannot access management controls.

Update:

```text
specs/roadmap/phases/20.md
```

---

# 23. Phase 21 — Story Detail

Goal:

Build public Story landing page.

Read:

```text
specs/ui/screens/story-detail.md
```

Tasks:

- Build:

```text
/story/[slug]
```

- Resolve slug.
- Display cover.
- Display title.
- Display Author.
- Display Story state.
- Display description.
- Display Tags.
- Display view count.
- Display follower count.
- Display chapter count.
- Display Chapter list.
- Add Read action.
- Add Bookmark.
- Add Follow Story.
- Add owner management action.
- Handle Draft/private Story.
- Responsive design.

Completion criteria:

- Public Story page works.
- Chapter list works.
- Drafts remain private.

Update:

```text
specs/roadmap/phases/21.md
```

---

# 24. Phase 22 — Story Reader

Goal:

Build distraction-minimized Chapter reading.

Read:

```text
specs/ui/screens/story-reader.md
```

Tasks:

- Build Chapter reader route.
- Resolve Story + Chapter.
- Display Story title.
- Display Chapter title.
- Render Chapter body.
- Add previous Chapter.
- Add next Chapter.
- Add Chapter list selector.
- Add Back to Story.
- Build desktop reading width.
- Build mobile reading mode.
- Add optional reader preferences:

  - font size
  - reading width
  - line height

- Handle unpublished Chapters correctly.

Completion criteria:

- Long-form reading works well.
- Chapter navigation works.
- Mobile reader is comfortable.

Update:

```text
specs/roadmap/phases/22.md
```

---

# 25. Phase 23 — Story Following

Goal:

Allow Users to subscribe to Story updates.

Tasks:

- Implement:

```text
stories/{storyId}/followers/{uid}
```

- Add corresponding User-side relation if required by final schema.
- Follow Story.
- Unfollow Story.
- Maintain `followerCount`.
- Add Follow button.
- Integrate into Story Detail.
- Integrate into Reader where useful.

Completion criteria:

- Story follow state persists.
- Count remains correct.
- Story Follow remains independent from Author Follow.

Update:

```text
specs/roadmap/phases/23.md
```

---

# 26. Phase 24 — Communities

Goal:

Implement subreddit-like Communities.

Tasks:

- Implement Community schema.
- Create Community service.
- Build:

```text
/c/[slug]
```

- Display:

  - Community icon
  - Banner
  - Name
  - Description
  - Member count

- List Community Posts.
- Query by `communityId`.
- Add Community selection to Post editor.
- Add member/join behavior if included in MVP.
- Implement permission model.
- Add Cloudinary Community media.
- Responsive Community page.

Completion criteria:

- Community page works.
- Community Posts query correctly.
- Post editor can target Community.

Update:

```text
specs/roadmap/phases/24.md
```

---

# 27. Phase 25 — Notifications

Goal:

Implement activity notifications.

Supported types:

```text
comment
reply
follow
upvote
story_update
mention
```

Tasks:

- Implement Notification service.
- Create Notification records from supported activity.
- Build:

```text
/notifications
```

- Query by authenticated `userId`.
- Sort newest first.
- Mark one as read.
- Mark all as read if implemented.
- Show unread indicator in Header.
- Link Notification to target content.
- Keep Notifications private.

Completion criteria:

- Notifications appear for supported events.
- Only recipient can read them.
- Read state works.

Update:

```text
specs/roadmap/phases/25.md
```

---

# 28. Phase 26 — Search

Goal:

Implement useful MVP search without pretending Firestore is a full-text engine.

Tasks:

- Build:

```text
/search
```

- Search Users by normalized username.
- Search Tags.
- Search categories.
- Search Communities.
- Implement limited Story/Post search only where reliable.
- Add result tabs.
- Add loading/empty/error states.
- Add Header search integration.

Do not:

- Download all content and filter in Browser.
- Build fake full-text search.

Document limitations.

Completion criteria:

- Search provides useful MVP discovery.
- Queries remain scalable.

Update:

```text
specs/roadmap/phases/26.md
```

---

# 29. Phase 27 — Reports

Goal:

Allow Users to report inappropriate content.

Supported reasons:

```text
spam
harassment
nsfw
stolen_content
other
```

Tasks:

- Implement Report schema.
- Report Post.
- Report Story.
- Report Comment.
- Validate target.
- Prevent invalid duplicate submission where appropriate.
- Build report dialog.
- Save reporter UID.
- Save target identity.
- Save reason.
- Save optional explanation.

Completion criteria:

- Authenticated User can report content.
- Reports are not publicly readable.

Update:

```text
specs/roadmap/phases/27.md
```

---

# 30. Phase 28 — Moderation

Goal:

Implement Moderator capabilities.

Tasks:

- Respect:

```text
role = moderator
```

- Build moderation authorization.
- Review Reports.
- Hide Post.
- Hide Story.
- Hide/remove Comment.
- Restore content if product permits.
- Display moderation states appropriately.
- Ensure normal Users cannot invoke moderation mutations.
- Protect actions through Security Rules/server authorization.

Completion criteria:

- Moderator can moderate.
- User cannot gain Moderator permissions from client state.

Update:

```text
specs/roadmap/phases/28.md
```

---

# 31. Phase 29 — Admin

Goal:

Implement administrative controls.

Route:

```text
/admin
```

Tasks:

- Protect Admin route.
- Manage Reports.
- Manage Users.
- Manage Posts.
- Manage Stories.
- Manage Comments.
- Manage Communities.
- Change permitted User roles.
- Suspend User.
- Ban User.
- Restore account where applicable.
- Add safe confirmation dialogs.
- Ensure every mutation has trusted server-side authorization.

Completion criteria:

- Admin capabilities work securely.
- Non-Admins cannot access privileged mutations.

Update:

```text
specs/roadmap/phases/29.md
```

---

# 32. Phase 30 — Bookmarks/Profile Content Tabs

Goal:

Complete profile content navigation.

Tasks:

Build profile tabs:

```text
Bài viết
Truyện
```

Owner-only/private surfaces may include:

```text
Đã lưu
```

Tasks:

- Paginate User Posts.
- Paginate User Stories.
- Show empty states.
- Show private Bookmarks only to owner.
- Ensure Draft content visibility rules.

Completion criteria:

- Profiles are complete discovery surfaces.

Update:

```text
specs/roadmap/phases/30.md
```

---

# 33. Phase 31 — Settings

Goal:

Provide User account/application settings.

Route:

```text
/settings
```

Tasks may include:

- Edit profile.
- Avatar.
- Display name.
- Bio.
- Password reset link/action.
- Logout.
- Account information.
- Account deletion entry point if implemented.
- Safe handling for Google-only accounts.

Do not build unsupported settings merely to fill the page.

Completion criteria:

- Core profile/account settings work.

Update:

```text
specs/roadmap/phases/31.md
```

---

# 34. Phase 32 — Trusted Counters and Data Integrity

Goal:

Audit and harden all denormalized counters.

Audit:

```text
voteScore
commentCount
viewCount
followersCount
followingCount
postCount
storyCount
chapterCount
followerCount
memberCount
```

Tasks:

- Ensure counters cannot be arbitrarily edited.
- Use transaction/trusted mutation where required.
- Prevent duplicate increments.
- Prevent negative counts.
- Handle deletion/deactivation behavior.
- Document counter ownership.
- Add tests.

Completion criteria:

- Counters remain correct under repeated operations.

Update:

```text
specs/roadmap/phases/32.md
```

---

# 35. Phase 33 — Firestore Indexes

Goal:

Finalize query performance.

Tasks:

- Audit every production Firestore query.
- Add required composite indexes.
- Update:

```text
firestore.indexes.json
```

- Update:

```text
specs/database/indexes.md
```

Test:

- Home Feed.
- User content.
- Community Posts.
- Story discovery.
- Notifications.
- Comments.
- Admin/moderation queries.

Completion criteria:

- Normal product queries do not fail due to missing indexes.

Update:

```text
specs/roadmap/phases/33.md
```

---

# 36. Phase 34 — Security Audit

Goal:

Perform full Firebase/SvelteKit/Cloudinary authorization review.

Audit:

- User ownership.
- Post ownership.
- Story ownership.
- Chapter ownership.
- Comments.
- Votes.
- Bookmarks.
- Following.
- Story following.
- Notifications.
- Reports.
- Moderator operations.
- Admin operations.
- Cloudinary signing.
- Cloudinary deletion.
- Trusted counters.

Verify normal client cannot modify:

```text
role
status where unauthorized
authorId
trusted counters
other Users' data
moderation fields
```

Completion criteria:

- Critical security paths have tests.
- No obvious privilege escalation exists.

Update:

```text
specs/roadmap/phases/34.md
```

---

# 37. Phase 35 — Validation and Error Handling

Goal:

Make application validation consistent.

Tasks:

- Centralize validation rules.
- Username validation.
- Display name validation.
- Bio validation.
- Post title.
- Post content.
- Story title.
- Story description.
- Tags.
- Comments.
- Cloudinary files.
- Community fields.
- Reports.
- Normalize error messages.
- Add expected loading/error/empty states.

Completion criteria:

- Forms do not invent different validation limits.
- Backend/client constraints remain aligned.

Update:

```text
specs/roadmap/phases/35.md
```

---

# 38. Phase 36 — Responsive UI Audit

Goal:

Complete mobile/tablet support.

Audit all core routes:

```text
/
/auth/login
/auth/register
/write
/post/[id]
/story/[slug]
/story/[slug]/[chapter]
/u/[username]
/c/[slug]
/search
/notifications
/settings
/admin
```

Test:

```text
mobile
tablet
compact desktop
desktop
```

Fix:

- Horizontal overflow.
- Broken grids.
- Cramped controls.
- Tiny touch targets.
- Oversized headings.
- Sidebars.
- Editors.
- Dialogs.
- Menus.

Completion criteria:

- All MVP workflows are usable on mobile.

Update:

```text
specs/roadmap/phases/36.md
```

---

# 39. Phase 37 — Accessibility

Goal:

Ensure basic production accessibility.

Tasks:

- Semantic heading hierarchy.
- Accessible form labels.
- Keyboard navigation.
- Focus states.
- Icon button labels.
- Dialog focus management.
- Contrast audit.
- Image alt text.
- Screen-reader-friendly state labels.
- Avoid color-only states.

Completion criteria:

- Main workflows can be navigated with keyboard.
- Major accessibility violations are resolved.

Update:

```text
specs/roadmap/phases/37.md
```

---

# 40. Phase 38 — Performance

Goal:

Remove avoidable performance problems.

Audit:

- Firestore reads.
- N+1 queries.
- Realtime listeners.
- Image sizes.
- Cloudinary transformations.
- Feed pagination.
- Story Chapter loading.
- Comment loading.
- Bundle size.
- Duplicate Firebase initialization.
- Repeated auth listeners.

Tasks:

- Lazy-load images.
- Use transformed Cloudinary thumbnails.
- Avoid full collection reads.
- Avoid loading Votes/Comments only for counts.
- Remove unnecessary dependencies.

Completion criteria:

- Feed remains efficient with larger data volumes.
- No obvious N+1 query patterns.

Update:

```text
specs/roadmap/phases/38.md
```

---

# 41. Phase 39 — Testing

Goal:

Create reliable automated coverage for critical functionality.

Add:

```text
unit tests
integration tests
E2E tests
```

Critical E2E workflows:

```text
register
login
create Post
publish Post
read Post
vote
comment
bookmark
create Story
create Chapter
read Chapter
follow User
follow Story
report content
```

Security tests:

- Ownership.
- Privileged fields.
- Admin.
- Moderator.
- Private Bookmarks.
- Notifications.

Completion criteria:

- Critical workflows pass.
- Tests are documented.

Update:

```text
specs/roadmap/phases/39.md
```

---

# 42. Phase 40 — Content and UI Polish

Goal:

Bring the product from functional to cohesive.

Tasks:

- Remove placeholder content.
- Improve spacing.
- Normalize visual states.
- Polish hover/focus behavior.
- Improve skeletons.
- Improve Empty States.
- Improve error copy.
- Review mobile typography.
- Review horror imagery usage.
- Ensure consistent icon usage.
- Ensure consistent border radius.
- Remove generic shadcn appearance.
- Remove unused components.

Completion criteria:

- Product feels visually coherent.
- Core UI matches design specifications.

Update:

```text
specs/roadmap/phases/40.md
```

---

# 43. Phase 41 — Production Configuration

Goal:

Prepare production Firebase and deployment configuration.

Tasks:

- Production environment variables.
- Firebase project configuration.
- Firestore Rules deploy configuration.
- Firestore indexes.
- Firebase Auth provider configuration.
- Authorized domains.
- Cloudinary production credentials.
- Cloudinary upload constraints.
- Domain configuration.
- Error handling for missing environment variables.
- Verify secrets never enter frontend bundle.

Completion criteria:

- Production build succeeds.
- Production services connect correctly.

Update:

```text
specs/roadmap/phases/41.md
```

---

# 44. Phase 42 — Deployment

Goal:

Deploy the MVP.

Tasks:

- Select supported SvelteKit deployment target.
- Build production application.
- Deploy.
- Deploy Firestore Security Rules.
- Deploy Firestore indexes.
- Configure Firebase Auth domain.
- Configure production Cloudinary.
- Verify environment variables.
- Verify public routes.
- Verify authenticated routes.

Completion criteria:

- Production site is reachable.
- Authentication works in production.
- Firestore works in production.
- Cloudinary works in production.

Update:

```text
specs/roadmap/phases/42.md
```

---

# 45. Phase 43 — Production Smoke Test

Goal:

Verify the live product end-to-end.

Test using production environment:

- Register.
- Google login.
- Logout/login.
- Edit profile.
- Upload avatar.
- Create Draft Post.
- Publish Post.
- Upload Post media.
- Home Feed.
- Pagination.
- Vote.
- Comment.
- Bookmark.
- Follow User.
- Create Story.
- Upload Story cover.
- Create Chapter.
- Publish Story.
- Read Chapter.
- Follow Story.
- Community.
- Search.
- Notifications.
- Reports.
- Moderator.
- Admin.
- Mobile layout.

Completion criteria:

- No blocking production bug remains.

Update:

```text
specs/roadmap/phases/43.md
```

---

# 46. Phase 44 — MVP Completion

Goal:

Close the MVP implementation cycle.

Tasks:

- Run formatter.
- Run linter.
- Run type checking.
- Run all tests.
- Run production build.
- Remove debugging code.
- Remove dead files.
- Remove unused dependencies.
- Review Firestore Rules.
- Review indexes.
- Review environment variables.
- Review Cloudinary security.
- Review documentation.
- Verify all previous phase files.
- Verify all required MVP features are complete.

Required checks:

```text
npm run check
npm run test
npm run build
```

or equivalent project commands.

---

# 47. Final Roadmap State

When Phase 44 is successfully completed:

Update:

```text
specs/roadmap/phases/44.md
```

with:

```text
Status: Completed
```

Then update this file with:

```text
MVP_STATUS = COMPLETE
```

Do not mark MVP complete if any required earlier phase remains incomplete.

---

# 48. Codex Phase Workflow

For every phase Codex must follow:

```text
1. Read roadmap/mvp.md
2. Read specs/roadmap/phases/{phase}.md if it exists
3. Read relevant specs
4. Inspect current implementation
5. Implement the smallest complete solution
6. Run formatter
7. Run type checking
8. Run relevant tests
9. Fix discovered errors
10. Manually verify behavior where required
11. Update specs/roadmap/phases/{phase}.md
12. Only then continue to the next phase
```

---

# 49. Phase File Update Requirement

Updating:

```text
specs/roadmap/phases/{phase}.md
```

is part of completing the phase itself.

A phase is NOT complete until its phase file has been updated.

Codex must record:

- Completed tasks
- Important implementation decisions
- Files changed
- Dependencies added
- Database changes
- Security changes
- Known limitations
- Verification performed

This allows another Codex session or developer to continue the project without reconstructing previous implementation history.

---

# 50. Scope Control

Codex should not add unrelated features while implementing a phase.

If a useful idea is outside current MVP scope:

- Do not implement it automatically.
- Record it under notes if relevant.
- Leave it for a later roadmap.

Examples of features that should not silently expand MVP scope:

```text
AI recommendation engine
Direct messages
Realtime chat
Paid subscriptions
Ads
Video hosting
Audio hosting
Complex reputation system
Gamification
Mobile native applications
```

---

# 51. Definition of Done

The vucdem MVP is complete only when:

- Authentication works.
- Profiles work.
- Posts work.
- Feed works.
- Voting works.
- Comments work.
- Bookmarks work.
- Following works.
- Stories work.
- Chapters work.
- Story Reader works.
- Story Follow works.
- Communities work.
- Notifications work.
- Search works at documented MVP capability.
- Reports work.
- Moderation works.
- Admin works.
- Cloudinary media works securely.
- Firestore Rules protect application data.
- Required indexes exist.
- Mobile layouts work.
- Critical workflows are tested.
- Production build succeeds.
- Production smoke test succeeds.
- All required phase files are marked complete.

Only then may:

```text
MVP_STATUS = COMPLETE
```
