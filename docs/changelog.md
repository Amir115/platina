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

## Session 002 — Infrastructure Setup + First MVP

**Date:** May 2026
**Type:** Infrastructure + Feature

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

**Date:** May 2026
**Type:** Infrastructure
**PR:** #2 (`infra: add Prettier, ESLint hardening, and GitHub Actions CI`)

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

**Date:** May 2026
**Type:** Infrastructure
**PR:** #3 (`infra: add Vitest unit tests and CI test step`)

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

**Date:** May 2026
**Type:** Documentation
**PR:** #4 (`docs: add product research document`)

### What was done

- `RESEARCH.md` officially committed to git (created in Session 001 outside git)

### Files created / modified

- `RESEARCH.md` (first commit)

### Next step

- Write Claude Code /ship skill
- Configure shared settings

---

## Session 006 — Claude Code Tooling: /ship Skill

**Date:** May 2026
**Type:** Infrastructure
**Branch:** `infra/ship-skill` (not yet merged)

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

- Merge `infra/ship-skill` to main
- Build actual feature (work orders — UI improvement)
