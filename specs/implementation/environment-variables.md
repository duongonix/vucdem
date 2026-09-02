# Environment Variables

Environment values are split by SvelteKit's public/private boundary. `.env.example` is the canonical placeholder template and must never contain real credentials.

## Browser-safe

```env
PUBLIC_FIREBASE_API_KEY=
PUBLIC_FIREBASE_AUTH_DOMAIN=
PUBLIC_FIREBASE_PROJECT_ID=
PUBLIC_FIREBASE_APP_ID=
PUBLIC_FIREBASE_STORAGE_BUCKET=
PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
PUBLIC_FIREBASE_MEASUREMENT_ID=
PUBLIC_CLOUDINARY_CLOUD_NAME=
```

Firebase's public web configuration identifies the Firebase project; it is not an authorization secret. Firestore Security Rules and Firebase Authentication remain the security boundary.

The storage bucket field is part of Firebase's browser configuration only. VỰC ĐÊM does not initialize or use Firebase Storage; all application media remains in Cloudinary.

Optional local emulator configuration:

```env
PUBLIC_FIREBASE_USE_EMULATORS=false
PUBLIC_FIREBASE_AUTH_EMULATOR_HOST=127.0.0.1:9099
PUBLIC_FIRESTORE_EMULATOR_HOST=127.0.0.1:8080
```

Emulator connections are allowed only in development builds and require the explicit boolean flag. Production code ignores these addresses.

## Server-only

```env
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
FIREBASE_ADMIN_PROJECT_ID=
FIREBASE_ADMIN_CLIENT_EMAIL=
FIREBASE_ADMIN_PRIVATE_KEY=
```

Server-only values may only be imported by trusted `.server.ts` modules, `+server.ts` endpoints, or other SvelteKit server code. `CLOUDINARY_API_SECRET` must never be returned to a browser or renamed with a `PUBLIC_` prefix.

Firebase Admin should use Application Default Credentials on supported hosts. The three explicit service-account variables are an alternative and must be supplied together; the private key may contain escaped `\\n` sequences. They must never use a `PUBLIC_` prefix.

## Validation

Each provider integration validates its required values at the boundary where the integration is initialized. Firebase Web, Firebase Admin, and Cloudinary initialization are lazy: SSR and credential-free builds remain valid, while code requesting an unconfigured provider receives a controlled configuration error.

## Production hosting

Vercel is the canonical SvelteKit hosting target. The project uses `adapter-auto`, which selects the supported Vercel adapter in Vercel's build environment while keeping local Windows builds independent of symlink privileges. Configure the variables above for the Production environment in Vercel rather than copying `.env`. Firebase Authentication must enable Email/Password and Google and authorize the final Vercel or custom domain.
