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

The admin follows the Gviano design board (04 · Restaurant admin). Its colour tokens live in
`src/styles/admin-theme.css`, scoped to `.admin-theme`, with a light/dark/auto switch in the account menu.

| Route | Page |
| --- | --- |
| `/admin-auth` | Sign in / sign up / password reset |
| `/dashboard` | Today’s covers, seats left, needs-attention list, arrivals, 7-day stats (or a setup checklist) |
| `/stores` | Store cards and "New store" (`?new=1`) |
| `/stores/:id/details` | Hours, contact, seating, policy; edit store, hours and tables |
| `/stores/:id/menu` | Menu groups and items with allergens, sold-out toggle, drag/arrow-key reordering |
| `/stores/:id/availability` | Day timeline per table (`?date=YYYY-MM-DD`), week view (`?view=week`), whole-day closures |
| `/payments` | Placeholder |

All API calls go through `src/utility/http-client.ts`, which attaches the signed-in user's Firebase ID token.
