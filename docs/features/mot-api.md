# Feature: MOT API Integration

**Status:** ✅ Complete ([PR #19](https://github.com/Amir115/platina/pull/19))
**Monday item:** https://amird-company.monday.com/boards/18413512127/pulses/12172611594

---

## Purpose

Fetches vehicle registration data from the Israeli Ministry of Transportation open API (`data.gov.il`) by license plate. Used to autofill vehicle details in the VehicleModal so mechanics don't have to enter make/model/year manually.

---

## External API

- **Base URL:** `https://data.gov.il/api/3/action/datastore_search`
- **Resource ID:** `053cea08-09bc-40ec-8f7a-156f0677aff3`
- **Auth:** None — fully open
- **Method:** GET only
- **Query:** `?resource_id=<id>&q=<plate>&limit=1`

Hebrew characters in query params must be `encodeURIComponent`-encoded.

---

## Field Mapping

| API field       | Meaning                  | MotVehicleData field |
| --------------- | ------------------------ | -------------------- |
| `mispar_rechev` | License plate            | `licensePlate`       |
| `tozeret_nm`    | Manufacturer             | `make`               |
| `kinuy_mishari` | Commercial model name    | `model`              |
| `shnat_yitzur`  | Year of manufacture      | `year`               |
| `sug_delek_nm`  | Fuel type                | `fuelType`           |
| `tokef_dt`      | MOT test expiry date     | `testExpiry`         |
| `tzeva_rechev`  | Color                    | `color`              |
| `misgeret`      | VIN / chassis number     | `vin`                |
| `degem_manoa`   | Engine model             | `engineModel`        |
| `nefah_manoa`   | Engine displacement (cc) | `engineSize`         |

---

## Service (`lib/mot-api/`)

### `types.ts`

- `MotVehicleRawSchema` — Zod schema for raw API record (all fields nullable/optional)
- `MotApiResponseSchema` — wraps `result.records` array
- `MotVehicleData` — clean normalized type returned to callers; `testExpiry` is an ISO string (safe for JSON serialization)

### `client.ts`

- `fetchVehicleByPlate(plate: string): Promise<MotVehicleData | null>`
  - Normalizes plate to uppercase before lookup and cache key
  - **Cache:** in-memory `Map` with 24h TTL; null results are also cached (unknown plate won't trigger repeat calls)
  - **Timeout:** 5 seconds via `AbortController`
  - Empty records → returns `null`
  - Network/timeout error → throws with descriptive message
  - Invalid response shape → throws Zod validation error
- `clearMotCache()` — exposed for test isolation

### `index.ts`

Re-exports `fetchVehicleByPlate`, `clearMotCache`, and all types/schemas.

---

## API Route

`GET /api/vehicles/lookup?plate=XXXXXXX`

| Status | Condition               |
| ------ | ----------------------- |
| 200    | Vehicle found           |
| 400    | `plate` param missing   |
| 404    | Vehicle not in registry |
| 500    | MOT API error           |

---

## Known Limitations / Future Work

- Cache is in-memory per server process — resets on deploy or cold start (acceptable for this data frequency)
- `testExpiry` and `vin` are displayed in the UI but not persisted to the DB (Vehicle model has no such columns)
- MOT data may lag reality by a few days for recently registered vehicles
