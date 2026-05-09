# Bugs & Known Issues — פלטינה

> מתועד אוטומטית על ידי Claude Code.
> פורמט: [תאריך] | [סטטוס] | תיאור | פתרון

---

## פתורים

### BUG-001: Prisma 7 לא מצליח לפרסר prisma.config.ts

**תאריך:** מאי 2026 | **סטטוס:** ✅ נפתר

**תיאור:** Prisma 7 הוציא שינוי breaking — `url` ב-datasource לא נתמך יותר. `prisma.config.ts` נדרש, אבל יש בעיות parsing עם ESM + TypeScript.

**פתרון:** Downgrade ל-Prisma 6 שתומך ב-`url` ב-schema כרגיל.

---

### BUG-002: Supabase Direct Connection נכשלת (IPv4)

**תאריך:** מאי 2026 | **סטטוס:** ✅ נפתר

**תיאור:** `P1001: Can't reach database server` עם Direct Connection URL.

**סיבה:** Supabase Direct Connection היא IPv6-only בחינם. רשת ה-Mac היא IPv4.

**פתרון:** שימוש ב-Session Pooler URL (`*.pooler.supabase.com:5432`) במקום Direct (`db.*.supabase.co:5432`).

---

### BUG-003: Prisma לא קורא מ-.env.local

**תאריך:** מאי 2026 | **סטטוס:** ✅ נפתר

**תיאור:** `Environment variable not found: DATABASE_URL` למרות ש-`.env.local` מוגדר.

**סיבה:** Prisma CLI קורא רק מ-`.env`, לא מ-`.env.local` (זה Next.js convention).

**פתרון:** `cp .env.local .env` — לשמור את שני הקבצים מסונכרנים.

---

## פתוחים

_אין כרגע_
