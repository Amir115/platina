import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';
import { OnboardingSchema } from '@/lib/validators/onboarding';

export async function POST(request: Request) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();
  const parsed = OnboardingSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const { garageName, phone, city } = parsed.data;

  const existing = await prisma.garage.findUnique({ where: { clerkUserId: userId } });
  if (existing) {
    return NextResponse.json({ garageId: existing.id });
  }

  const garage = await prisma.garage.create({
    data: { name: garageName, phone, city, clerkUserId: userId },
  });

  return NextResponse.json({ garageId: garage.id }, { status: 201 });
}
