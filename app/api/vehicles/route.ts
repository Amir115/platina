import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { CreateVehicleSchema } from '@/lib/validators/vehicles';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const search = searchParams.get('search');
  const customerId = searchParams.get('customerId');

  const vehicles = await prisma.vehicle.findMany({
    where: customerId
      ? { customerId }
      : search
        ? {
            OR: [
              { licensePlate: { contains: search, mode: 'insensitive' } },
              { make: { contains: search, mode: 'insensitive' } },
              { model: { contains: search, mode: 'insensitive' } },
              { customer: { name: { contains: search, mode: 'insensitive' } } },
            ],
          }
        : undefined,
    include: {
      customer: true,
      _count: { select: { workOrders: true } },
    },
    orderBy: { createdAt: 'desc' },
  });

  return NextResponse.json(vehicles);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = CreateVehicleSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }

    const existing = await prisma.vehicle.findUnique({
      where: { licensePlate: parsed.data.licensePlate },
    });
    if (existing) {
      return NextResponse.json(
        { error: { fieldErrors: { licensePlate: ['לוחית רישוי כבר קיימת במערכת'] } } },
        { status: 409 },
      );
    }

    const vehicle = await prisma.vehicle.create({
      data: parsed.data,
      include: { customer: true },
    });
    return NextResponse.json(vehicle, { status: 201 });
  } catch (e) {
    console.error('[POST /api/vehicles]', e);
    return NextResponse.json({ error: { formErrors: ['שגיאת שרת, נסה שנית'] } }, { status: 500 });
  }
}
