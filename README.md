# פלטינה 🔧

Cloud-native garage management SaaS for the Israeli market.
Built with Next.js 14, PostgreSQL, and Prisma. Currently in MVP stage — work orders, customer & vehicle management.

## Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Set up environment
cp .env.example .env.local
# Edit .env.local and add your DATABASE_URL

# 3. Run DB migrations
npx prisma migrate dev --name init

# 4. Start dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Stack

- **Framework:** Next.js 14 (App Router)
- **Database:** PostgreSQL
- **ORM:** Prisma
- **Validation:** Zod
- **Styling:** Tailwind CSS

## Project Structure

```
├── app/
│   ├── api/work-orders/    # REST API
│   └── (dashboard)/        # Main UI
├── prisma/schema.prisma    # DB schema
├── lib/prisma.ts           # Prisma client
├── types/index.ts          # Shared types
├── CLAUDE.md               # Context for Claude Code
└── CONTEXT.md              # Full product context
```

## API

| Method | Endpoint               | Description        |
| ------ | ---------------------- | ------------------ |
| GET    | `/api/work-orders`     | List work orders   |
| POST   | `/api/work-orders`     | Create work order  |
| GET    | `/api/work-orders/:id` | Get single order   |
| PATCH  | `/api/work-orders/:id` | Update status/cost |

## Status Flow

```
PENDING → IN_PROGRESS → READY → DELIVERED
ממתין     בטיפול        מוכן    נמסר
```

## Recommended DB Hosting (MVP)

[Supabase](https://supabase.com) — free tier, PostgreSQL, zero ops.
