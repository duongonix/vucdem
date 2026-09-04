# View counting API

`POST /api/views` accepts a Post, Story, or Story-scoped Chapter target. It validates public
visibility, suppresses owner views, performs trusted atomic increments, and returns the current
counter. HTTP-only same-site cookies deduplicate each target for one hour. Chapter requests may
atomically increment both the Chapter and parent Story when each respective deduplication cookie is
absent.

Feed impressions never call this endpoint. The Browser cannot submit an arbitrary counter value.
