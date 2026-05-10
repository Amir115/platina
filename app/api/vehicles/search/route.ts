import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const plate = searchParams.get('plate') ?? '';

  if (plate.length < 2) {
    return NextResponse.json([]);
  }

  const vehicles = await prisma.vehicle.findMany({
    where: {
      licensePlate: { contains: plate.toUpperCase(), mode: 'insensitive' },
    },
    include: { customer: true },
    take: 8,
    orderBy: { licensePlate: 'asc' },
  });

  return NextResponse.json(vehicles);
}
