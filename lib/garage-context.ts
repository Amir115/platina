import { auth } from '@clerk/nextjs/server';
import { prisma } from './prisma';

export async function getGarageContext() {
  const { userId } = await auth();
  if (!userId) throw new Error('Unauthorized');

  const garage = await prisma.garage.findUnique({
    where: { clerkUserId: userId },
  });
  if (!garage) throw new Error('Garage not found — complete onboarding');

  return { userId, garageId: garage.id, garage };
}
