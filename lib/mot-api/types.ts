import { z } from 'zod';

export const MotVehicleRawSchema = z.object({
  mispar_rechev: z.union([z.string(), z.number()]).nullable().optional(),
  tozeret_nm: z.string().nullable().optional(),
  kinuy_mishari: z.string().nullable().optional(),
  shnat_yitzur: z.union([z.string(), z.number()]).nullable().optional(),
  sug_delek_nm: z.string().nullable().optional(),
  tokef_dt: z.string().nullable().optional(),
  tzeva_rechev: z.string().nullable().optional(),
  misgeret: z.string().nullable().optional(),
  degem_manoa: z.string().nullable().optional(),
  nefah_manoa: z.union([z.string(), z.number()]).nullable().optional(),
});

export type MotVehicleRaw = z.infer<typeof MotVehicleRawSchema>;

export interface MotVehicleData {
  licensePlate: string;
  make: string | null;
  model: string | null;
  year: number | null;
  color: string | null;
  fuelType: string | null;
  testExpiry: string | null; // ISO date string — safe to serialize over JSON
  vin: string | null;
  engineModel: string | null;
  engineSize: number | null;
}

export const MotApiResponseSchema = z.object({
  result: z.object({
    records: z.array(MotVehicleRawSchema),
  }),
});

export type MotApiResponse = z.infer<typeof MotApiResponseSchema>;
