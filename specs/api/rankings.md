# Rankings API

`GET /api/ranks` is public and returns `{ short, serial }`. Each property contains at most ten
serialized, publicly readable Stories ranked by `viewCount DESC`, then document identity. Draft,
hidden, and removed Stories never appear. The endpoint uses bounded reads and never downloads the
entire collection to the Browser.
