# Moderation

`/moderation` is restricted to active Users whose persisted application role is moderator
or admin. Trusted server endpoints verify the Firebase token and re-read the User document;
frontend role state is never sufficient authorization.

Moderators can filter the private report queue, mark reports reviewing/resolved/dismissed,
hide Posts/Stories/Comments, remove Comments, and restore moderated content. A hide/remove
operation records the original status once so restoration preserves Story lifecycle state.
Normal Users cannot invoke these mutations.
