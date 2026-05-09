import { describe, it, expect } from 'vitest';
import { CreateWorkOrderSchema, UpdateWorkOrderSchema } from '@/lib/validators/work-orders';

const validCreate = {
  customerName: 'דוד לוי',
  customerPhone: '050-123-456',
  licensePlate: 'ab-123-cd',
  vehicleMake: 'טויוטה',
  vehicleModel: 'קורולה',
  vehicleYear: 2020,
  description: 'בדיקת שמן ומסנן',
};

describe('CreateWorkOrderSchema', () => {
  it('accepts valid input', () => {
    const result = CreateWorkOrderSchema.safeParse(validCreate);
    expect(result.success).toBe(true);
  });

  it('uppercases license plate', () => {
    const result = CreateWorkOrderSchema.safeParse(validCreate);
    expect(result.success && result.data.licensePlate).toBe('AB-123-CD');
  });

  it('rejects customer name shorter than 2 chars', () => {
    const result = CreateWorkOrderSchema.safeParse({ ...validCreate, customerName: 'א' });
    expect(result.success).toBe(false);
  });

  it('rejects phone shorter than 9 chars', () => {
    const result = CreateWorkOrderSchema.safeParse({ ...validCreate, customerPhone: '050-123' });
    expect(result.success).toBe(false);
  });

  it('rejects year before 1980', () => {
    const result = CreateWorkOrderSchema.safeParse({ ...validCreate, vehicleYear: 1979 });
    expect(result.success).toBe(false);
  });

  it('rejects year more than 1 year ahead', () => {
    const result = CreateWorkOrderSchema.safeParse({
      ...validCreate,
      vehicleYear: new Date().getFullYear() + 2,
    });
    expect(result.success).toBe(false);
  });

  it('rejects description shorter than 3 chars', () => {
    const result = CreateWorkOrderSchema.safeParse({ ...validCreate, description: 'קצ' });
    expect(result.success).toBe(false);
  });

  it('accepts optional estimatedCost', () => {
    const result = CreateWorkOrderSchema.safeParse({ ...validCreate, estimatedCost: 350 });
    expect(result.success).toBe(true);
  });

  it('rejects negative estimatedCost', () => {
    const result = CreateWorkOrderSchema.safeParse({ ...validCreate, estimatedCost: -100 });
    expect(result.success).toBe(false);
  });
});

describe('UpdateWorkOrderSchema', () => {
  it('accepts an empty object — all fields are optional', () => {
    const result = UpdateWorkOrderSchema.safeParse({});
    expect(result.success).toBe(true);
  });

  it('accepts a valid status', () => {
    const result = UpdateWorkOrderSchema.safeParse({ status: 'IN_PROGRESS' });
    expect(result.success).toBe(true);
  });

  it('rejects an invalid status', () => {
    const result = UpdateWorkOrderSchema.safeParse({ status: 'UNKNOWN' });
    expect(result.success).toBe(false);
  });

  it('accepts a notes update', () => {
    const result = UpdateWorkOrderSchema.safeParse({ notes: 'יש לקנות חלפים' });
    expect(result.success).toBe(true);
  });

  it('rejects negative finalCost', () => {
    const result = UpdateWorkOrderSchema.safeParse({ finalCost: -50 });
    expect(result.success).toBe(false);
  });
});
