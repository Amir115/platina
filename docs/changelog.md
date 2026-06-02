# Changelog — פלטינה

> Auto-tracked by Claude Code at the end of every work session.
> Format: [date] | [session] | what was done | next step

---

## Session 001 — Initial Planning and Scoping

**Date:** April 2026
**Type:** Planning

### What was done

- Defined product vision and positioning
- Mapped competitors: Nesher, Mosechit 2020, Mano'a, Tifnit
- Identified 5 key market gaps
- Defined phased go-to-market strategy (small shops → chains → importers)
- Created full research document (`RESEARCH.md`)

### Files created

- `RESEARCH.md`
- `CONTEXT.md`

### Next step

- Interview with dad (first beta customer)
- Interviews with 5+ garage owners

---

## Session 015 — Monday.com Account Migration

**Date:** 2026-05-17
**Type:** Infrastructure
**PR:** https://github.com/Amir115/platina/pull/16
**Monday item:** https://amird-company.monday.com/boards/18413512127/pulses/12030600625

### What was done

- Migrated all Monday.com references from `amir-dana-personal.monday.com` board `5096146634` to `amird-company.monday.com` board `18413512127`
- Updated `.mcp.json` with new API token for the `amird-company` account
- Updated all 13 existing PR descriptions (#1–#13, #15) with new Monday item URLs
- Updated CI workflow (`monday-link-check.yml`) to validate new domain/board pattern

### Files created / modified

- `CLAUDE.md`
- `.mcp.json`
- `.github/workflows/monday-link-check.yml`
- `docs/changelog.md`
- `docs/features/vehicles.md`

### Bugs fixed

- None

### Next step

- Verify Monday.com MCP connection works with new token on board `18413512127`

---

## Session 002 — Infrastructure Setup + First MVP

**Date:** 2026-05-09
**Type:** Infrastructure + Feature
**PR:** https://github.com/Amir115/platina/pull/1
**Monday item:** https://amird-company.monday.com/boards/18413512127/pulses/12030703860

### What was done

#### Infrastructure

- Set up Next.js 16 + TypeScript + Tailwind project
- Configured PostgreSQL on Supabase (EU Central - Frankfurt)
- Installed Prisma 6 and connected to DB
- Ran first migration successfully (`20260508222050_init`)
- Created tables: `customers`, `vehicles`, `work_orders`

#### Feature: Work Order (כרטיסי עבודה) — MVP

- Defined full DB schema (Customer, Vehicle, WorkOrder)
- Built API routes:
  - `GET /api/work-orders` — list with filtering and search
  - `POST /api/work-orders` — create (find-or-create for customer/vehicle)
  - `GET /api/work-orders/:id` — single order
  - `PATCH /api/work-orders/:id` — update status/cost
- Built UI prototype: dashboard, statistics, filtering, search, create form
- Defined status transitions: PENDING → IN_PROGRESS → READY → DELIVERED

#### Documentation

- Created: `CLAUDE.md`, `CONTEXT.md`, `RESEARCH.md`
- Created: `types/index.ts`, `lib/prisma.ts`, `.env.example`, `.gitignore`

### Files created / modified

- `prisma/schema.prisma`
- `lib/prisma.ts`
- `types/index.ts`
- `app/api/work-orders/route.ts`
- `app/api/work-orders/[id]/route.ts`
- `CLAUDE.md`
- `CONTEXT.md`
- `RESEARCH.md`
- `.env.example`
- `.gitignore`

### Bugs resolved

- Prisma 7 does not support `url` in schema → downgraded to Prisma 6
- Supabase IPv4 — resolved with Session Pooler instead of Direct Connection

### Next step

- Configure Monday.com + MCP for Claude Code
- Configure Prettier + ESLint + GitHub Actions CI
- Write Claude Code skills for the project
- Build real UI (Next.js pages + components)
- Playwright + Storybook tests

---

## Session 003 — CI/CD Infrastructure + Code Quality

**Date:** 2026-05-09
**Type:** Infrastructure
**PR:** https://github.com/Amir115/platina/pull/2
**Monday item:** https://amird-company.monday.com/boards/18413512127/pulses/12030634227

### What was done

- Installed ESLint 9 with `eslint-config-next` + `eslint-config-prettier` — zero warnings policy (`--max-warnings 0`)
- Installed Prettier 3 — consistent formatting across the project
- Set up GitHub Actions CI (`.github/workflows/ci.yml`) with steps: type-check → lint → format:check → test → build
- Set up Label Check workflow (`.github/workflows/label-check.yml`) — every PR must have a label from: Bug / Documentation / Enhancement / Infrastructure
- Added npm scripts: `lint`, `format`, `format:check`, `type-check`

### Files created / modified

- `.github/workflows/ci.yml`
- `.github/workflows/label-check.yml`
- `package.json` (scripts + devDependencies)

### Next step

- Add Vitest + unit tests
- Improve test coverage

---

## Session 004 — Vitest + Unit Tests

**Date:** 2026-05-09
**Type:** Infrastructure
**PR:** https://github.com/Amir115/platina/pull/3
**Monday item:** https://amird-company.monday.com/boards/18413512127/pulses/12030634144

### What was done

- Installed Vitest 4 with jsdom + @testing-library/react
- Extracted Zod schemas from routes to a dedicated file: `lib/validators/work-orders.ts`
- Wrote 3 test files:
  - `__tests__/schemas.test.ts` — 14 tests for `CreateWorkOrderSchema` and `UpdateWorkOrderSchema`
  - `__tests__/StatusBadge.test.tsx` — render tests for the component
  - `__tests__/WorkOrderCard.test.tsx` — render tests for the component
- Added `vitest.config.ts` and `vitest.setup.ts`
- Added `npm test` step to the CI workflow

### Files created / modified

- `lib/validators/work-orders.ts` (new — extracted from route)
- `__tests__/schemas.test.ts`
- `__tests__/StatusBadge.test.tsx`
- `__tests__/WorkOrderCard.test.tsx`
- `vitest.config.ts`
- `vitest.setup.ts`
- `.github/workflows/ci.yml` (added test step)
- `package.json`

### Next step

- Configure Claude Code skills
- Improve UI

---

## Session 005 — Market Research Document

**Date:** 2026-05-09
**Type:** Documentation
**PR:** https://github.com/Amir115/platina/pull/4
**Monday item:** https://amird-company.monday.com/boards/18413512127/pulses/12030634307

### What was done

- `RESEARCH.md` officially committed to git (created in Session 001 outside git)

### Files created / modified

- `RESEARCH.md` (first commit)

### Next step

- Write Claude Code /ship skill
- Configure shared settings

---

## Session 006 — Claude Code Tooling: /ship Skill

**Date:** 2026-05-09
**Type:** Infrastructure
**PR:** https://github.com/Amir115/platina/pull/5
**Monday item:** https://amird-company.monday.com/boards/18413512127/pulses/12030703936

### What was done

- Created `/ship` skill (`.claude/commands/ship.md`) — Claude Code skill that creates a clean PR on top of main
  - Pre-flight: tsc + eslint + format:check + vitest
  - Analyzes diff → determines label + branch name + commit message
  - Rebase on main + push + automatic `gh pr create`
- Created `.claude/settings.json` — pre-approved permissions: npm scripts + `gh label list`
- Fixed `ship.md` format and added `format:check` to the pre-flight step

### Files created / modified

- `.claude/commands/ship.md`
- `.claude/settings.json`
- `CLAUDE.md` (updated)

### Next step

- Build actual features (work orders UI, customer module)

---

## Session 007 — Knowledge Base Creation

**Date:** 2026-05-09
**Type:** Documentation / Infrastructure
**PR:** https://github.com/Amir115/platina/pull/6
**Monday item:** https://amird-company.monday.com/boards/18413512127/pulses/12030634228

### What was done

- Created the `docs/` knowledge base from scratch with five files: changelog, architecture, decisions, bugs, feature docs
- Backfilled session history for Sessions 003–006 (PRs #2–5) into `docs/changelog.md`
- Extended `CLAUDE.md` with full knowledge-base management rules: what to read at session start, what to update at session end, and the required changelog entry format

### Files created / modified

- `CLAUDE.md`
- `docs/architecture.md` (new)
- `docs/bugs.md` (new)
- `docs/changelog.md` (new)
- `docs/decisions.md` (new)
- `docs/features/work-orders.md` (new)

### Bugs fixed

- None

### Next step

- Keep docs updated in every subsequent PR; enforce rule in CLAUDE.md

---

## Session 008 — Docs-in-Same-PR Rule

**Date:** 2026-05-09
**Type:** Documentation / Process
**PR:** https://github.com/Amir115/platina/pull/7
**Monday item:** https://amird-company.monday.com/boards/18413512127/pulses/12030634241

### What was done

- Added a rule to `CLAUDE.md` mandating that `docs/` updates ship in the same PR as the code change that triggered them — no standalone docs-only PRs allowed
- Clarifies that if docs are out of date, they get updated in the next feature/fix PR

### Files created / modified

- `CLAUDE.md`

### Bugs fixed

- None

### Next step

- Enforce rule going forward in all PRs

---

## Session 009 — Documentation Translation to English

**Date:** 2026-05-09
**Type:** Documentation
**PR:** https://github.com/Amir115/platina/pull/8
**Monday item:** https://amird-company.monday.com/boards/18413512127/pulses/12030634238

### What was done

- Translated `docs/architecture.md` from Hebrew to English to align with the project's documentation language policy (English for all docs, Hebrew only for end-user UI strings)
- Fixed Prettier table formatting in the architecture doc

### Files created / modified

- `docs/architecture.md`

### Bugs fixed

- None

### Next step

- Maintain English-only policy in all future docs

---

## Session 010 — Post-Merge Cleanup and Squash Merge Rules

**Date:** 2026-05-09
**Type:** Process / Infrastructure
**PR:** https://github.com/Amir115/platina/pull/9
**Monday item:** https://amird-company.monday.com/boards/18413512127/pulses/12030703937

### What was done

- Added two rules to `CLAUDE.md`:
  1. **Post-merge cleanup:** after any PR is merged, automatically `git checkout main` + `git pull origin main` — no prompting required
  2. **Squash merge strategy:** always use `gh pr merge <number> --squash --delete-branch`; never regular merge or rebase merge

### Files created / modified

- `CLAUDE.md`

### Bugs fixed

- None

### Next step

- Apply rules automatically in all future sessions without being asked

---

## Session 011 — Monday.com MCP Server Configuration

**Date:** 2026-05-09
**Type:** Infrastructure
**PR:** https://github.com/Amir115/platina/pull/10
**Monday item:** https://amird-company.monday.com/boards/18413512127/pulses/12030600614

### What was done

- Configured the Monday.com MCP server in `.claude/settings.json` (enabled under `mcpServers`)
- Added `.mcp.json` to `.gitignore` to prevent API keys from being committed
- Added `CLAUDE.md` rules for task management: fetch open tasks from board `18413512127` at session start, prioritize by active/in-progress status

### Files created / modified

- `.claude/settings.json`
- `.gitignore`
- `CLAUDE.md`

### Bugs fixed

- None

### Next step

- Use Monday.com MCP at the start of every session to fetch active tasks

---

## Session 012 — Incremental UI Component Strategy Rule

**Date:** 2026-05-10
**Type:** Process / Documentation
**PR:** https://github.com/Amir115/platina/pull/11
**Monday item:** https://amird-company.monday.com/boards/18413512127/pulses/12030634258

### What was done

- Added a UI component strategy section to `CLAUDE.md` defining how the design system is built incrementally as a byproduct of feature work — not as a separate phase
- Rules: all reusable UI goes under `components/ui/` with clean typed props; never write one-off inline styles in page files; use consistent naming (`Button`, `Input`, `Card`, `Badge`, `Modal`, `Spinner`, `EmptyState`, `PageHeader`); always reuse existing components before creating new ones; RTL-first; Tailwind only

### Files created / modified

- `CLAUDE.md`

### Bugs fixed

- None

### Next step

- Apply strategy when building the Customer module and all subsequent features

---

## Session 013 — Customer Module

**Date:** 2026-05-10
**Type:** Feature
**PR:** https://github.com/Amir115/platina/pull/12
**Monday item:** https://amird-company.monday.com/boards/18413512127/pulses/12030600626

### What was done

#### Schema

- Added `notes String?` to the `Customer` model
- Added `@unique` constraint on `Customer.phone`
- Created and applied migration `20260510000001_add_customer_notes_and_unique_phone`

#### API

- `GET /api/customers` — list with `?search=` (name or phone) and `?phone=` (exact match for uniqueness check)
- `POST /api/customers` — create with phone uniqueness guard
- `GET /api/customers/[id]` — single customer with linked work orders + vehicles
- `PATCH /api/customers/[id]` — update with phone conflict check

#### UI Components (`components/ui/`)

- `Button.tsx` — primary / secondary / ghost, sm / md sizes
- `Input.tsx` — with label, error, forwarded ref
- `Modal.tsx` — generic title + close, `dir="rtl"`
- `EmptyState.tsx` — title, description, optional action
- `Spinner.tsx` — animated SVG

#### Features

- `components/CustomerModal.tsx` — create/edit modal with phone uniqueness blur check
- `app/(dashboard)/layout.tsx` — shared nav bar with links to "כרטיסי עבודה" and "לקוחות"
- `app/(dashboard)/customers/page.tsx` — customer list: search, table, empty state, add button
- `app/(dashboard)/customers/[id]/page.tsx` — detail: info card, vehicles, work order history, edit + new order
- `app/(dashboard)/page.tsx` — updated to use shared layout nav and `EmptyState`/`Button` primitives
- `components/NewOrderModal.tsx` — added `prefillCustomer` prop + customer name search autocomplete with debounce

#### Validators

- `lib/validators/customers.ts` — `CreateCustomerSchema` and `UpdateCustomerSchema` with Israeli phone regex

#### Types

- `types/index.ts` — added `CustomerWithRelations`

### Files created

- `prisma/migrations/20260510000001_add_customer_notes_and_unique_phone/migration.sql`
- `lib/validators/customers.ts`
- `app/api/customers/route.ts`
- `app/api/customers/[id]/route.ts`
- `components/ui/Button.tsx`
- `components/ui/Input.tsx`
- `components/ui/Modal.tsx`
- `components/ui/EmptyState.tsx`
- `components/ui/Spinner.tsx`
- `components/CustomerModal.tsx`
- `app/(dashboard)/layout.tsx`
- `app/(dashboard)/customers/page.tsx`
- `app/(dashboard)/customers/[id]/page.tsx`
- `docs/features/customers.md`

### Files modified

- `prisma/schema.prisma`
- `types/index.ts`
- `app/(dashboard)/page.tsx`
- `components/NewOrderModal.tsx`

### Next step

- Add vehicle module (list, detail, link to work orders)
- Add phone-format display normalization helper
- Wire up "New work order" from customer detail with vehicle pre-fill

---

## Session 014 — Vehicle Module

**Date:** 2026-05-11
**Type:** Feature
**PR:** https://github.com/Amir115/platina/pull/15
**Monday item:** https://amird-company.monday.com/boards/18413512127/pulses/12030634295

### What was done

#### Schema

- Added `customerId String?` + `customer Customer? @relation(...)` to `Vehicle` (nullable for backward compat with existing rows)
- Added `notes String?` to `Vehicle`
- Added `vehicles Vehicle[]` to `Customer`
- Created and applied migration `20260510205743_add_vehicle_customer_relation`

#### API

- `GET /api/vehicles` — list with `?search=` (plate/make/model/customer) and `?customerId=` filter
- `POST /api/vehicles` — create vehicle linked to customer (plate uniqueness check)
- `GET /api/vehicles/[id]` — single vehicle with customer + work order history
- `PATCH /api/vehicles/[id]` — update mileage, color, notes, make, model, year, customerId
- `GET /api/vehicles/search?plate=` — fast license plate lookup for nav search

#### Work Order integration

- `POST /api/work-orders` updated: new vehicles are linked to their customer on creation; existing orphaned vehicles get `customerId` backfilled
- Added `mileage` field to `CreateWorkOrderSchema` and `CreateWorkOrderInput` — updates vehicle mileage on work order create
- `NewOrderModal` updated: `prefillVehicle` prop, customer vehicle chips after customer select, plate search autocomplete, mileage field

#### UI Components

- `components/NavSearch.tsx` — global license plate search in nav bar, debounced, dropdown with results + "רכב חדש" shortcut
- `components/VehicleModal.tsx` — create/edit modal with customer search dropdown, plate uniqueness check on blur

#### Features

- `app/(dashboard)/layout.tsx` — added "רכבים" nav link + NavSearch component
- `app/(dashboard)/vehicles/page.tsx` — list: search, table (plate/make/customer/mileage/order count), click to detail
- `app/(dashboard)/vehicles/[id]/page.tsx` — detail: large monospace plate, customer card, inline mileage editor, service history
- `app/(dashboard)/customers/[id]/page.tsx` — vehicle chips now link to `/vehicles/[id]`

#### Validators

- `lib/validators/vehicles.ts` — `CreateVehicleSchema` and `UpdateVehicleSchema` with Israeli plate regex

#### Types

- `types/index.ts` — added `VehicleWithRelations`, `VehicleWithCustomer`; added `mileage?: number` to `CreateWorkOrderInput`

### Files created

- `prisma/migrations/20260510205743_add_vehicle_customer_relation/migration.sql`
- `lib/validators/vehicles.ts`
- `app/api/vehicles/route.ts`
- `app/api/vehicles/[id]/route.ts`
- `app/api/vehicles/search/route.ts`
- `components/NavSearch.tsx`
- `components/VehicleModal.tsx`
- `app/(dashboard)/vehicles/page.tsx`
- `app/(dashboard)/vehicles/[id]/page.tsx`
- `__tests__/vehicles.test.ts`
- `docs/features/vehicles.md`

### Files modified

- `prisma/schema.prisma`
- `types/index.ts`
- `lib/validators/work-orders.ts`
- `app/api/work-orders/route.ts`
- `app/(dashboard)/layout.tsx`
- `app/(dashboard)/customers/[id]/page.tsx`
- `components/NewOrderModal.tsx`

### Bugs fixed

- Work order create was creating vehicles with no `customerId` — now backfills the link on every create

### Next step

- Add phone-format display normalization helper
- Work order detail page (`/work-orders/[id]`) — currently no dedicated page
- Mileage history per work order (currently only stores latest value on vehicle)

---

## Session: 2026-06-02 (2)

- Task: /review skill + MOT API service docs
- Monday item: https://amird-company.monday.com/boards/18413512127/pulses/12173846805
- PR: https://github.com/Amir115/platina/pull/20
- Summary: Created the /review skill with severity-grouped output format and a standalone REVIEW_STANDARDS.md covering global TypeScript/security/async/test rules and Platina-specific RTL, dark mode, Zod, Prisma, and auth rules. Added missing docs/services/mot-api.md for the MOT API service introduced in PR #19 (field mapping, caching, error handling, usage example).
- Files created or modified:
  - `.claude/skills/review/REVIEW_STANDARDS.md` — single source of truth for review rules
  - `.claude/skills/review/skill.md` — /review skill definition
  - `docs/services/mot-api.md` — MOT API service documentation
  - `docs/changelog.md` — this entry
- Bugs fixed: none
- Next step: Work order detail page (/work-orders/[id]); phone normalization helper

---

## Session: 2026-06-02

- Task: MOT API Integration — Vehicle Lookup by License Plate
- Monday item: https://amird-company.monday.com/boards/18413512127/pulses/12172611594
- PR: https://github.com/Amir115/platina/pull/19
- Summary: Integrated the Israeli Ministry of Transportation open API (data.gov.il) to look up vehicle data by license plate. Added a lib/mot-api service with Zod validation, 24h in-memory cache, and 5s timeout. Added GET /api/vehicles/lookup route. Updated VehicleModal with a "שלוף מרשם" button that autofills make/model/year/color and displays a read-only MOT info panel (fuel type, test expiry, VIN, engine).
- Files created or modified:
  - `lib/mot-api/types.ts` — MotVehicleRawSchema, MotApiResponseSchema, MotVehicleData type
  - `lib/mot-api/client.ts` — fetchVehicleByPlate with cache + timeout
  - `lib/mot-api/index.ts` — re-exports
  - `app/api/vehicles/lookup/route.ts` — GET /api/vehicles/lookup?plate=
  - `components/VehicleModal.tsx` — "שלוף מרשם" button, autofill, MOT info panel
  - `__tests__/mot-api-client.test.ts` — 7 tests (valid plate, unknown plate, cache hit, timeout, invalid shape, whitespace trim, nullable fields)
- Bugs fixed: none
- Next step: Work order detail page (/work-orders/[id]); phone normalization helper

## Session: 2026-05-17

- Task: Add authentication and garage multi-tenancy
- Monday item: https://amird-company.monday.com/boards/18413512127/pulses/12030634149
- PR: https://github.com/Amir115/platina/pull/17
- Summary: Integrated Clerk v7 auth with ClerkProvider, middleware, sign-in/sign-up pages, onboarding flow, and garage-scoped multi-tenancy. Added Garage model with row-level isolation via garageId on all existing models. All API routes now scope queries by garageId via getGarageContext(). Dashboard stub at /dashboard shows garage name and UserButton. Fixed post-merge issues: Clerk v7 redirect env var names, dashboard layout server-side onboarding redirect, and "פלטינה" nav title now links back to /dashboard.
- Files created or modified:
  - `middleware.ts` — Clerk middleware with public/protected route split
  - `app/layout.tsx` — wrapped with ClerkProvider
  - `app/(auth)/layout.tsx` — full-page centered layout for auth pages
  - `app/(auth)/sign-in/[[...sign-in]]/page.tsx`
  - `app/(auth)/sign-up/[[...sign-up]]/page.tsx`
  - `app/onboarding/page.tsx` — garage creation form
  - `app/api/onboarding/route.ts` — POST handler for garage creation
  - `app/dashboard/page.tsx` — dashboard stub with garage name and nav links
  - `lib/garage-context.ts` — getGarageContext() helper
  - `lib/validators/onboarding.ts` — Zod schema for onboarding
  - `prisma/schema.prisma` — Garage model + garageId/branchId on all models
  - `prisma/migrations/20260517094025_add_auth_and_garage/migration.sql`
  - `app/api/work-orders/route.ts` — scoped by garageId
  - `app/api/work-orders/[id]/route.ts` — scoped by garageId
  - `app/api/customers/route.ts` — scoped by garageId
  - `app/api/customers/[id]/route.ts` — scoped by garageId
  - `app/api/vehicles/route.ts` — scoped by garageId
  - `app/api/vehicles/[id]/route.ts` — scoped by garageId
  - `app/api/vehicles/search/route.ts` — scoped by garageId
  - `app/(dashboard)/layout.tsx` — UserButton in nav; async garage check redirects to onboarding; "פלטינה" title links to /dashboard
  - `__tests__/auth.test.ts` — unit tests for OnboardingSchema and getGarageContext
  - `.env.example` — documented all required env vars with Clerk v7 names
  - `docs/features/auth.md` — new feature doc
- Bugs fixed:
  - SSO sign-in was not redirecting to onboarding — fixed by server-side garage check in dashboard layout
  - Clerk v7 redirect env vars renamed from AFTER_SIGN_IN/UP_URL to SIGN_IN_FALLBACK_REDIRECT_URL / SIGN_UP_FORCE_REDIRECT_URL
- Next step: Add work order detail page (/work-orders/[id]); add phone normalization helper
