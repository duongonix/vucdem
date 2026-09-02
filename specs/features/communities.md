# Communities

## Contract

Active communities are public at `/c/{slug}`. Creation is authenticated and atomically reserves a normalized slug. The creator becomes owner/member. Membership uses `communities/{id}/members/{uid}` and is independent from user following.

Only active members may publish a post targeted to a community. Community counters are trusted server transaction fields. Icons and banners use Cloudinary paths under `vucdem/communities/{id}`; Firebase Storage is forbidden. The MVP page displays identity, description, member/post counts, join state, and cursor-compatible community posts.
