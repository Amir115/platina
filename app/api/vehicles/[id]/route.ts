import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getGarageContext } from '@/lib/garage-context';
import { UpdateVehicleSchema } from '@/lib/validators/vehicles';

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { garageId } = await getGarageContext();
  const { id } = await params;
  const vehicle = await prisma.vehicle.findFirst({
    where: { id, garageId },
    include: {
      customer: true,
      workOrders: {
        include: { customer: true },
        orderBy: { createdAt: 'desc' },
      },
    },
  });

  if (!vehicle) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  return NextResponse.json(vehicle);
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { garageId } = await getGarageContext();
    const { id } = await params;
    const body = await request.json();
    const parsed = UpdateVehicleSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }

    const existing = await prisma.vehicle.findFirst({ where: { id, garageId } });
    if (!existing) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    const vehicle = await prisma.vehicle.update({
      where: { id },
      data: parsed.data,
      include: { customer: true },
    });

    return NextResponse.json(vehicle);
  } catch (e) {
    console.error('[PATCH /api/vehicles/:id]', e);
    return NextResponse.json({ error: { formErrors: ['שגיאת שרת, נסה שנית'] } }, { status: 500 });
  }
}
