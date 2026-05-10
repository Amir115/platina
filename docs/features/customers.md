# Feature: Customer Module

## Status

**Implemented** — Session 007 (May 2026)

## Overview

Full CRUD for customers (לקוחות) including list page, detail page, create/edit modal, and integration with the work order create flow.

## Data Model

```prisma
model Customer {
  id         String      @id @default(cuid())
  name       String
  phone      String      @unique   // Israeli format: 05X-XXXXXXX
  email      String?
  notes      String?
  createdAt  DateTime    @default(now())
  updatedAt  DateTime    @updatedAt
  workOrders WorkOrder[]
}
```

## API Routes

| Method | Route                 | Description                                                                                                                  |
| ------ | --------------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| GET    | `/api/customers`      | List all. `?search=` filters by name or phone (insensitive). `?phone=` does exact match (used for uniqueness check on blur). |
| POST   | `/api/customers`      | Create. Returns 409 if phone already exists.                                                                                 |
| GET    | `/api/customers/[id]` | Single customer with `workOrders` (+ nested `vehicle`). Returns 404 if missing.                                              |
| PATCH  | `/api/customers/[id]` | Partial update. Checks phone conflict against other customers.                                                               |

## UI

- `/customers` — searchable table of customers, "Add customer" button
- `/customers/[id]` — info card, linked vehicles, work order history table, edit/new order buttons
- `CustomerModal` — shared create/edit modal with phone uniqueness check on blur

## Shared UI Primitives Created

All in `components/ui/`:

- `Button` — variant (primary/secondary/ghost), size (sm/md)
- `Input` — label, error, forwarded ref
- `Modal` — title + close, RTL
- `EmptyState` — title, description, optional action
- `Spinner` — animated SVG

## Work Order Integration

- `NewOrderModal` accepts `prefillCustomer?: { name, phone }` — used from customer detail page to pre-fill the customer fields
- Typing in "Customer name" field triggers debounced search (`/api/customers?search=...`) with autocomplete dropdown

## Validation

Israeli phone regex: `/^05\d[-]?\d{7}$/`

Accepts both `0501234567` and `050-1234567`.

## Known Limitations / Next Steps

- Vehicles are derived from work orders — no direct vehicle management yet
- Phone display is stored as-is (no normalization); consider normalizing on save
- "New work order" from customer detail does not pre-fill vehicle — to be added with vehicle module
