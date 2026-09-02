# Production deployment

VỰC ĐÊM deploys the SvelteKit application to Vercel and deploys Firestore Rules and indexes to the `vucdem` Firebase project.

## Required configuration

Configure every variable documented in `specs/implementation/environment-variables.md` in the Vercel Production environment. Keep Firebase Admin and Cloudinary credentials server-only. The local `.env` file is never deployed or committed.

In Firebase Authentication, enable Email/Password and Google providers and add the final Vercel/custom domain to Authorized domains. Cloudinary must retain the signed-upload constraints documented in the security specifications.

## Deploy

```bash
pnpm build
vercel deploy --prod
firebase deploy --only firestore:rules,firestore:indexes --project vucdem
```

Run the production smoke checklist in `specs/roadmap/phases/43.md` after every production deployment.
