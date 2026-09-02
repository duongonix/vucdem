# Firestore Rules

The current MVP uses a server-mediated data architecture. Browser code authenticates with
Firebase Authentication and sends an ID token to narrow SvelteKit APIs. Those APIs validate
the persisted User role/status and access Firestore through Firebase Admin.

Direct browser Firestore reads and writes are denied by `firestore.rules`. The browser SDK
may allocate random document IDs locally; this does not access Firestore. If a future feature
introduces direct client reads, its exact collection, fields, ownership, status visibility,
counter protection, and tests must be specified before relaxing the default deny rule.
