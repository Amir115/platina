import { describe, it, expect, vi, beforeEach } from 'vitest';
import { OnboardingSchema } from '@/lib/validators/onboarding';

// --- OnboardingSchema tests ---

describe('OnboardingSchema', () => {
  const valid = { garageName: 'מוסך כהן', phone: '0501234567', city: 'תל אביב' };

  it('accepts valid input', () => {
    expect(OnboardingSchema.safeParse(valid).success).toBe(true);
  });

  it('rejects phone not starting with 05', () => {
    const r = OnboardingSchema.safeParse({ ...valid, phone: '0612345678' });
    expect(r.success).toBe(false);
  });

  it('rejects phone shorter than 10 digits', () => {
    const r = OnboardingSchema.safeParse({ ...valid, phone: '050123456' });
    expect(r.success).toBe(false);
  });

  it('rejects phone longer than 10 digits', () => {
    const r = OnboardingSchema.safeParse({ ...valid, phone: '05012345678' });
    expect(r.success).toBe(false);
  });

  it('rejects missing garageName', () => {
    const r = OnboardingSchema.safeParse({ phone: '0501234567', city: 'תל אביב' });
    expect(r.success).toBe(false);
  });

  it('rejects garageName shorter than 2 chars', () => {
    const r = OnboardingSchema.safeParse({ ...valid, garageName: 'א' });
    expect(r.success).toBe(false);
  });

  it('rejects missing city', () => {
    const r = OnboardingSchema.safeParse({ garageName: 'מוסך', phone: '0501234567' });
    expect(r.success).toBe(false);
  });
});

// --- getGarageContext tests ---

vi.mock('@clerk/nextjs/server', () => ({
  auth: vi.fn(),
}));

vi.mock('@/lib/prisma', () => ({
  prisma: {
    garage: {
      findUnique: vi.fn(),
    },
  },
}));

import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';
import { getGarageContext } from '@/lib/garage-context';

const mockAuth = auth as unknown as ReturnType<typeof vi.fn>;
const mockFindUnique = prisma.garage.findUnique as ReturnType<typeof vi.fn>;

beforeEach(() => {
  vi.clearAllMocks();
});

describe('getGarageContext', () => {
  it('throws Unauthorized when no userId', async () => {
    mockAuth.mockResolvedValue({ userId: null });
    await expect(getGarageContext()).rejects.toThrow('Unauthorized');
  });

  it('throws Garage not found when garage does not exist', async () => {
    mockAuth.mockResolvedValue({ userId: 'user_123' });
    mockFindUnique.mockResolvedValue(null);
    await expect(getGarageContext()).rejects.toThrow('Garage not found — complete onboarding');
  });

  it('returns context when garage exists', async () => {
    const garage = { id: 'garage_abc', name: 'מוסך כהן', clerkUserId: 'user_123' };
    mockAuth.mockResolvedValue({ userId: 'user_123' });
    mockFindUnique.mockResolvedValue(garage);

    const ctx = await getGarageContext();
    expect(ctx.userId).toBe('user_123');
    expect(ctx.garageId).toBe('garage_abc');
    expect(ctx.garage).toEqual(garage);
  });
});
