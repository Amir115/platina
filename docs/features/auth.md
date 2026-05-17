# Feature: Authentication & Garage Multi-tenancy

## Status: Complete (2026-05-17)

## What was built

- **Clerk auth** — ClerkProvider in root layout, middleware protecting all non-public routes
- **Sign-in / Sign-up pages** — `/sign-in`, `/sign-up` using Clerk prebuilt components, RTL layout
- **Onboarding flow** — `/onboarding` form creates a Garage record after first sign-up
- **Garage model** — new Prisma model linked to `clerkUserId`
- **Row-level multi-tenancy** — `garageId` column on Customer, Vehicle, WorkOrder; all queries scoped via `getGarageContext()`
- **`branchId` column** — nullable on all models, reserved for future chain/multi-branch support
- **Dashboard stub** — `/dashboard` landing page with garage name and UserButton

## Architecture decisions

- **Clerk** chosen over NextAuth for managed auth, Google SSO out of the box, no session DB needed
- **One Clerk user = one Garage** for MVP; no org/role system yet
- **Row-level isolation** via garageId (not schema-per-tenant) — simpler for MVP, sufficient for small garage count
- **getGarageContext()** — single helper used in every API route to get `{ userId, garageId, garage }`

## Routes

| Route             | Type                        | Description                  |
| ----------------- | --------------------------- | ---------------------------- |
| `/sign-in`        | Public                      | Clerk SignIn component       |
| `/sign-up`        | Public                      | Clerk SignUp component       |
| `/onboarding`     | Public (but must be authed) | Create garage after signup   |
| `/dashboard`      | Protected                   | Landing page with nav links  |
| `/api/onboarding` | Protected                   | POST — creates Garage record |

## Environment variables required

```
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/onboarding
```

## What's NOT done yet

- Roles (admin vs. mechanic) — deferred to future PR
- Multi-branch support — branchId column added but not used
- Clerk Organizations — may adopt later for B2B chains
