# Codex Rules

This document defines mandatory rules for Codex when working on the `vucdem` project.

These rules apply to all implementation phases, features, bug fixes, refactors, architecture changes, database changes, UI work, and tests.

---

# 1. General Responsibility

Codex is allowed to make implementation decisions necessary to complete the project correctly.

The existing project structure is a baseline, not a hard limitation.

Codex is explicitly allowed to:

- Create new folders.
- Create new files.
- Split existing files.
- Move code into better modules.
- Create reusable components.
- Create services.
- Create utilities.
- Create validators.
- Create shared types.
- Create server endpoints.
- Create tests.
- Create configuration files.
- Install dependencies.
- Refactor existing code.
- Extend the project structure.
- Create new specification files when necessary.
- Update existing specification files when implementation decisions change.

The goal is not to minimize the number of files.

The goal is to create a maintainable, secure, scalable, understandable, and production-quality codebase.

---

# 2. Read Specifications Before Coding

Before implementing a task, Codex MUST inspect the relevant specifications.

Start with:

```text
specs/README.md
specs/rules.md
```

Then read relevant files under:

```text
specs/product/
specs/architecture/
specs/database/
specs/security/
specs/features/
specs/ui/
specs/api/
specs/implementation/
specs/testing/
specs/roadmap/
```

Codex must not invent behavior that contradicts existing specifications.

When implementing a roadmap phase, also read:

```text
roadmap/mvp.md
specs/roadmap/phases/{phase}.md
```

if the phase file already exists.

---

# 3. Specification Priority

When specifications overlap, use this priority:

1. Security requirements.
2. More specific specification.
3. Feature specification.
4. Database specification.
5. Architecture specification.
6. UI screen specification.
7. General UI specification.
8. General project rules.

If two specifications genuinely conflict and the correct behavior cannot be determined safely, Codex must document the conflict rather than silently inventing behavior.

---

# 4. UI Reference Images

UI reference images are stored under:

```text
specs/ui/img/
```

Codex MUST inspect relevant `.png` images before implementing or significantly modifying UI.

Search recursively:

```text
specs/ui/img/**/*.png
```

Possible examples:

```text
specs/ui/img/home.png
specs/ui/img/post-detail.png
specs/ui/img/story-detail.png
specs/ui/img/story-reader.png
specs/ui/img/mobile/home.png
```

The exact folder structure may evolve.

Codex should search the entire `specs/ui/img/` directory for relevant references.

---

# 5. Reference Images Are Visual Specifications

Reference images are not merely inspiration.

They are visual specifications.

Codex should reproduce the reference UI as closely as practical.

Inspect and reproduce:

- Overall layout.
- Component placement.
- Sidebar widths.
- Main content width.
- Header height.
- Spacing.
- Padding.
- Typography hierarchy.
- Font style.
- Colors.
- Borders.
- Border radius.
- Card structure.
- Image sizes.
- Image aspect ratios.
- Icon placement.
- Metadata placement.
- Voting controls.
- Navigation.
- Tabs.
- Buttons.
- Content density.
- Visual hierarchy.

Do not replace a provided design with a generic interpretation.

---

# 6. UI Implementation Priority

When implementing UI, use:

```text
Reference image
+
screen specification
+
design system
+
layout specification
+
responsive specification
+
component specification
```

Relevant files may include:

```text
specs/ui/design-system.md
specs/ui/layout.md
specs/ui/responsive.md
specs/ui/typography.md
specs/ui/colors.md
specs/ui/icons.md
specs/ui/components.md
specs/ui/screens/*.md
```

The final implementation should visually resemble the reference while remaining responsive and maintainable.

---

# 7. Do Not Produce Generic UI

Do not turn vucdem into a generic:

- SaaS dashboard.
- Admin dashboard.
- Bootstrap website.
- Default shadcn application.
- Glassmorphism application.
- Corporate website.

The canonical vucdem visual identity must be preserved.

The design direction is:

```text
Underground horror community
+
Premium horror publication
+
Reddit-like content hierarchy
```

---

# 8. Project Structure Can Be Extended

Codex may extend the documented source structure whenever doing so improves architecture.

For example:

```text
src/lib/
├── components/
├── firebase/
├── cloudinary/
├── services/
├── stores/
├── types/
├── utils/
├── validators/
├── schemas/
├── constants/
├── server/
├── actions/
└── hooks/
```

New folders are allowed.

New folders should have a clear architectural purpose.

Do not create meaningless abstraction layers.

---

# 9. Codex May Create Files Freely

Codex does NOT need permission to create files required for a feature.

Example:

```text
src/lib/components/post/
├── PostCard.svelte
├── PostHeader.svelte
├── PostBody.svelte
├── PostMedia.svelte
├── PostActions.svelte
└── PostMeta.svelte
```

This is preferable to putting everything into one giant component.

---

# 10. Do Not Put Too Much Code in One File

Codex MUST avoid monolithic files.

A file should normally have one clear responsibility.

Do not put all of the following into one Svelte file:

```text
UI
Firestore queries
Firestore mutations
Cloudinary uploads
validation
authorization
pagination
business logic
formatting helpers
```

Separate responsibilities appropriately.

Preferred architecture:

```text
Page
↓
Components
↓
Services
↓
Firebase / Server API
```

---

# 11. Split Large Components

If a component contains multiple independently meaningful UI sections, split it.

Avoid:

```text
PostDetail.svelte
└── 1000+ lines containing everything
```

Prefer:

```text
post/
├── PostHeader.svelte
├── PostBody.svelte
├── PostMedia.svelte
├── PostActions.svelte
├── PostSidebar.svelte
└── PostComments.svelte
```

The parent screen should primarily compose components.

---

# 12. Split Large Services

Do not create one giant service such as:

```text
services/firebase.ts
```

containing the entire application data layer.

Prefer domain services:

```text
services/
├── users.ts
├── posts.ts
├── stories.ts
├── chapters.ts
├── comments.ts
├── votes.ts
├── follows.ts
├── bookmarks.ts
├── communities.ts
├── notifications.ts
└── reports.ts
```

If an individual service becomes too large, Codex may split it further.

Example:

```text
services/posts/
├── create.ts
├── queries.ts
├── mutations.ts
├── moderation.ts
└── index.ts
```

---

# 13. No Artificial File Size Limit

There is no strict maximum number of lines per file.

Split files based on:

- Responsibility.
- Complexity.
- Reusability.
- Testability.
- Maintainability.

A file reaching roughly:

```text
300–500+ lines
```

should trigger a review to determine whether it contains multiple responsibilities.

This is a warning threshold, not an absolute rule.

---

# 14. Avoid Over-Fragmentation

Do not solve large files by creating dozens of meaningless tiny files.

Avoid both extremes:

```text
one giant file
```

and:

```text
one function per file without architectural reason
```

Create modules around meaningful responsibilities.

---

# 15. Extract Reusable Logic

Logic reused across features should be extracted.

Examples:

- Date formatting.
- Username normalization.
- Slug generation.
- Error normalization.
- Tag normalization.
- Validation.
- Pagination helpers.
- Cloudinary helpers.
- Authentication guards.
- Firestore utilities.

Do not copy-paste important business logic.

---

# 16. Codex May Install Dependencies

Codex is explicitly allowed to install dependencies required to implement the project.

Codex does NOT need to ask for permission before installing a reasonable dependency.

Examples:

- Firebase SDK.
- Validation libraries.
- Form libraries.
- Rich-text editors.
- Date utilities.
- Testing libraries.
- Svelte utilities.
- Cloudinary helpers.

---

# 17. Prefer Mature Libraries

Before implementing a common subsystem manually, Codex should check whether a mature library already solves it.

Prefer established libraries for:

- Validation.
- Rich-text editing.
- Forms.
- Date handling.
- Testing.
- Accessible UI primitives.
- Parsing.
- Utility functionality.

Do not reinvent well-solved infrastructure without a strong reason.

---

# 18. Dependency Selection

Before adding an important dependency, consider:

- Maintenance activity.
- Svelte compatibility.
- SvelteKit compatibility.
- TypeScript support.
- Bundle size.
- Security.
- License.
- Community adoption.
- API stability.
- Whether it meaningfully reduces complexity.

Do not install a large dependency for a trivial helper.

---

# 19. Record Important Dependencies

Important dependencies added during a roadmap phase should be recorded in:

```text
specs/roadmap/phases/{phase}.md
```

Example:

```markdown
## Dependencies Added

- zod — runtime schema validation
- @tiptap/core — rich text editor foundation
```

---

# 20. Codex May Create New Specs

Codex is explicitly allowed to create new files under:

```text
specs/
```

when a necessary specification does not already exist.

Codex does NOT need to stop implementation simply because the required spec file has not been created yet.

---

# 21. When to Create a New Spec

Create or extend a specification when implementation introduces a meaningful new:

- Feature.
- Data model.
- Firestore collection.
- Firestore subcollection.
- Persistent field.
- Security rule.
- Server endpoint.
- Shared architecture.
- State machine.
- Cross-feature behavior.
- Important UI pattern.
- Major infrastructure dependency.

Example:

```text
specs/features/reading-progress.md
```

may be created if reading progress becomes part of the implementation.

---

# 22. Do Not Create Specs for Trivial Helpers

Do not create specification files for every:

- Utility function.
- Tiny component.
- CSS helper.
- Internal implementation detail.

Specifications should document meaningful system behavior and architecture.

---

# 23. Specs Must Match Implementation

Specifications describe the intended current system.

Do not knowingly leave:

```text
spec says A
code implements B
```

If implementation legitimately changes:

- Architecture.
- Database schema.
- Security model.
- Feature behavior.
- API contract.
- Important UI behavior.

update the relevant specification.

---

# 24. Do Not Invent Firestore Fields Silently

Codex must not silently add persistent Firestore fields.

Before adding a new persistent field:

1. Determine why it is necessary.
2. Check existing database specs.
3. Update the appropriate database spec.
4. Define its type.
5. Define required/optional behavior.
6. Define its default value.
7. Define who may write it.
8. Define relevant validation.
9. Define indexes if necessary.
10. Implement it.

---

# 25. Do Not Invent Collections Silently

The same rule applies to:

- Collections.
- Subcollections.
- Relationship documents.
- Utility mappings.

New persistent structures require corresponding specification updates.

---

# 26. Consider Existing Data

When changing an existing schema, consider existing Firestore documents.

Do not assume every existing document immediately contains new fields.

When appropriate, provide:

- Safe defaults.
- Backward-compatible reads.
- Migration scripts.
- Migration documentation.

---

# 27. Browser Is Untrusted

Always treat Browser code as untrusted.

Users may modify:

- JavaScript.
- Network requests.
- Request bodies.
- Local state.
- Firestore calls.

Never trust the Browser to provide authoritative values for:

- Role.
- Account status.
- Ownership.
- Counters.
- Author identity.
- Moderation state.
- Cloudinary protected folders.
- Cloudinary deletion targets.

---

# 28. Authentication Is Not Authorization

Firebase Authentication proves identity.

It does not automatically grant permission.

Authorization must be enforced using the appropriate combination of:

```text
Firebase Authentication
+
Firestore Security Rules
+
trusted SvelteKit server code
+
ownership checks
+
role checks
```

Frontend role checks exist for UX only.

They are not a security boundary.

---

# 29. Protect Trusted Fields

Normal clients must not arbitrarily change trusted fields.

Examples include:

```text
role
status
authorId
createdAt
publishedAt
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

Exact rules are defined by database and security specifications.

---

# 30. Cloudinary Secret

Never expose:

```text
CLOUDINARY_API_SECRET
```

to frontend code.

Never:

- Put it in a `PUBLIC_*` variable.
- Serialize it into page data.
- Return it from an API endpoint.
- Include it in client JavaScript.
- Commit it into source control.

---

# 31. No Firebase Storage

vucdem uses:

```text
Cloudinary
```

for media.

Do NOT introduce Firebase Storage unless the project specifications are explicitly changed.

---

# 32. Cloudinary Asset Ownership

Application-owned Cloudinary media should retain:

```ts
type CloudinaryAsset = {
	url: string;
	publicId: string;
};
```

Do not save only a URL when vucdem owns and may later delete or replace the asset.

---

# 33. Secure Cloudinary Upload

Preferred upload flow:

```text
Browser
↓
SvelteKit signing endpoint
↓
signed parameters
↓
Browser uploads directly to Cloudinary
↓
Cloudinary returns URL + publicId
↓
Firestore stores asset reference
```

The Browser must not determine arbitrary protected Cloudinary folders.

---

# 34. Media Replacement

Prefer:

```text
upload new asset
↓
persist new Firestore reference
↓
delete old asset
```

Do not delete the old asset first unless there is a strong technical reason.

---

# 35. Component/Data Boundary

Prefer:

```text
Component
↓
Service
↓
Firestore
```

or:

```text
Component
↓
Service
↓
SvelteKit API
↓
Trusted operation
```

Do not spread raw Firestore logic throughout unrelated UI components.

---

# 36. Server Boundaries

Use trusted SvelteKit server code for operations involving:

- Secrets.
- Privileged authorization.
- Cloudinary signatures.
- Cloudinary deletion.
- Admin operations.
- Moderation operations where required.
- Sensitive counter mutations.
- Workflows that cannot safely be enforced from the Browser.

---

# 37. TypeScript

Use strict TypeScript.

Avoid:

```ts
any;
```

unless there is a clear unavoidable boundary.

Prefer:

```ts
unknown;
```

then validate or narrow it.

Use shared domain types.

Do not create slightly different versions of the same model throughout the project.

---

# 38. Validation

Validate data at appropriate boundaries.

Frontend validation improves UX.

Server/security validation protects the system.

Validate:

- User input.
- API bodies.
- URL parameters.
- IDs.
- Slugs.
- Enums.
- Tags.
- Uploaded files.
- Pagination parameters.
- Firestore data where appropriate.

Frontend validation alone is never sufficient security.

---

# 39. Loading and Error States

Important asynchronous UI must consider:

```text
loading
success
empty
error
```

Mutations should consider:

```text
idle
submitting
success
error
```

Do not leave buttons appearing functional while requests are silently running.

---

# 40. Preserve User Input

Do not clear forms or editors before successful persistence.

If publishing fails, preserve where possible:

- Title.
- Content.
- Tags.
- Category.
- Community.
- Metadata.
- Successfully uploaded media references.

Allow retry.

---

# 41. Prevent Duplicate Mutations

Protect actions such as:

- Publish Post.
- Create Story.
- Publish Chapter.
- Comment.
- Vote.
- Follow.
- Bookmark.
- Upload.
- Report.

against accidental duplicate submissions.

---

# 42. Firestore Pagination

Use cursor-based pagination.

Preferred:

```text
limit()
startAfter(lastDocument)
```

Do not use numeric page offsets for Firestore collections.

---

# 43. Avoid Full Collection Reads

Never download an entire large collection merely to filter it in the Browser.

This applies especially to:

- Feed.
- Search.
- Comments.
- Notifications.
- Profiles.
- Communities.
- Stories.

Design scalable Firestore queries.

---

# 44. Avoid N+1 Reads

Use intentional denormalization already defined by the specifications.

Example Post data may include:

```text
authorName
authorUsername
authorAvatarUrl
```

Do not fetch:

```text
users/{authorId}
```

for every Post Card unless current data actually requires it.

---

# 45. Realtime Listeners

Do not automatically use realtime Firestore listeners everywhere.

Use realtime behavior only where it provides meaningful value.

Prefer normal reads for content that does not require realtime updates.

---

# 46. Counter Integrity

Counters require authoritative mutation paths.

Examples:

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

Do not trust Browser-provided counter values.

Use:

- Transactions.
- Atomic increments.
- Trusted server operations.
- Other safe mechanisms.

as appropriate.

---

# 47. Firestore Indexes

When a query requires a composite index:

1. Add it to `firestore.indexes.json`.
2. Update `specs/database/indexes.md` if applicable.
3. Record the change in the current roadmap phase.

Do not rely on undocumented Firebase Console configuration.

---

# 48. Svelte and SvelteKit

Use modern patterns supported by the current project version.

Do not blindly copy outdated Svelte examples.

Prefer:

- Clear component boundaries.
- Shared types.
- Derived state where appropriate.
- Minimal global state.
- Correct server/browser separation.
- Standard SvelteKit routing.
- Reusable components.

---

# 49. Global State

Do not put all application data into global stores.

Global state should represent genuinely application-wide state.

Examples:

```text
authentication
global UI preferences
```

Page-specific data should generally remain page/feature scoped.

---

# 50. shadcn-svelte

shadcn-svelte is a primitive component foundation.

It does NOT define the final vucdem appearance.

Codex must restyle shadcn components according to the vucdem design system.

Avoid default shadcn/SaaS appearance.

---

# 51. Icons

Use:

```text
@lucide/svelte
```

for normal interface icons.

Do not install additional icon libraries for icons already available in Lucide.

Custom icons are allowed for branding or concepts that Lucide cannot represent appropriately.

---

# 52. Responsive Design Is Mandatory

Desktop implementation alone is not complete.

Core screens must work across:

```text
mobile
tablet
compact desktop
desktop
```

Follow:

```text
specs/ui/responsive.md
```

---

# 53. Do Not Shrink Desktop UI Into Mobile

Responsive design should reorganize information.

Example:

Desktop:

```text
Vote | Content | Thumbnail
```

Mobile:

```text
Content
Thumbnail
Actions
```

Do not force desktop columns into narrow mobile screens.

---

# 54. Avoid Horizontal Overflow

Core pages must not accidentally create horizontal page scrolling.

Check:

- Long titles.
- Usernames.
- Tags.
- Images.
- Editors.
- Dialogs.
- Tables.
- Long content.
- Navigation.

---

# 55. Accessibility

Implement reasonable accessibility by default.

Requirements include:

- Semantic HTML.
- Correct labels.
- Keyboard navigation.
- Visible focus states.
- Accessible icon button labels.
- Sufficient contrast.
- Appropriate alt text.
- No color-only state communication.

---

# 56. User-Facing Errors

Do not expose raw infrastructure errors.

Bad:

```text
FirebaseError: PERMISSION_DENIED
```

Better:

```text
Không thể đăng bài. Vui lòng thử lại.
```

Technical details may be logged safely during development.

---

# 57. Logging

Remove unnecessary debugging logs before completing a phase.

Never log:

- Passwords.
- Authentication tokens.
- API secrets.
- Private credentials.
- Sensitive User information.

---

# 58. Code Comments

Use comments for:

- Non-obvious logic.
- Security reasoning.
- Complex algorithms.
- Important architectural decisions.
- Necessary workarounds.

Do not add comments that merely repeat the code.

---

# 59. Refactoring Is Allowed

Codex may refactor existing implementation when:

- A file becomes too large.
- Duplication appears.
- Architecture becomes inappropriate.
- Security requires it.
- New requirements require better boundaries.
- Testing exposes design problems.

Do not preserve bad architecture merely because it already exists.

---

# 60. Do Not Rewrite Stable Code Without Reason

Refactoring should have a clear benefit.

Avoid repeatedly rewriting working systems merely because another style is possible.

Prefer incremental improvement.

---

# 61. Tests Are Part of Implementation

Codex may and should create tests.

Prioritize tests for:

- Validation.
- Authentication.
- Authorization.
- Security Rules.
- Username reservation.
- Slug reservation.
- Voting transitions.
- Following.
- Counters.
- Important services.
- Critical User workflows.

---

# 62. No Fake Completed Features

Do not mark a feature complete when it contains only:

- Placeholder buttons.
- Mock data.
- Static fake results.
- TODOs for required functionality.
- Empty functions.
- UI without required persistence.

Mocks are acceptable during development and testing.

They are not acceptable as the final implementation of a completed roadmap phase.

---

# 63. TODO Rules

TODOs are allowed for non-blocking future improvements.

A roadmap phase must NOT be marked complete when a TODO represents a required acceptance criterion.

Important remaining TODOs must be recorded in:

```text
specs/roadmap/phases/{phase}.md
```

---

# 64. Phase Workflow

For every roadmap phase, Codex MUST follow this workflow:

```text
1. Read specs/rules.md
2. Read roadmap/mvp.md
3. Read specs/roadmap/phases/{phase}.md if it exists
4. Read relevant specs
5. Inspect relevant specs/ui/img/**/*.png references
6. Inspect current implementation
7. Determine required dependencies
8. Implement the phase
9. Create additional files/folders when useful
10. Refactor when necessary
11. Update affected specs
12. Format changed code
13. Run type checking
14. Run relevant tests
15. Fix discovered problems
16. Manually verify important behavior
17. Update specs/roadmap/phases/{phase}.md
18. Only then mark the phase complete
```

---

# 65. Phase Status Files Are Mandatory

When working on Phase X, Codex must maintain:

```text
specs/roadmap/phases/X.md
```

If the file does not exist, Codex must create it.

Do not stop or ask for permission merely because the phase file is missing.

---

# 66. Phase File Contents

Each phase status file should contain:

```markdown
# Phase X

## Status

- [ ] Not started
- [ ] In progress
- [ ] Completed

## Goal

...

## Tasks

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

## Specs Added or Updated

- ...

## Important Decisions

- ...

## Known Limitations

- ...

## Verification

- [ ] Formatting
- [ ] Type checking
- [ ] Tests
- [ ] Manual verification

## Completed At

...
```

---

# 67. Updating the Phase File Is Part of the Phase

A phase is NOT complete until:

```text
specs/roadmap/phases/X.md
```

has been updated.

Codex must record what was actually implemented.

Do not mark tasks complete merely because implementation was planned.

---

# 68. Codex May Create Missing Specs

If a necessary specification does not exist, Codex may create it automatically.

Example:

```text
specs/features/reading-progress.md
specs/database/reading-progress.md
specs/api/moderation.md
```

Do not block implementation merely because the original project structure did not anticipate every necessary specification.

---

# 69. New Specs Must Be Useful

A new specification should describe meaningful decisions.

Depending on the subject, define:

- Purpose.
- Scope.
- Behavior.
- Data model.
- Permissions.
- Validation.
- Queries.
- Mutations.
- Edge cases.
- Integration points.

Do not create empty placeholder specification files.

---

# 70. Update Related Project Artifacts

Source code is not the only artifact that may require updates.

When implementation changes behavior, consider whether to update:

```text
specs/
specs/roadmap/phases/
tests/
firestore.rules
firestore.indexes.json
.env.example
package.json
documentation
```

Keep the project synchronized.

---

# 71. Environment Variables

Never hardcode production credentials.

When adding a required environment variable:

1. Use the correct SvelteKit environment boundary.
2. Add a placeholder to `.env.example`.
3. Document its purpose where necessary.
4. Never commit the real secret.

---

# 72. Never Commit Secrets

Never place real credentials in:

- Source code.
- Specs.
- README.
- Tests.
- `.env.example`.
- Roadmap files.

Use placeholders only.

---

# 73. Package Scripts

Codex may add useful project scripts.

Examples:

```text
npm run check
npm run lint
npm run test
npm run test:e2e
npm run format
npm run build
```

Prefer predictable project-wide commands.

---

# 74. Verification Before Phase Completion

Before marking a phase complete, run relevant available checks.

At minimum, where configured:

```text
npm run check
npm run lint
npm run test
```

For production-related work also run:

```text
npm run build
```

If a command fails, investigate and fix the problem before marking the phase complete.

---

# 75. Do Not Delete Tests Just to Pass

If an existing test fails because behavior intentionally changed:

1. Confirm the new behavior matches specs.
2. Update the test.
3. Update specs if necessary.

Do not simply remove tests to make the test suite green.

---

# 76. Dependency Cleanup

Remove dependencies that become unused.

Avoid accumulating:

- Abandoned packages.
- Duplicate libraries.
- Temporary dependencies.
- Multiple libraries solving the same problem.

---

# 77. Domain Terminology

Use terminology defined by:

```text
specs/product/terminology.md
```

Canonical concepts include:

```text
Post
Story
Chapter
Community
Comment
Bookmark
Follow
Vote
```

Do not introduce unnecessary synonyms such as:

```text
Article
Novel
Episode
Group
Favorite
Subscription
```

unless specifications explicitly change terminology.

---

# 78. Preserve Domain Boundaries

Keep these concepts separate:

```text
Post != Story

Story != Chapter

Bookmark != Follow

Follow User != Follow Story

Category != Community

Authentication != Authorization
```

These distinctions must remain clear across:

- Database.
- Types.
- Services.
- UI.
- Routes.
- Naming.

---

# 79. Search

Firestore is not a general full-text search engine.

Do not implement fake search by downloading all Posts or Stories and filtering them in the Browser.

If true full-text search becomes necessary, Codex may recommend and document a mature search solution such as:

```text
Algolia
Typesense
Meilisearch
```

Adding major infrastructure requires specification updates.

---

# 80. Performance

Consider performance during every phase.

Avoid obvious problems such as:

- N+1 Firestore queries.
- Unbounded realtime listeners.
- Full collection reads.
- Loading original huge images in Feed.
- Loading all Comments at once.
- Loading all Chapters at once.
- Repeated Firebase initialization.
- Multiple unnecessary auth listeners.
- Excessive client bundle dependencies.

---

# 81. Cloudinary Image Optimization

Use appropriate Cloudinary transformations for displayed images.

Examples:

```text
Feed thumbnail
→ transformed thumbnail size

Avatar
→ small square transformation

Story cover
→ appropriately sized cover transformation
```

Do not download original multi-megabyte images for small UI thumbnails.

---

# 82. Server-Only Code Must Stay Server-Only

Do not accidentally import server-only code into Browser bundles.

This is especially important for:

```text
Cloudinary secrets
Firebase Admin SDK
private environment variables
privileged server utilities
```

Respect SvelteKit server/client boundaries.

---

# 83. Destructive Operations

Meaningful destructive operations require confirmation.

Examples:

- Delete Post.
- Delete Story.
- Delete Chapter.
- Delete account.
- Remove Community.
- Moderator removal.

The confirmation should clearly state the effect of the action.

---

# 84. Firestore Does Not Cascade Automatically

When deleting parent content, explicitly consider related data.

Example:

```text
Post
├── votes
├── comments
├── bookmarks
└── Cloudinary media
```

Do not assume deleting the Post document automatically removes everything related to it.

---

# 85. Partial Failures

Multi-step operations must account for partial failure.

Example:

```text
Cloudinary upload succeeds
↓
Firestore write fails
```

This may create an orphaned Cloudinary asset.

Another example:

```text
Firestore update succeeds
↓
old Cloudinary asset deletion fails
```

The primary operation may still be successful while cleanup is handled separately.

Codex must design these flows deliberately.

---

# 86. Do Not Fail Successful User Operations Because of Non-Critical Cleanup

Example:

```text
new avatar uploaded
↓
Firestore updated successfully
↓
old avatar deletion fails
```

The avatar update may still be considered successful.

The cleanup failure should be logged or retried appropriately rather than unnecessarily reverting the successful User operation.

---

# 87. Maintainability Over Cleverness

Prefer clear, predictable code.

Avoid unnecessarily clever abstractions.

Future Codex sessions and human developers should be able to understand the project without reconstructing hidden assumptions.

---

# 88. Avoid Unnecessary Custom Infrastructure

Do not build custom systems when an appropriate mature solution already exists.

Examples:

Do not build:

- Custom icon library when Lucide works.
- Custom media CDN when Cloudinary exists.
- Custom validation framework when a mature library fits.
- Custom rich-text engine when an appropriate editor library fits.
- Custom authentication when Firebase Authentication already provides it.

---

# 89. Scope Control

Codex may improve architecture but must respect MVP scope.

Do not spontaneously implement unrelated large features such as:

```text
Direct messages
Realtime chat
AI recommendations
Paid subscriptions
Native mobile applications
Video hosting
Audio streaming
Complex achievements
Gamification
```

unless the roadmap or specifications require them.

---

# 90. Supporting Infrastructure Is Allowed

Codex may implement supporting infrastructure even when it is not explicitly listed as its own roadmap phase if it is necessary to correctly implement a required feature.

Examples:

```text
auth guard
pagination helper
validation schema
upload state machine
error normalizer
shared query helper
```

---

# 91. Architectural Problems

If Codex discovers that an existing specification is:

- Technically impossible.
- Unsafe.
- Internally inconsistent.
- Significantly harmful to maintainability.

Codex must not blindly implement it.

Instead:

1. Investigate the issue.
2. Choose the safest reasonable solution.
3. Update the relevant specification.
4. Record the decision in the current phase file.

Do not silently change product behavior for convenience.

---

# 92. Preserve Existing Work

Avoid unnecessarily deleting working code or User-created project content.

Make targeted changes.

Major restructuring is allowed when justified, but preserve working behavior unless intentionally changing it.

---

# 93. Formatting

Use the project's configured formatter.

Format changed code before completing a phase.

Do not manually introduce inconsistent formatting conventions.

---

# 94. Keep the Project Runnable

Whenever practical, each completed phase should leave the project in a runnable state.

Avoid situations such as:

```text
old implementation removed
+
new implementation half-finished
=
project no longer runs
```

A completed phase must represent a coherent checkpoint.

---

# 95. No Silent Architecture Changes

Significant architecture changes must be reflected in:

```text
relevant specs
+
current roadmap phase file
```

Examples:

- New database collection.
- New persistent relation.
- New server API.
- New authentication flow.
- New media architecture.
- New search infrastructure.
- New editor format.

---

# 96. Do Not Optimize for Fewer Files

The number of files is not a measure of implementation quality.

Prefer:

```text
clear modules
+
clear responsibilities
+
reusable code
```

over artificially keeping the project small.

---

# 97. Do Not Optimize for Maximum Abstraction

More abstraction is also not automatically better.

Prefer the simplest architecture that cleanly supports current requirements and reasonable future extension.

---

# 98. Final Decision Rule

When multiple valid implementation approaches exist, prefer the option that is:

1. Secure.
2. Consistent with specifications.
3. Maintainable.
4. Simple.
5. Testable.
6. Responsive.
7. Accessible.
8. Efficient enough for expected MVP usage.
9. Consistent with the existing architecture.

---

# 99. Definition of Good Codex Work

Good Codex implementation should leave vucdem:

```text
easy to understand
easy to extend
secure by default
consistent with specs
consistent with UI references
responsive
accessible
testable
free from unnecessary duplication
free from giant monolithic files
free from unnecessary dependencies
```

Codex has permission to evolve the file and folder structure when doing so improves these qualities.

---

# 100. Core Rule

Codex should behave as an implementation agent responsible for completing the project, not as a code snippet generator.

Codex is expected to:

```text
inspect
understand
plan
implement
create files
create folders
install dependencies
refactor
test
verify
update specs
update roadmap progress
```

without requiring permission for normal technical decisions that are necessary to complete the defined project.

The final source of truth must remain synchronized:

```text
Specifications
+
Implementation
+
Security Rules
+
Database Indexes
+
Tests
+
Roadmap Phase Status
```
