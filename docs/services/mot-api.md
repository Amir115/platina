# Service: MOT API Client

**Source:** `lib/mot-api/`
**Route:** `GET /api/vehicles/lookup?plate=`
**PR:** https://github.com/Amir115/platina/pull/19

---

## Overview

Fetches vehicle registration data from the Israeli Ministry of Transportation open data portal (`data.gov.il`) by license plate number. Returns normalized vehicle data or `null` if the plate is not found in the registry.

---

## External API

| Property    | Value                                               |
| ----------- | --------------------------------------------------- |
| Base URL    | `https://data.gov.il/api/3/action/datastore_search` |
| Resource ID | `053cea08-09bc-40ec-8f7a-156f0677aff3`              |
| Auth        | None — fully public                                 |
| Method      | GET                                                 |
| Query shape | `?resource_id=<id>&q=<plate>&limit=1`               |

Hebrew characters in query parameters are `encodeURIComponent`-encoded automatically.

---

## Field Mapping

| API field       | Hebrew meaning           | `MotVehicleData` field |
| --------------- | ------------------------ | ---------------------- |
| `mispar_rechev` | License plate            | `licensePlate`         |
| `tozeret_nm`    | Manufacturer             | `make`                 |
| `kinuy_mishari` | Commercial model name    | `model`                |
| `shnat_yitzur`  | Year of manufacture      | `year`                 |
| `tzeva_rechev`  | Color                    | `color`                |
| `sug_delek_nm`  | Fuel type                | `fuelType`             |
| `tokef_dt`      | MOT test expiry date     | `testExpiry`           |
| `misgeret`      | VIN / chassis number     | `vin`                  |
| `degem_manoa`   | Engine model             | `engineModel`          |
| `nefah_manoa`   | Engine displacement (cc) | `engineSize`           |

All `MotVehicleData` fields except `licensePlate` are `string | null` or `number | null` — the raw API returns many fields as absent or empty.

---

## Caching

- **Storage:** In-process `Map<string, CacheEntry>` — no external dependency
- **TTL:** 24 hours from time of fetch
- **Scope:** Includes both hits and misses — an unknown plate that returned `null` is cached to avoid repeat calls
- **Key:** Normalized plate (trimmed, uppercased)
- **Eviction:** None — cache is unbounded but vehicle registration data changes rarely
- **Limitation:** Resets on every deploy or cold start; acceptable for this data update frequency

To clear the cache in tests, call `clearMotCache()` from `lib/mot-api`.

---

## Error Handling

| Condition                      | Behavior                                                                   |
| ------------------------------ | -------------------------------------------------------------------------- |
| Response takes > 5 s           | `AbortController` fires; throws `"MOT API request timed out after 5000ms"` |
| Network failure                | Throws `"MOT API network error: <message>"`                                |
| HTTP non-2xx status            | Throws `"MOT API returned status <N>"`                                     |
| Response shape fails Zod parse | Throws `"MOT API response shape invalid: <zod error>"`                     |
| Empty `records` array          | Returns `null`; result cached as miss                                      |

All thrown errors propagate to the caller. The `/api/vehicles/lookup` route catches them and returns `500` with `{ error: "MOT API error" }`.

---

## API Route

```
GET /api/vehicles/lookup?plate=XXXXXXX
```

| Status | Condition                                     |
| ------ | --------------------------------------------- |
| 200    | Vehicle found — returns `MotVehicleData` JSON |
| 400    | `plate` query param missing                   |
| 404    | Plate not found in MOT registry               |
| 500    | MOT API threw an error                        |

---

## Usage Example — VehicleModal

`components/VehicleModal.tsx` calls the lookup route when the user clicks "שלוף מרשם":

```ts
const res = await fetch(`/api/vehicles/lookup?plate=${encodeURIComponent(plate)}`);

if (res.ok) {
  const data: MotVehicleData = await res.json();
  // Autofill form fields
  setForm((prev) => ({
    ...prev,
    make: data.make ?? prev.make,
    model: data.model ?? prev.model,
    year: data.year ? String(data.year) : prev.year,
    color: data.color ?? prev.color,
  }));
  // Store extended MOT data for read-only display panel
  setMotData(data);
}
```

The read-only panel below the form renders `fuelType`, `testExpiry`, `vin`, and `engineModel` / `engineSize` from `motData`. These fields are **not** persisted to the `Vehicle` table.

---

## Known Limitations

- `testExpiry` and `vin` are shown in the UI but not saved to the database — `Vehicle` has no such columns
- Cache is per-process; horizontal scaling or rolling deploys will briefly hit the MOT API again until the cache warms
- MOT registry may lag reality by a few days for recently registered or transferred vehicles
