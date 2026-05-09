# Feature: Work Orders (כרטיסי עבודה)

> Status: ✅ MVP built | ✅ Initial UI built | 🔄 UI improvements pending

---

## Description

The core feature of the Platina MVP. A work order links a customer + vehicle + work performed + cost.

---

## What's Built

### Backend ✅

- `GET /api/work-orders` — list with filtering (`?status=`) and search (`?search=`)
- `POST /api/work-orders` — create new order (find-or-create for customer/vehicle)
- `GET /api/work-orders/:id` — single order
- `PATCH /api/work-orders/:id` — update status / final cost / notes

### DB ✅

- Tables `customers`, `vehicles`, `work_orders` exist in Supabase
- Migration: `20260508222050_init`

### UI ✅

- `app/(dashboard)/page.tsx` — real Next.js dashboard with client-side fetching, search, status filtering, and refresh after creating an order
- `components/WorkOrderCard.tsx` — work order display card with status transition button
- `components/NewOrderModal.tsx` — new order creation modal with full form
- `components/StatusBadge.tsx` — badge with color by status

### Validators ✅

- `lib/validators/work-orders.ts` — Zod schemas: `CreateWorkOrderSchema`, `UpdateWorkOrderSchema`
- License plate auto-uppercased
- Vehicle year: 1980 to current year+1

### Tests ✅

- `__tests__/schemas.test.ts` — 14 unit tests for all validation cases
- `__tests__/StatusBadge.test.tsx` — render tests for all 4 statuses
- `__tests__/WorkOrderCard.test.tsx` — render tests for the component

---

## Status Flow

```
PENDING (ממתין)
    → IN_PROGRESS (בטיפול)
        → READY (מוכן)
            → DELIVERED (נמסר)
```

One-directional transitions only.

---

## What's Missing

- [ ] Real Next.js pages (not prototype)
- [ ] Work order detail page (`/work-orders/:id`)
- [ ] Edit existing order
- [ ] Print work order
- [ ] Search by date

---

## Out of Scope (MVP)

- Payments / invoices
- WhatsApp reminder to customer
- Change history for an order
