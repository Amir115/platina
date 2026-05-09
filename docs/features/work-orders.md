# Feature: Work Orders (כרטיסי עבודה)

> סטטוס: ✅ MVP בנוי | ✅ UI ראשוני בנוי | 🔄 שיפורים ב-UI ממתינים

---

## תיאור

הפיצ'ר המרכזי של פלטינה MVP. כרטיס עבודה מחבר לקוח + רכב + עבודה שבוצעה + עלות.

---

## מה בנוי

### Backend ✅

- `GET /api/work-orders` — רשימה עם סינון (`?status=`) וחיפוש (`?search=`)
- `POST /api/work-orders` — יצירת כרטיס חדש (find-or-create ללקוח/רכב)
- `GET /api/work-orders/:id` — כרטיס בודד
- `PATCH /api/work-orders/:id` — עדכון סטטוס / עלות סופית / הערות

### DB ✅

- טבלאות `customers`, `vehicles`, `work_orders` קיימות ב-Supabase
- Migration: `20260508222050_init`

### UI ✅

- `app/(dashboard)/page.tsx` — דאשבורד Next.js אמיתי עם client-side fetching, חיפוש, סינון לפי סטטוס, ו-refresh אחרי יצירת כרטיס
- `components/WorkOrderCard.tsx` — כרטיס הצגת work order עם כפתור מעבר סטטוס
- `components/NewOrderModal.tsx` — מודל יצירת כרטיס חדש עם טופס מלא
- `components/StatusBadge.tsx` — badge עם צבע לפי סטטוס

### Validators ✅

- `lib/validators/work-orders.ts` — Zod schemas: `CreateWorkOrderSchema`, `UpdateWorkOrderSchema`
- license plate מועלה אוטומטית ל-uppercase
- שנת רכב: 1980 עד השנה הנוכחית+1

### Tests ✅

- `__tests__/schemas.test.ts` — 14 unit tests לכל הvalidation cases
- `__tests__/StatusBadge.test.tsx` — render tests לכל 4 הסטטוסים
- `__tests__/WorkOrderCard.test.tsx` — render tests ל-component

---

## Status Flow

```
PENDING (ממתין)
    → IN_PROGRESS (בטיפול)
        → READY (מוכן)
            → DELIVERED (נמסר)
```

Transitions חד-כיווניים בלבד.

---

## מה חסר

- [ ] דפי Next.js אמיתיים (לא prototype)
- [ ] דף פרטי כרטיס עבודה (`/work-orders/:id`)
- [ ] עריכת כרטיס קיים
- [ ] הדפסת כרטיס עבודה
- [ ] חיפוש לפי תאריך

---

## לא בסקופ (MVP)

- תשלומים / חשבוניות
- תזכורת WhatsApp ללקוח
- היסטוריית שינויים לכרטיס
