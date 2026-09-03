# Story editor

The content selector contains `Văn bản`, `Audio`, and `Nhập vai`. `Nhập vai` mounts the dedicated character/timeline editor defined in `specs/features/interactive-stories.md`; it never falls back to the text editor. Short stories author this content during creation, while serial stories author it per chapter.

## Contract

Authenticated authors create a draft from `/write?mode=story`, then manage it at `/story/{id}/manage`. The create form accepts title, description, at most eight normalized tags, and an optional Cloudinary 2:3 cover. Slugs are server-generated and atomically reserved.

Creation begins with `Truyện dài` (`format = serial`) or `Truyện ngắn` (`format = short`). A short
Story requires its complete body in the creation form and atomically creates one published Chapter
inside the still-private Story Draft. Its manager edits that single body, hides add/remove Chapter
actions, and publishes the Story directly as `completed`. The format cannot be changed later.

After selecting either Story format, the author chooses `Văn bản` or `Audio`. Short Stories upload
their single audio while creating the Story. Serial Stories upload audio in each Chapter editor and
may mix audio and text Chapters. The editor preallocates IDs before signing, displays upload
progress, supports cancellation and preview, and never proxies media bytes through SvelteKit.
Replacing an existing Chapter asset first persists the new reference and then requests trusted
cleanup of the old public ID so the stored Chapter never points at a deliberately deleted asset.

Only the owner may load drafts, change metadata/status, or manage chapters. Chapters have immutable, monotonically assigned `chapterNumber`; removal is soft and numbers are not reused. A story may first become `ongoing` only when its metadata, cover, and at least one published chapter are valid.

The manager exposes draft/publish chapter actions and story states `draft`, `ongoing`, `hiatus`, and `completed`. Unsupported reverse transitions are rejected by the server.

Post and Story tag inputs share the same autocomplete. After the author starts typing, a debounced
server request returns similar tags found on a bounded sample of public Posts and Stories. Clicking
a suggestion adds it while preserving the editor's existing duplicate, length, and count limits.
