# Bugs & Known Issues — פלטינה

> Auto-tracked by Claude Code.
> Format: [date] | [status] | description | resolution

---

## Resolved

### BUG-001: Prisma 7 fails to parse prisma.config.ts

**Date:** May 2026 | **Status:** ✅ Resolved

**Description:** Prisma 7 introduced a breaking change — `url` in the datasource block is no longer supported. `prisma.config.ts` is required, but there are parsing issues with ESM + TypeScript.

**Resolution:** Downgrade to Prisma 6, which supports `url` in the schema as usual.

---

### BUG-002: Supabase Direct Connection fails (IPv4)

**Date:** May 2026 | **Status:** ✅ Resolved

**Description:** `P1001: Can't reach database server` with Direct Connection URL.

**Cause:** Supabase Direct Connection is IPv6-only on the free tier. Mac network is IPv4.

**Resolution:** Use Session Pooler URL (`*.pooler.supabase.com:5432`) instead of Direct (`db.*.supabase.co:5432`).

---

### BUG-003: Prisma does not read from .env.local

**Date:** May 2026 | **Status:** ✅ Resolved

**Description:** `Environment variable not found: DATABASE_URL` despite `.env.local` being configured.

**Cause:** Prisma CLI only reads from `.env`, not `.env.local` (which is a Next.js convention).

**Resolution:** `cp .env.local .env` — keep both files in sync.

---

## Open

_None currently_
