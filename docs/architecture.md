# Architecture — פלטינה

> מסמך זה מתועד ומעודכן אוטומטית על ידי Claude Code.

---

## Stack

| Layer       | Technology     | Version | סיבה                                      |
| ----------- | -------------- | ------- | ----------------------------------------- |
| Framework   | Next.js        | 16.2.6  | Fullstack, App Router, SaaS-ready         |
| Runtime     | React          | 19.2.4  | —                                         |
| Language    | TypeScript     | 5       | Type safety, DX                           |
| Database    | PostgreSQL     | —       | Relational, מתאים לנתוני רכב/לקוחות       |
| ORM         | Prisma         | 6.19.3  | Type-safe, migrations, DX                 |
| Validation  | Zod            | 4.4.3   | Type inference, עובד טוב עם Next.js       |
| Styling     | Tailwind CSS   | 4       | Utility-first, מהיר לאב                   |
| Linting     | ESLint         | 9       | Zero-warnings policy                      |
| Formatting  | Prettier       | 3       | אחידות קוד                                |
| Testing     | Vitest         | 4       | jsdom + @testing-library/react            |
| CI/CD       | GitHub Actions | —       | type-check + lint + format + test + build |
| Hosting DB  | Supabase       | —       | Free tier, PostgreSQL, zero-ops           |
| Hosting App | Vercel         | —       | (עתידי)                                   |
| Auth        | NextAuth.js    | —       | (עתידי)                                   |

---

## Database Schema

### customers

| עמודה     | סוג      | הערות             |
| --------- | -------- | ----------------- |
| id        | cuid     | PK                |
| name      | String   | שם מלא            |
| phone     | String   | מזהה ייחודי בפועל |
| email     | String?  | אופציונלי         |
| createdAt | DateTime | auto              |
| updatedAt | DateTime | auto              |

### vehicles

| עמודה        | סוג     | הערות     |
| ------------ | ------- | --------- |
| id           | cuid    | PK        |
| licensePlate | String  | unique    |
| make         | String  | יצרן      |
| model        | String  | דגם       |
| year         | Int     | שנת ייצור |
| color        | String? | אופציונלי |
| mileage      | Int?    | אופציונלי |

### work_orders

| עמודה         | סוג       | הערות                                     |
| ------------- | --------- | ----------------------------------------- |
| id            | cuid      | PK                                        |
| orderNumber   | Int       | auto-increment, מוצג למשתמש               |
| status        | Enum      | PENDING / IN_PROGRESS / READY / DELIVERED |
| description   | String    | תיאור התקלה                               |
| notes         | String?   | הערות פנימיות                             |
| estimatedCost | Decimal?  | הערכה                                     |
| finalCost     | Decimal?  | סופי                                      |
| completedAt   | DateTime? | מוגדר כשסטטוס → DELIVERED                 |
| customerId    | FK        | → customers                               |
| vehicleId     | FK        | → vehicles                                |

---

## API Structure

```
/api/
└── work-orders/
    ├── GET    — list (supports ?status= and ?search=)
    ├── POST   — create
    └── [id]/
        ├── GET   — single
        └── PATCH — update status / cost / notes
```

### Patterns

- **Find-or-create** ללקוח לפי phone, לרכב לפי licensePlate
- **Zod validation** על כל input
- **Status transitions** חד-כיווניים: PENDING → IN_PROGRESS → READY → DELIVERED

---

## Validators

Zod schemas extracted to `lib/validators/work-orders.ts`:

- `CreateWorkOrderSchema` — validates POST body: customer name/phone, license plate (uppercased), vehicle make/model/year (1980–current+1), description, optional estimatedCost
- `UpdateWorkOrderSchema` — validates PATCH body: optional status / notes / finalCost

---

## Test Coverage

```
__tests__/
├── schemas.test.ts         # 14 unit tests — CreateWorkOrderSchema + UpdateWorkOrderSchema
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

ראה `docs/decisions.md`
