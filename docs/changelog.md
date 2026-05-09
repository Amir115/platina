# Changelog — פלטינה

> מתועד אוטומטית על ידי Claude Code בסוף כל סשן עבודה.
> פורמט: [תאריך] | [סשן] | מה נעשה | צעד הבא

---

## סשן 001 — תכנון ואפיון ראשוני

**תאריך:** אפריל 2026
**סוג:** Planning

### מה נעשה

- הוגדר חזון המוצר ופוזישנינג
- מופו מתחרים: נשר, מוסכית 2020, מנוע, תפנית
- זוהו 5 פערי שוק מרכזיים
- הוגדרה אסטרטגיית כניסה בשלבים (קטנים → רשתות → יבואנים)
- נוצר מסמך מחקר מלא (`RESEARCH.md`)

### קבצים שנוצרו

- `RESEARCH.md`
- `CONTEXT.md`

### צעד הבא

- ריאיון עם אבא (לקוח בטא ראשון)
- ריאיונות עם 5+ בעלי מוסכים

---

## סשן 002 — הקמת תשתית + MVP ראשון

**תאריך:** מאי 2026
**סוג:** Infrastructure + Feature

### מה נעשה

#### תשתית

- הוקם פרויקט Next.js 16 + TypeScript + Tailwind
- הוגדר PostgreSQL על Supabase (EU Central - Frankfurt)
- הותקן Prisma 6 וחובר ל-DB
- הורצה migration ראשונה בהצלחה (`20260508222050_init`)
- נוצרו טבלאות: `customers`, `vehicles`, `work_orders`

#### פיצ'ר: כרטיס עבודה (Work Order) — MVP

- הוגדרה סכמת DB מלאה (Customer, Vehicle, WorkOrder)
- נבנו API routes:
  - `GET /api/work-orders` — רשימה עם סינון וחיפוש
  - `POST /api/work-orders` — יצירה (find-or-create ללקוח/רכב)
  - `GET /api/work-orders/:id` — כרטיס בודד
  - `PATCH /api/work-orders/:id` — עדכון סטטוס/עלות
- נבנה UI prototype: דאשבורד, סטטיסטיקות, סינון, חיפוש, טופס יצירה
- הוגדרו status transitions: PENDING → IN_PROGRESS → READY → DELIVERED

#### תיעוד

- נוצרו: `CLAUDE.md`, `CONTEXT.md`, `RESEARCH.md`
- נוצרו: `types/index.ts`, `lib/prisma.ts`, `.env.example`, `.gitignore`

### קבצים שנוצרו / שונו

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

### בעיות שנפתרו

- Prisma 7 לא תומך ב-`url` ב-schema → downgrade ל-Prisma 6
- Supabase IPv4 — נפתר עם Session Pooler במקום Direct Connection

### צעד הבא

- הגדרת Monday.com + MCP ל-Claude Code
- הגדרת Prettier + ESLint + GitHub Actions CI
- כתיבת Claude Code skills לפרויקט
- בניית UI אמיתי (Next.js pages + components)
- Playwright + Storybook tests

---

## סשן 003 — תשתית CI/CD + Code Quality

**תאריך:** מאי 2026
**סוג:** Infrastructure
**PR:** #2 (`infra: add Prettier, ESLint hardening, and GitHub Actions CI`)

### מה נעשה

- הותקן ESLint 9 עם `eslint-config-next` + `eslint-config-prettier` — zero warnings policy (`--max-warnings 0`)
- הותקן Prettier 3 — פורמט אחיד לכל הפרויקט
- הוקם GitHub Actions CI (`.github/workflows/ci.yml`) עם שלבים: type-check → lint → format:check → test → build
- הוקם Label Check workflow (`.github/workflows/label-check.yml`) — כל PR חייב label מ: Bug / Documentation / Enhancement / Infrastructure
- נוספו npm scripts: `lint`, `format`, `format:check`, `type-check`

### קבצים שנוצרו / שונו

- `.github/workflows/ci.yml`
- `.github/workflows/label-check.yml`
- `package.json` (scripts + devDependencies)

### צעד הבא

- הוספת Vitest + unit tests
- שיפור כיסוי בדיקות

---

## סשן 004 — Vitest + Unit Tests

**תאריך:** מאי 2026
**סוג:** Infrastructure
**PR:** #3 (`infra: add Vitest unit tests and CI test step`)

### מה נעשה

- הותקן Vitest 4 עם jsdom + @testing-library/react
- הוצאו ה-Zod schemas מ-routes לקובץ ייעודי: `lib/validators/work-orders.ts`
- נכתבו 3 קבצי טסטים:
  - `__tests__/schemas.test.ts` — 14 טסטים ל-`CreateWorkOrderSchema` ו-`UpdateWorkOrderSchema`
  - `__tests__/StatusBadge.test.tsx` — טסטי render ל-component
  - `__tests__/WorkOrderCard.test.tsx` — טסטי render ל-component
- נוסף `vitest.config.ts` ו-`vitest.setup.ts`
- נוסף שלב `npm test` ל-CI workflow

### קבצים שנוצרו / שונו

- `lib/validators/work-orders.ts` (חדש — הוצא מ-route)
- `__tests__/schemas.test.ts`
- `__tests__/StatusBadge.test.tsx`
- `__tests__/WorkOrderCard.test.tsx`
- `vitest.config.ts`
- `vitest.setup.ts`
- `.github/workflows/ci.yml` (נוסף שלב test)
- `package.json`

### צעד הבא

- הגדרת Claude Code skills
- שיפור UI

---

## סשן 005 — מסמך מחקר שוק

**תאריך:** מאי 2026
**סוג:** Documentation
**PR:** #4 (`docs: add product research document`)

### מה נעשה

- `RESEARCH.md` הועלה רשמית ל-git (נוצר בסשן 001 מחוץ ל-git)

### קבצים שנוצרו / שונו

- `RESEARCH.md` (committed לראשונה)

### צעד הבא

- כתיבת Claude Code /ship skill
- הגדרת shared settings

---

## סשן 006 — Claude Code Tooling: /ship Skill

**תאריך:** מאי 2026
**סוג:** Infrastructure
**ענף:** `infra/ship-skill` (טרם מוזג)

### מה נעשה

- נוצר `/ship` skill (`.claude/commands/ship.md`) — skill ל-Claude Code שמייצר PR נקי מעל main
  - Pre-flight: tsc + eslint + format:check + vitest
  - מנתח diff → קובע label + branch name + commit message
  - Rebase על main + push + `gh pr create` אוטומטי
- נוצר `.claude/settings.json` — הרשאות מאושרות מראש: npm scripts + `gh label list`
- תוקן פורמט `ship.md` ונוסף `format:check` לשלב ה-pre-flight

### קבצים שנוצרו / שונו

- `.claude/commands/ship.md`
- `.claude/settings.json`
- `CLAUDE.md` (עדכון)

### צעד הבא

- מיזוג `infra/ship-skill` ל-main
- בניית feature בפועל (כרטיסי עבודה — שיפור UI)
