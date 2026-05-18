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

---

## Knowledge Base Management

The `docs/` folder is the project's living knowledge base. Claude Code is responsible for keeping it up to date — the developer never edits these files manually.

### Structure

```
docs/
├── changelog.md          # Session history — updated every session
├── architecture.md       # Stack, DB schema, API structure
├── decisions.md          # ADR — why we chose X over Y
├── bugs.md               # Known bugs and resolutions
└── features/
    ├── work-orders.md    # One file per feature
    └── ...
```

### Rules

**At the start of every session:**

1. Read `docs/changelog.md` to understand where we left off
2. Read relevant `docs/features/*.md` for the feature being worked on
3. Check `docs/bugs.md` for known issues

**At the end of every session:**

1. Update `docs/changelog.md` with a new entry using this format:
   ```
   ## Session: YYYY-MM-DD
   - Task: [task name]
   - Monday item: https://amird-company.monday.com/boards/18413512127/pulses/[ITEM_ID]
   - PR: [PR URL]
   - Summary: [what was done]
   - Files created or modified: [list]
   - Bugs fixed: [list or none]
   - Next step: [what comes next]
   ```
2. Update the relevant `docs/features/*.md` — mark completed items, add new ones
3. If a new architectural decision was made → add to `docs/decisions.md`
4. If a bug was found or fixed → update `docs/bugs.md`
5. If a new feature was started → create `docs/features/<feature-name>.md`

**Never:**

- Skip the end-of-session update
- Let the developer update these files manually
- Leave `docs/changelog.md` without a "Next step" entry
- Open a separate PR just for `docs/` updates — knowledge base changes must ship in the same PR as the code that triggered them. If docs are out of date, update them in the next feature/fix PR, not a standalone one

---

## Merge Strategy

Always use **squash and merge** when merging PRs — never regular merge or rebase merge.

```bash
gh pr merge <number> --squash --delete-branch
```

---

## Monday.com ↔ GitHub PR Integration

Every PR must be linked to a Monday.com item. When opening a PR:

1. Include the Monday.com item URL in the PR description — required by CI:
   `https://amird-company.monday.com/boards/18413512127/pulses/ITEM_ID`
2. Immediately after the PR is created, set the item's `PR Link` column (column ID: `link_mm3dqdk7`) to the PR URL via the Monday.com MCP tool, using the text format `PR #NUMBER - PR_TITLE` (e.g. `PR #17 - feat(auth): add Clerk authentication and garage multi-tenancy`)

**Choosing the right Monday item:**

- Only link to an item whose scope matches the PR's actual work
- Do NOT reuse the item from a previous PR in the same session unless the work is a direct continuation
- If no existing item fits, create a new one in the Execution group and ask the user to confirm if unsure

The CI job `monday-link-check` enforces rule 1 — PRs without a Monday link will fail checks.

**Keeping the PR up to date:**
Every time new commits are pushed to a PR branch, immediately update the PR title and body to reflect all cumulative changes on the branch — not just the latest commit. The description must always be an accurate summary of everything the PR contains.

---

## Task Management

This project uses **Monday.com** for task tracking (board ID: `18413512127`).

**At the start of every session:**

1. Use the `monday` MCP tool to fetch open tasks from board `18413512127`
2. Use item status and descriptions to understand what is in progress or planned next
3. Prioritize work based on items marked as active/in-progress

The Monday.com MCP server is configured in `.mcp.json` and enabled via `.claude/settings.json`.

---

## UI Component Strategy

We are building a design system incrementally — not as a separate phase, but as a byproduct of building features.

**Rules for every UI component you write:**

- Place all reusable UI components under `src/components/ui/` with clean, typed props
- Never write one-off inline styles or ad-hoc Tailwind classes directly in page files — always extract to a component
- Use consistent naming: `Button`, `Input`, `Card`, `Badge`, `Modal`, `Spinner`, `EmptyState`, `PageHeader`
- Every component must support RTL out of the box (`dir="rtl"` on root is already set)
- Use Tailwind utility classes only — no custom CSS unless absolutely necessary
- If a component already exists in `src/components/ui/`, always reuse it — never duplicate

**What this means in practice:**
When building Customer module, Vehicle module, or any new feature — if you need a button, check if `Button` exists in `src/components/ui/`. If not, create it there first, then use it. Same for inputs, cards, modals, badges.

The formal design system (Storybook, full token documentation) comes later. For now: clean components, consistent props, RTL-first.

---

## Post-Merge Cleanup

After any PR is merged during a session, always without being asked:

1. `git checkout main`
2. `git pull origin main`
3. Extract the Monday.com item ID from the merged PR description (URL format: `https://amird-company.monday.com/boards/18413512127/pulses/ITEM_ID`)
4. Update the item's `project_status` column to `Done` via the Monday.com MCP tool
5. Update the item's `PR Link` column (column ID: `link_mm3dqdk7`) with the merged PR URL, using the text format `PR #NUMBER - PR_TITLE`

This keeps the local `main` branch current and the Monday board in sync after every merge.
