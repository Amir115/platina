import { z } from 'zod';

export const CreateWorkOrderSchema = z.object({
  customerName: z.string().min(2),
  customerPhone: z.string().min(9),
  licensePlate: z
    .string()
    .min(2)
    .transform((s) => s.toUpperCase()),
  vehicleMake: z.string().min(1),
  vehicleModel: z.string().min(1),
  vehicleYear: z
    .number()
    .int()
    .min(1980)
    .max(new Date().getFullYear() + 1),
  description: z.string().min(3),
  estimatedCost: z.number().positive().optional(),
});

export const UpdateWorkOrderSchema = z.object({
  status: z.enum(['PENDING', 'IN_PROGRESS', 'READY', 'DELIVERED']).optional(),
  notes: z.string().optional(),
  finalCost: z.number().positive().optional(),
});
