import { z } from 'zod';

export const OnboardingSchema = z.object({
  garageName: z.string().min(2, 'שם המוסך חייב להכיל לפחות 2 תווים'),
  phone: z.string().regex(/^05\d{8}$/, 'מספר טלפון לא תקין — נדרש מספר ישראלי שמתחיל ב-05'),
  city: z.string().min(2, 'עיר חייבת להכיל לפחות 2 תווים'),
});

export type OnboardingInput = z.infer<typeof OnboardingSchema>;
