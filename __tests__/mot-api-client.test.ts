import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { fetchVehicleByPlate, clearMotCache } from '@/lib/mot-api';

const MOCK_RAW_RECORD = {
  mispar_rechev: '1234567',
  tozeret_nm: 'TOYOTA',
  kinuy_mishari: 'COROLLA',
  shnat_yitzur: '2018',
  sug_delek_nm: 'בנזין',
  tokef_dt: '2025-06-15',
  tzeva_rechev: 'לבן',
  misgeret: 'ABC123456789',
  degem_manoa: '1ZR-FE',
  nefah_manoa: '1598',
};

function makeApiResponse(records: unknown[]) {
  return JSON.stringify({ result: { records } });
}

function mockFetch(body: string, status = 200) {
  vi.stubGlobal(
    'fetch',
    vi.fn().mockResolvedValue({
      ok: status >= 200 && status < 300,
      status,
      json: () => Promise.resolve(JSON.parse(body)),
    }),
  );
}

beforeEach(() => {
  clearMotCache();
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('fetchVehicleByPlate', () => {
  it('returns normalized data for a valid plate', async () => {
    mockFetch(makeApiResponse([MOCK_RAW_RECORD]));

    const result = await fetchVehicleByPlate('123-45-67');

    expect(result).not.toBeNull();
    expect(result?.make).toBe('TOYOTA');
    expect(result?.model).toBe('COROLLA');
    expect(result?.year).toBe(2018);
    expect(result?.color).toBe('לבן');
    expect(result?.fuelType).toBe('בנזין');
    expect(result?.testExpiry).toBe('2025-06-15');
    expect(result?.vin).toBe('ABC123456789');
    expect(result?.engineModel).toBe('1ZR-FE');
    expect(result?.engineSize).toBe(1598);
  });

  it('returns null for an unknown plate (empty records)', async () => {
    mockFetch(makeApiResponse([]));

    const result = await fetchVehicleByPlate('999-99-999');
    expect(result).toBeNull();
  });

  it('does not make a second network call on cache hit', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: () => Promise.resolve(JSON.parse(makeApiResponse([MOCK_RAW_RECORD]))),
    });
    vi.stubGlobal('fetch', fetchMock);

    await fetchVehicleByPlate('123-45-67');
    await fetchVehicleByPlate('123-45-67');

    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it('throws with a clear message on timeout', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockImplementation(() => {
        const err = new Error('The operation was aborted');
        err.name = 'AbortError';
        return Promise.reject(err);
      }),
    );

    await expect(fetchVehicleByPlate('123-45-67')).rejects.toThrow(/timed out/i);
  });

  it('throws when API response shape is invalid', async () => {
    mockFetch(JSON.stringify({ unexpected: true }));

    await expect(fetchVehicleByPlate('123-45-67')).rejects.toThrow(/response shape invalid/i);
  });

  it('trims whitespace from string fields', async () => {
    const recordWithSpaces = {
      ...MOCK_RAW_RECORD,
      tozeret_nm: '  HONDA  ',
      kinuy_mishari: '  CIVIC  ',
    };
    mockFetch(makeApiResponse([recordWithSpaces]));

    const result = await fetchVehicleByPlate('111-11-111');
    expect(result?.make).toBe('HONDA');
    expect(result?.model).toBe('CIVIC');
  });

  it('handles null/missing optional fields gracefully', async () => {
    const minimalRecord = {
      mispar_rechev: '1234567',
      tozeret_nm: 'FORD',
      kinuy_mishari: null,
      shnat_yitzur: null,
      sug_delek_nm: null,
      tokef_dt: null,
      tzeva_rechev: null,
      misgeret: null,
      degem_manoa: null,
      nefah_manoa: null,
    };
    mockFetch(makeApiResponse([minimalRecord]));

    const result = await fetchVehicleByPlate('222-22-222');
    expect(result?.make).toBe('FORD');
    expect(result?.model).toBeNull();
    expect(result?.year).toBeNull();
    expect(result?.testExpiry).toBeNull();
  });
});
