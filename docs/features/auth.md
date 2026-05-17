# Feature: Authentication & Garage Multi-tenancy

## Status: Complete (2026-05-17)

## What was built

- **Clerk auth** — ClerkProvider in root layout, middleware protecting all non-public routes
- **Sign-in / Sign-up pages** — `/sign-in`, `/sign-up` using Clerk prebuilt components, RTL centered layout
- **Onboarding flow** — `/onboarding` form creates a Garage record after first sign-up; always forced via `SIGN_UP_FORCE_REDIRECT_URL`
- **Garage model** — new Prisma model linked to `clerkUserId` (one user = one garage for MVP)
- **Row-level multi-tenancy** — `garageId` column on Customer, Vehicle, WorkOrder; all queries scoped via `getGarageContext()`
- **`branchId` column** — nullable on all models, reserved for future chain/multi-branch support
- **Dashboard stub** — `/dashboard` landing page with garage name, nav links, and UserButton
- **Dashboard layout guard** — server-side `getGarageContext()` check in `(dashboard)` layout; redirects to `/onboarding` if no garage exists regardless of sign-in redirect URL
- **Nav title link** — "פלטינה" logo in the top bar links back to `/dashboard` from any entity page

## Architecture decisions

- **Clerk** chosen over NextAuth — managed auth, Google SSO out of the box, no session DB needed
- **One Clerk user = one Garage** for MVP; no org/role system yet
- **Row-level isolation** via `garageId` (not schema-per-tenant) — simpler for MVP, sufficient for small garage count
- **`getGarageContext()`** — single helper used in every API route to get `{ userId, garageId, garage }`; throws `Unauthorized` or `Garage not found` which callers handle
- **Dashboard layout as the onboarding gate** — avoids scattering redirect logic across individual pages

## Routes

| Route             | Type                        | Description                       |
| ----------------- | --------------------------- | --------------------------------- |
| `/sign-in`        | Public                      | Clerk SignIn component             |
| `/sign-up`        | Public                      | Clerk SignUp component             |
| `/onboarding`     | Public (authed, no garage)  | Create garage after signup        |
| `/dashboard`      | Protected                   | Landing page with nav links        |
| `/api/onboarding` | Protected                   | POST — creates Garage record       |

## Environment variables required

```
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL=/dashboard
NEXT_PUBLIC_CLERK_SIGN_UP_FORCE_REDIRECT_URL=/onboarding
```

> Note: `AFTER_SIGN_IN/UP_URL` is the Clerk v4/v5 naming. Clerk v7 uses `FALLBACK_REDIRECT_URL` (existing users) and `FORCE_REDIRECT_URL` (always).

## What's NOT done yet

- Roles (admin vs. mechanic) — deferred to future PR
- Multi-branch support — `branchId` column added but not used
- Clerk Organizations — may adopt later for B2B chains
