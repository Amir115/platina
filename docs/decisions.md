# Decisions — פלטינה

> ADR (Architecture Decision Records) — why we chose X over Y.
> Auto-tracked by Claude Code whenever a significant decision is made.

---

## ADR-001: Next.js 14+ instead of separate React + Express

**Date:** April 2026
**Status:** ✅ Approved

**Decision:** Next.js App Router as a fullstack framework.

**Reasons:**

- API routes + UI in the same repo — less overhead
- SaaS-ready from day one
- Simple Vercel deployment
- TypeScript end-to-end

---

## ADR-002: Prisma 6 instead of Prisma 7

**Date:** May 2026
**Status:** ✅ Approved

**Decision:** Downgrade from Prisma 7 to Prisma 6.

**Reasons:**

- Prisma 7 is still early access — `url` in schema is not supported
- `prisma.config.ts` requires tsx and has parsing issues with ESM
- Prisma 6 is stable, works with `url` in schema as usual
- Can upgrade later once Prisma 7 stabilizes

**Alternatives considered:** Drizzle ORM — rejected because Prisma is more familiar and has better DX for the MVP stage.

---

## ADR-003: Supabase instead of Railway / Neon / Local

**Date:** May 2026
**Status:** ✅ Approved

**Decision:** Supabase as managed PostgreSQL.

**Reasons:**

- Generous free tier (500MB, 2 projects)
- Full PostgreSQL — not a variant
- Convenient dashboard for viewing data during MVP stage
- Session Pooler supports IPv4 for free

**Note:** Must use Session Pooler URL (not Direct) due to IPv4.

---

## ADR-004: Find-or-create for customer and vehicle

**Date:** May 2026
**Status:** ✅ Approved

**Decision:** When creating a Work Order — customer is identified by phone, vehicle by licensePlate. If not found — created automatically.

**Reasons:**

- Simpler UX — one form for everything
- A small garage doesn't want "first create customer, then create vehicle, then open a work order"
- Phone as unique identifier — sufficient for MVP stage

---

## ADR-005: Vitest instead of Jest

**Date:** May 2026
**Status:** ✅ Approved

**Decision:** Vitest as test runner.

**Reasons:**

- Faster (ESM-native, HMR on tests)
- Minimal config — works out-of-the-box with Vite + TypeScript
- Same API as Jest — no learning curve
- Maintained in the same ecosystem as Next.js + Vite

**Alternatives considered:** Jest — rejected due to complex config with ESM + TypeScript in Next.js 14+.

---

## ADR-006: ESLint Zero-Warnings Policy

**Date:** May 2026
**Status:** ✅ Approved

**Decision:** `eslint --max-warnings 0` — any warning fails CI.

**Reasons:**

- Accumulated warnings become noise that hides real bugs
- CI enforcement ensures the rule is consistent and not just aspirational
- `eslint-config-prettier` prevents conflicts between ESLint and Prettier

---

## ADR-007: Validators in a separate file

**Date:** May 2026
**Status:** ✅ Approved

**Decision:** Zod schemas moved from route files to `lib/validators/work-orders.ts`.

**Reasons:**

- Shared schema across multiple route files without duplication
- Schemas can be tested independently from HTTP logic (unit tests in `__tests__/schemas.test.ts`)
- Aligns with the `lib/` convention as a place for shared logic
