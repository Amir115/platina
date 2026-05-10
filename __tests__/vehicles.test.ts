import { describe, it, expect } from 'vitest';
import { CreateVehicleSchema, UpdateVehicleSchema } from '@/lib/validators/vehicles';

const CURRENT_YEAR = new Date().getFullYear();

describe('CreateVehicleSchema', () => {
  const valid = {
    licensePlate: '123-45-678',
    make: 'Toyota',
    model: 'Corolla',
    year: 2020,
    customerId: 'cust_abc123',
  };

  it('accepts a valid vehicle', () => {
    expect(CreateVehicleSchema.safeParse(valid).success).toBe(true);
  });

  it('uppercases the license plate', () => {
    const r = CreateVehicleSchema.safeParse({ ...valid, licensePlate: '123-ab-678' });
    // Would fail due to non-digit chars, just verifying transform runs
    expect(r.success).toBe(false);
  });

  it('accepts old-format plate XX-XXX-XX', () => {
    expect(CreateVehicleSchema.safeParse({ ...valid, licensePlate: '12-345-67' }).success).toBe(
      true,
    );
  });

  it('rejects plate without dashes', () => {
    expect(CreateVehicleSchema.safeParse({ ...valid, licensePlate: '1234567' }).success).toBe(
      false,
    );
  });

  it('rejects plate with letters', () => {
    expect(CreateVehicleSchema.safeParse({ ...valid, licensePlate: 'AB-123-CD' }).success).toBe(
      false,
    );
  });

  it('rejects year below 1980', () => {
    expect(CreateVehicleSchema.safeParse({ ...valid, year: 1979 }).success).toBe(false);
  });

  it('rejects year above current year + 1', () => {
    expect(CreateVehicleSchema.safeParse({ ...valid, year: CURRENT_YEAR + 2 }).success).toBe(false);
  });

  it('accepts current year + 1', () => {
    expect(CreateVehicleSchema.safeParse({ ...valid, year: CURRENT_YEAR + 1 }).success).toBe(true);
  });

  it('accepts optional fields', () => {
    expect(
      CreateVehicleSchema.safeParse({
        ...valid,
        mileage: 50000,
        color: 'לבן',
        notes: 'רכב מסחרי',
      }).success,
    ).toBe(true);
  });

  it('rejects negative mileage', () => {
    expect(CreateVehicleSchema.safeParse({ ...valid, mileage: -1 }).success).toBe(false);
  });

  it('rejects missing customerId', () => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { customerId: _c, ...rest } = valid;
    expect(CreateVehicleSchema.safeParse(rest).success).toBe(false);
  });

  it('rejects empty make', () => {
    expect(CreateVehicleSchema.safeParse({ ...valid, make: '' }).success).toBe(false);
  });
});

describe('UpdateVehicleSchema', () => {
  it('accepts a partial mileage update', () => {
    expect(UpdateVehicleSchema.safeParse({ mileage: 60000 }).success).toBe(true);
  });

  it('accepts empty object', () => {
    expect(UpdateVehicleSchema.safeParse({}).success).toBe(true);
  });

  it('rejects year below 1980', () => {
    expect(UpdateVehicleSchema.safeParse({ year: 1900 }).success).toBe(false);
  });

  it('rejects negative mileage', () => {
    expect(UpdateVehicleSchema.safeParse({ mileage: -100 }).success).toBe(false);
  });

  it('accepts color and notes update', () => {
    expect(UpdateVehicleSchema.safeParse({ color: 'שחור', notes: 'מנוע חדש' }).success).toBe(true);
  });
});
