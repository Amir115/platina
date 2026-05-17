import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getGarageContext } from '@/lib/garage-context';

export async function GET(request: Request) {
  const { garageId } = await getGarageContext();
  const { searchParams } = new URL(request.url);
  const plate = searchParams.get('plate') ?? '';

  if (plate.length < 2) {
    return NextResponse.json([]);
  }

  const vehicles = await prisma.vehicle.findMany({
    where: {
      garageId,
      licensePlate: { contains: plate.toUpperCase(), mode: 'insensitive' },
    },
    include: { customer: true },
    take: 8,
    orderBy: { licensePlate: 'asc' },
  });

  return NextResponse.json(vehicles);
}
