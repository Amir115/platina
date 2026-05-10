import { z } from 'zod';

const ISRAELI_PHONE = /^05\d[-]?\d{7}$/;

export const CreateCustomerSchema = z.object({
  name: z.string().min(2, 'שם חייב להכיל לפחות 2 תווים'),
  phone: z.string().regex(ISRAELI_PHONE, 'פורמט טלפון לא תקין (לדוגמה: 050-1234567)'),
  email: z.string().email('כתובת אימייל לא תקינה').optional(),
  notes: z.string().optional(),
});

export const UpdateCustomerSchema = CreateCustomerSchema.partial();
