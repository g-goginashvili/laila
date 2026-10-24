# laila

Gviano web app: public landing page and the restaurant admin panel (React 19, Vite, React Router,
TanStack Query, Zustand, Formik/Yup, Firebase Auth).

## Run locally

```bash
npm install
cp .env.example .env.local   # optional: point at a local API / auth emulator
npm run dev                  # http://localhost:5173
```

Against a fully local stack: start the auth emulator (`npx firebase emulators:start --only auth`), run
`laila-core` with `FIREBASE_AUTH_EMULATOR_HOST` set, and set both variables in `.env.local`.

## Scripts

- `npm run dev` / `npm run build` / `npm run preview`
- `npm run lint`

## Admin panel routes

| Route | Page |
| --- | --- |
| `/admin-auth` | Sign in / sign up / password reset |
| `/dashboard` | Organisation overview |
| `/stores` | Store list and "Add store" |
| `/stores/:id/details` | Edit or delete a store |
| `/stores/:id/menu`, `/stores/:id/availability`, `/payments` | Placeholders (not built yet) |

All API calls go through `src/utility/http-client.ts`, which attaches the signed-in user's Firebase ID token.
