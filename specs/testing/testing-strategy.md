# Testing Strategy

Unit tests cover deterministic validation, normalization, serialization helpers, and security
boundaries that do not require live services. Playwright smoke tests cover public rendering,
responsive overflow, accessible navigation, dialogs, and protected-route redirects.

Firebase Emulator integration tests for transactions and deployed Security Rules remain the
required next layer before production deployment. Live Firebase/Cloudinary tests must use a
dedicated non-production project and must never embed credentials in fixtures.
