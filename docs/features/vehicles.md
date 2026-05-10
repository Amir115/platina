# Feature: Vehicle Module

**Status:** ✅ Complete (PR #13)
**Monday item:** https://amir-dana-personal.monday.com/boards/5096146634/pulses/2903849994

---

## Scope

Full CRUD for vehicles, linked to customers and work orders. Includes global license plate search from the nav bar, mileage tracking, and service history on the detail page.

---

## Data Model

```prisma
model Vehicle {
  id           String      @id @default(cuid())
  licensePlate String      @unique
  make         String
  model        String
  year         Int
  color        String?
  mileage      Int?
  notes        String?
  customerId   String?     // nullable — vehicles created via work-order flow before this module may lack it
  customer     Customer?   @relation(...)
  workOrders   WorkOrder[]
}
```

`customerId` is nullable for backward compatibility with vehicles created before the module was added. New vehicles created via `/api/vehicles` require it. The work-order create flow now also backfills `customerId` on existing vehicles.

---

## API Routes

| Method | Route                         | Description                                                               |
| ------ | ----------------------------- | ------------------------------------------------------------------------- |
| GET    | `/api/vehicles`               | List — supports `?search=` (plate/make/model/customer) and `?customerId=` |
| POST   | `/api/vehicles`               | Create vehicle linked to a customer                                       |
| GET    | `/api/vehicles/[id]`          | Single vehicle with customer + work order history                         |
| PATCH  | `/api/vehicles/[id]`          | Update make/model/year/mileage/color/notes/customerId                     |
| GET    | `/api/vehicles/search?plate=` | Fast license plate lookup for nav search (returns 8 results max)          |

---

## Validators (`lib/validators/vehicles.ts`)

- `CreateVehicleSchema` — requires licensePlate (Israeli format), make, model, year (1980–current+1), customerId; optional mileage, color, notes
- `UpdateVehicleSchema` — all fields optional; same range constraints on year/mileage

Israeli plate regex: `/^\d{2,3}-\d{2,3}-\d{2,3}$/` covers old format (12-345-67) and new format (123-45-678).

---

## UI

### Nav bar (`components/NavSearch.tsx`)

- Debounced (300ms) license plate search from anywhere in the app
- Dropdown shows matching vehicles with customer name
- "רכב חדש" shortcut at the bottom

### Vehicle list (`/vehicles`)

- Search by plate, make, model, or customer name
- Table: plate (monospace), make/model/year, customer link, mileage, work order count
- Click row → detail page
- "Add vehicle" button → VehicleModal → auto-navigates to new vehicle

### Vehicle detail (`/vehicles/[id]`)

- License plate displayed large in monospace font
- Customer card with tap-to-call phone link
- Mileage inline editor (click to edit, no modal)
- Full service history table

### VehicleModal (`components/VehicleModal.tsx`)

- Create / edit (pre-filled) in one component
- License plate uniqueness check on blur (disabled in edit mode)
- Customer searchable dropdown (same debounce pattern as CustomerModal)

---

## Work Order Integration

- `NewOrderModal` updated with `prefillVehicle` prop
- After customer is selected, their existing vehicles appear as quick-select chips
- License plate field also triggers vehicle lookup by plate
- Mileage field added — updates vehicle mileage on work order create
- Work order create route (`POST /api/work-orders`) now links vehicle to customer on creation and backfills existing orphaned vehicles

---

## Tests

`__tests__/vehicles.test.ts` — 15 unit tests covering CreateVehicleSchema and UpdateVehicleSchema:
plate formats, year range, negative mileage, optional fields, missing required fields.

---

## Known limitations / future work

- `customerId` is nullable — vehicles created before this module may need manual backfill
- No mileage history per work order (mileage is just the latest value on the vehicle)
- No "reassign vehicle to different customer" flow in UI (API supports it via PATCH)
