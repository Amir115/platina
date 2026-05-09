# CLAUDE.md — פלטינה

This file provides context and instructions for Claude Code when working on this project.

## Project Overview

**Platina (פלטינה)** is a cloud-native SaaS for garage and car dealership management in Israel.
Target market: small-to-medium independent garages. Main pain points in the current market:

- All existing solutions (Nesher, Mosechit) are desktop-only, old UX, modular pricing
- No cloud-native solution exists
- No WhatsApp integration (everyone uses WhatsApp in Israel, not SMS)
- No mobile-friendly access

**We are currently building the MVP — Work Orders (כרטיסי עבודה) only.**

---

## Tech Stack

| Layer      | Technology                        |
| ---------- | --------------------------------- |
| Framework  | Next.js 14 (App Router)           |
| Language   | TypeScript                        |
| Database   | PostgreSQL                        |
| ORM        | Prisma                            |
| Validation | Zod                               |
| Styling    | Tailwind CSS                      |
| Auth       | NextAuth.js (not yet implemented) |

---

## First Run Instructions

On first run, before doing anything else:

1. Read this file (CLAUDE.md) and CONTEXT.md in full
2. Run `ls -la` and verify the project structure matches the structure defined below
3. Create any missing files or directories
4. Run `npm install` if `node_modules` is missing
5. Confirm `.env` or `.env.local` exists with `DATABASE_URL` set
6. Run `npx prisma generate` to ensure Prisma client is up to date
7. Report what was missing and what was created before proceeding

---

## Project Structure

```
platina/
├── app/
│   ├── api/
│   │   └── work-orders/
│   │       ├── route.ts          # GET (list) + POST (create)
│   │       └── [id]/route.ts     # GET (single) + PATCH (update)
│   ├── (dashboard)/
│   │   └── page.tsx              # Main dashboard
│   └── layout.tsx
├── prisma/
│   └── schema.prisma
├── lib/
│   └── prisma.ts                 # Prisma singleton
├── components/
│   ├── WorkOrderCard.tsx
│   ├── NewOrderModal.tsx
│   └── StatusBadge.tsx
└── types/
    └── index.ts
```

---

## Database Models

### WorkOrder

- `id` — cuid
- `orderNumber` — auto-increment (displayed as #1001, #1002...)
- `status` — enum: `PENDING | IN_PROGRESS | READY | DELIVERED`
- `description` — תיאור התקלה / העבודה
- `notes` — הערות פנימיות (optional)
- `estimatedCost` — Decimal (optional)
- `finalCost` — Decimal (optional)
- `completedAt` — DateTime (set when status → DELIVERED)
- Relations: `customer` (Customer), `vehicle` (Vehicle)

### Customer

- `id`, `name`, `phone`, `email?`
- One customer can have many WorkOrders

### Vehicle

- `id`, `licensePlate` (unique), `make`, `model`, `year`, `color?`, `mileage?`
- One vehicle can have many WorkOrders

---

## API Conventions

- All routes under `/api/`
- Response: JSON
- Validation: Zod on all inputs
- Errors: `{ error: { fieldErrors: {...} } }` (Zod flatten format)
- Find-or-create pattern for Customer and Vehicle on WorkOrder creation

### Endpoints (implemented)

```
GET  /api/work-orders           → list, supports ?status= and ?search=
POST /api/work-orders           → create (also creates customer/vehicle if not exists)
GET  /api/work-orders/:id       → single work order
PATCH /api/work-orders/:id      → update status, notes, finalCost
```

---

## Coding Conventions

- **TypeScript strict mode** — no `any`
- **RTL UI** — all UI is in Hebrew, `direction: rtl`
- **Prisma client** — always import from `@/lib/prisma`, never instantiate directly
- **Zod schemas** — define in route file or in `lib/validators/`
- **No raw SQL** — use Prisma query builder only
- **Status transitions**: PENDING → IN_PROGRESS → READY → DELIVERED (one direction only)

---

## What is NOT in MVP (do not build yet)

- Authentication / multi-tenant
- Invoicing / payments
- WhatsApp notifications
- Parts/inventory management
- Reports and analytics
- Multi-branch support

---

## Hebrew Status Labels

```ts
const STATUS_LABELS = {
  PENDING: 'ממתין',
  IN_PROGRESS: 'בטיפול',
  READY: 'מוכן',
  DELIVERED: 'נמסר',
};
```
