import { z } from 'zod';

const CURRENT_YEAR = new Date().getFullYear();
const ISRAELI_PLATE = /^\d{2,3}-\d{2,3}-\d{2,3}$/;

export const CreateVehicleSchema = z.object({
  licensePlate: z
    .string()
    .min(1)
    .transform((s) => s.toUpperCase())
    .refine((s) => ISRAELI_PLATE.test(s), 'פורמט לוחית רישוי לא תקין (לדוגמה: 123-45-678)'),
  make: z.string().min(1, 'יצרן הוא שדה חובה'),
  model: z.string().min(1, 'דגם הוא שדה חובה'),
  year: z
    .number()
    .int()
    .min(1980, 'שנה חייבת להיות 1980 ומעלה')
    .max(CURRENT_YEAR + 1, `שנה חייבת להיות לכל היותר ${CURRENT_YEAR + 1}`),
  mileage: z.number().int().min(0).optional(),
  color: z.string().optional(),
  notes: z.string().optional(),
  customerId: z.string().min(1, 'לקוח הוא שדה חובה'),
});

export const UpdateVehicleSchema = z.object({
  make: z.string().min(1).optional(),
  model: z.string().min(1).optional(),
  year: z
    .number()
    .int()
    .min(1980)
    .max(CURRENT_YEAR + 1)
    .optional(),
  mileage: z.number().int().min(0).optional(),
  color: z.string().optional(),
  notes: z.string().optional(),
  customerId: z.string().min(1).optional(),
});
