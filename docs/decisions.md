# Decisions — פלטינה

> ADR (Architecture Decision Records) — למה בחרנו X ולא Y.
> מתועד אוטומטית על ידי Claude Code בכל פעם שמתקבלת החלטה משמעותית.

---

## ADR-001: Next.js 14+ במקום React + Express נפרד

**תאריך:** אפריל 2026
**סטטוס:** ✅ אושר

**החלטה:** Next.js App Router כ-fullstack framework.

**סיבות:**

- API routes + UI באותו repo — פחות overhead
- SaaS-ready מהיום הראשון
- Vercel deployment פשוט
- TypeScript end-to-end

---

## ADR-002: Prisma 6 במקום Prisma 7

**תאריך:** מאי 2026
**סטטוס:** ✅ אושר

**החלטה:** Downgrade מ-Prisma 7 ל-Prisma 6.

**סיבות:**

- Prisma 7 עדיין early access — `url` ב-schema לא נתמך
- `prisma.config.ts` דורש tsx ויש בעיות parsing עם ESM
- Prisma 6 יציב, עובד עם `url` ב-schema כרגיל
- ניתן לשדרג בעתיד כש-Prisma 7 יתייצב

**חלופות שנבדקו:** Drizzle ORM — נדחה כי Prisma מוכר יותר וה-DX טוב יותר לשלב MVP.

---

## ADR-003: Supabase במקום Railway / Neon / Local

**תאריך:** מאי 2026
**סטטוס:** ✅ אושר

**החלטה:** Supabase כ-managed PostgreSQL.

**סיבות:**

- Free tier נדיב (500MB, 2 projects)
- PostgreSQL מלא — לא וריאנט
- Dashboard נוח לצפייה בנתונים בשלב MVP
- Session Pooler תומך IPv4 בחינם

**הערה:** יש להשתמש ב-Session Pooler URL (לא Direct) עקב IPv4.

---

## ADR-004: Find-or-create ללקוח ורכב

**תאריך:** מאי 2026
**סטטוס:** ✅ אושר

**החלטה:** בעת יצירת Work Order — לקוח מזוהה לפי phone, רכב לפי licensePlate. אם לא קיים — נוצר אוטומטית.

**סיבות:**

- UX פשוט יותר — טופס אחד לכל
- מוסך קטן לא רוצה "קודם צור לקוח, אחר כך צור רכב, אחר כך פתח כרטיס"
- Phone כ-unique identifier — מספיק לשלב MVP

---

## ADR-005: Vitest במקום Jest

**תאריך:** מאי 2026
**סטטוס:** ✅ אושר

**החלטה:** Vitest כ-test runner.

**סיבות:**

- מהיר יותר (ESM-native, HMR על tests)
- config מינימלי — עובד out-of-the-box עם Vite + TypeScript
- API זהה ל-Jest — אין learning curve
- מתחזק באותו ecosystem כמו Next.js + Vite

**חלופות שנבדקו:** Jest — נדחה בגלל config מורכב עם ESM + TypeScript ב-Next.js 14+.

---

## ADR-006: ESLint Zero-Warnings Policy

**תאריך:** מאי 2026
**סטטוס:** ✅ אושר

**החלטה:** `eslint --max-warnings 0` — כל warning מנוצ'ה CI.

**סיבות:**

- warnings שמצטברים הופכים ל-noise שמסתיר bugs אמיתיים
- אכיפה ב-CI מבטיחה שהחוק עקבי ולא "בזמן אחריות"
- `eslint-config-prettier` מונע קונפליקטים בין ESLint ל-Prettier

---

## ADR-007: Validators בקובץ נפרד

**תאריך:** מאי 2026
**סטטוס:** ✅ אושר

**החלטה:** Zod schemas הועברו מ-route files ל-`lib/validators/work-orders.ts`.

**סיבות:**

- שיתוף schema בין route files שונים ללא duplication
- ניתן לבדוק את ה-schemas בנפרד מה-HTTP logic (unit tests ב-`__tests__/schemas.test.ts`)
- מיישר עם convention של `lib/` כמקום לשיתוף logic
