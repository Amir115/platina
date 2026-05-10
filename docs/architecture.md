# Architecture — פלטינה

> This document is tracked and auto-updated by Claude Code.

---

## Stack

| Layer       | Technology     | Version | Reason                                         |
| ----------- | -------------- | ------- | ---------------------------------------------- |
| Framework   | Next.js        | 16.2.6  | Fullstack, App Router, SaaS-ready              |
| Runtime     | React          | 19.2.4  | —                                              |
| Language    | TypeScript     | 5       | Type safety, DX                                |
| Database    | PostgreSQL     | —       | Relational, suitable for vehicle/customer data |
| ORM         | Prisma         | 6.19.3  | Type-safe, migrations, DX                      |
| Validation  | Zod            | 4.4.3   | Type inference, works well with Next.js        |
| Styling     | Tailwind CSS   | 4       | Utility-first, fast for prototyping            |
| Linting     | ESLint         | 9       | Zero-warnings policy                           |
| Formatting  | Prettier       | 3       | Code consistency                               |
| Testing     | Vitest         | 4       | jsdom + @testing-library/react                 |
| CI/CD       | GitHub Actions | —       | type-check + lint + format + test + build      |
| Hosting DB  | Supabase       | —       | Free tier, PostgreSQL, zero-ops                |
| Hosting App | Vercel         | —       | (future)                                       |
| Auth        | NextAuth.js    | —       | (future)                                       |

---

## Database Schema

### customers

| Column    | Type     | Notes                      |
| --------- | -------- | -------------------------- |
| id        | cuid     | PK                         |
| name      | String   | Full name                  |
| phone     | String   | De-facto unique identifier |
| email     | String?  | Optional                   |
| createdAt | DateTime | auto                       |
| updatedAt | DateTime | auto                       |

### vehicles

| Column       | Type    | Notes                                         |
| ------------ | ------- | --------------------------------------------- |
| id           | cuid    | PK                                            |
| licensePlate | String  | unique                                        |
| make         | String  | Manufacturer                                  |
| model        | String  | Model                                         |
| year         | Int     | Manufacturing year                            |
| color        | String? | Optional                                      |
| mileage      | Int?    | Latest recorded odometer reading              |
| notes        | String? | Optional                                      |
| customerId   | FK?     | → customers (nullable for historical records) |

### work_orders

| Column        | Type      | Notes                                     |
| ------------- | --------- | ----------------------------------------- |
| id            | cuid      | PK                                        |
| orderNumber   | Int       | auto-increment, displayed to user         |
| status        | Enum      | PENDING / IN_PROGRESS / READY / DELIVERED |
| description   | String    | Fault description                         |
| notes         | String?   | Internal notes                            |
| estimatedCost | Decimal?  | Estimate                                  |
| finalCost     | Decimal?  | Final                                     |
| completedAt   | DateTime? | Set when status → DELIVERED               |
| customerId    | FK        | → customers                               |
| vehicleId     | FK        | → vehicles                                |

---

## API Structure

```
/api/
├── work-orders/
│   ├── GET    — list (supports ?status= and ?search=)
│   ├── POST   — create (links vehicle to customer, updates mileage if provided)
│   └── [id]/
│       ├── GET   — single
│       └── PATCH — update status / cost / notes
├── customers/
│   ├── GET    — list (?search= or ?phone= for uniqueness check)
│   ├── POST   — create
│   └── [id]/
│       ├── GET   — single with work orders + vehicles
│       └── PATCH — update
└── vehicles/
    ├── GET    — list (?search= or ?customerId=)
    ├── POST   — create linked to customer
    ├── search/
    │   └── GET — fast plate lookup (?plate=, max 8 results)
    └── [id]/
        ├── GET   — single with customer + work order history
        └── PATCH — update mileage / color / notes / make / model / year
```

### Patterns

- **Find-or-create** for customer by phone, for vehicle by licensePlate
- **Zod validation** on all inputs
- **Status transitions** one-directional: PENDING → IN_PROGRESS → READY → DELIVERED
- **Customer backfill** — work order create links vehicle to customer; backfills orphaned vehicles

---

## Validators

- `lib/validators/work-orders.ts` — `CreateWorkOrderSchema` (includes optional `mileage`), `UpdateWorkOrderSchema`
- `lib/validators/customers.ts` — `CreateCustomerSchema`, `UpdateCustomerSchema` (Israeli phone regex)
- `lib/validators/vehicles.ts` — `CreateVehicleSchema`, `UpdateVehicleSchema` (Israeli plate regex: `/^\d{2,3}-\d{2,3}-\d{2,3}$/`)

---

## Test Coverage

```
__tests__/
├── schemas.test.ts         # 14 unit tests — CreateWorkOrderSchema + UpdateWorkOrderSchema
├── vehicles.test.ts        # 15 unit tests — CreateVehicleSchema + UpdateVehicleSchema
├── StatusBadge.test.tsx    # React render tests for StatusBadge component
└── WorkOrderCard.test.tsx  # React render tests for WorkOrderCard component
```

Config: `vitest.config.ts` (jsdom environment, `@` alias to root), `vitest.setup.ts` (@testing-library/jest-dom matchers)

---

## CI/CD

`.github/workflows/ci.yml` — runs on push + PR to `main`:

1. `npx prisma generate`
2. `npm run type-check` (tsc --noEmit)
3. `npm run lint` (eslint --max-warnings 0)
4. `npm run format:check` (prettier --check)
5. `npm test` (vitest run)
6. `npm run build`

`.github/workflows/label-check.yml` — every PR must carry one of: `Bug`, `Documentation`, `Enhancement`, `Infrastructure`

---

## Claude Code Tooling

`.claude/settings.json` — pre-approved commands (no permission prompt):

- `npm run type-check`, `npm run lint`, `npm run format:check`, `npm test`
- `gh label list`

`.claude/commands/ship.md` — `/ship` skill: pre-flight CI → rebase on main → commit → push → `gh pr create` with label

---

## Orphaned Files

`mnt/user-data/outputs/platina-repo/` — leftover from Claude Code artifact generation. Contains only `.DS_Store` files and one duplicate `[id]/route.ts`. Safe to delete; tracked in `.gitignore` or can be removed manually.

---

## Decisions Log

See `docs/decisions.md`
