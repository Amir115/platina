import { MotApiResponseSchema, MotVehicleData } from './types';

const MOT_API_URL = 'https://data.gov.il/api/3/action/datastore_search';
const RESOURCE_ID = '053cea08-09bc-40ec-8f7a-156f0677aff3';
const CACHE_TTL_MS = 24 * 60 * 60 * 1000;
const TIMEOUT_MS = 5000;

interface CacheEntry {
  data: MotVehicleData | null;
  expiresAt: number;
}

const cache = new Map<string, CacheEntry>();

export async function fetchVehicleByPlate(plate: string): Promise<MotVehicleData | null> {
  const key = plate.trim().toUpperCase();

  const cached = cache.get(key);
  if (cached && cached.expiresAt > Date.now()) {
    return cached.data;
  }

  const url = `${MOT_API_URL}?resource_id=${encodeURIComponent(RESOURCE_ID)}&q=${encodeURIComponent(key)}&limit=1`;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);

  let response: Response;
  try {
    response = await fetch(url, { signal: controller.signal });
  } catch (err) {
    if ((err as Error).name === 'AbortError') {
      throw new Error(`MOT API request timed out after ${TIMEOUT_MS}ms`);
    }
    throw new Error(`MOT API network error: ${(err as Error).message}`);
  } finally {
    clearTimeout(timeoutId);
  }

  if (!response.ok) {
    throw new Error(`MOT API returned status ${response.status}`);
  }

  const json: unknown = await response.json();
  const parsed = MotApiResponseSchema.safeParse(json);
  if (!parsed.success) {
    throw new Error(`MOT API response shape invalid: ${parsed.error.message}`);
  }

  const records = parsed.data.result.records;
  if (records.length === 0) {
    cache.set(key, { data: null, expiresAt: Date.now() + CACHE_TTL_MS });
    return null;
  }

  const raw = records[0];
  const yearRaw = raw.shnat_yitzur != null ? parseInt(String(raw.shnat_yitzur), 10) : null;
  const sizeRaw = raw.nefah_manoa != null ? parseInt(String(raw.nefah_manoa), 10) : null;

  const data: MotVehicleData = {
    licensePlate: key,
    make: raw.tozeret_nm?.trim() ?? null,
    model: raw.kinuy_mishari?.trim() ?? null,
    year: yearRaw != null && !isNaN(yearRaw) ? yearRaw : null,
    color: raw.tzeva_rechev?.trim() ?? null,
    fuelType: raw.sug_delek_nm?.trim() ?? null,
    testExpiry: raw.tokef_dt?.trim() ?? null,
    vin: raw.misgeret?.trim() ?? null,
    engineModel: raw.degem_manoa?.trim() ?? null,
    engineSize: sizeRaw != null && !isNaN(sizeRaw) ? sizeRaw : null,
  };

  cache.set(key, { data, expiresAt: Date.now() + CACHE_TTL_MS });
  return data;
}

export function clearMotCache(): void {
  cache.clear();
}
