import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getGarageContext } from '@/lib/garage-context';
import { CreateWorkOrderSchema } from '@/lib/validators/work-orders';

export async function GET(request: Request) {
  const { garageId } = await getGarageContext();
  const { searchParams } = new URL(request.url);
  const status = searchParams.get('status');
  const search = searchParams.get('search');

  const workOrders = await prisma.workOrder.findMany({
    where: {
      garageId,
      ...(status ? { status: status as 'PENDING' | 'IN_PROGRESS' | 'READY' | 'DELIVERED' } : {}),
      ...(search
        ? {
            OR: [
              { customer: { name: { contains: search, mode: 'insensitive' } } },
              { vehicle: { licensePlate: { contains: search, mode: 'insensitive' } } },
            ],
          }
        : {}),
    },
    include: { customer: true, vehicle: true },
    orderBy: { createdAt: 'desc' },
  });

  return NextResponse.json(workOrders);
}

export async function POST(request: Request) {
  const { garageId } = await getGarageContext();
  const body = await request.json();
  const parsed = CreateWorkOrderSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const data = parsed.data;

  let customer = await prisma.customer.findFirst({
    where: { phone: data.customerPhone, garageId },
  });
  if (!customer) {
    customer = await prisma.customer.create({
      data: { name: data.customerName, phone: data.customerPhone, garageId },
    });
  }

  let vehicle = await prisma.vehicle.findUnique({ where: { licensePlate: data.licensePlate } });
  if (!vehicle) {
    vehicle = await prisma.vehicle.create({
      data: {
        licensePlate: data.licensePlate,
        make: data.vehicleMake,
        model: data.vehicleModel,
        year: data.vehicleYear,
        customerId: customer.id,
        garageId,
        ...(data.mileage !== undefined ? { mileage: data.mileage } : {}),
      },
    });
  } else {
    const updates: { customerId?: string; mileage?: number } = {};
    if (!vehicle.customerId) updates.customerId = customer.id;
    if (data.mileage !== undefined) updates.mileage = data.mileage;
    if (Object.keys(updates).length > 0) {
      vehicle = await prisma.vehicle.update({ where: { id: vehicle.id }, data: updates });
    }
  }

  const workOrder = await prisma.workOrder.create({
    data: {
      customerId: customer.id,
      vehicleId: vehicle.id,
      garageId,
      description: data.description,
      estimatedCost: data.estimatedCost,
      status: 'PENDING',
    },
    include: { customer: true, vehicle: true },
  });

  return NextResponse.json(workOrder, { status: 201 });
}
