import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const CreateWorkOrderSchema = z.object({
  customerName: z.string().min(2),
  customerPhone: z.string().min(9),
  licensePlate: z
    .string()
    .min(2)
    .transform((s) => s.toUpperCase()),
  vehicleMake: z.string().min(1),
  vehicleModel: z.string().min(1),
  vehicleYear: z
    .number()
    .int()
    .min(1980)
    .max(new Date().getFullYear() + 1),
  description: z.string().min(3),
  estimatedCost: z.number().positive().optional(),
});

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const status = searchParams.get('status');
  const search = searchParams.get('search');

  const workOrders = await prisma.workOrder.findMany({
    where: {
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
  const body = await request.json();
  const parsed = CreateWorkOrderSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const data = parsed.data;

  let customer = await prisma.customer.findFirst({ where: { phone: data.customerPhone } });
  if (!customer) {
    customer = await prisma.customer.create({
      data: { name: data.customerName, phone: data.customerPhone },
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
      },
    });
  }

  const workOrder = await prisma.workOrder.create({
    data: {
      customerId: customer.id,
      vehicleId: vehicle.id,
      description: data.description,
      estimatedCost: data.estimatedCost,
      status: 'PENDING',
    },
    include: { customer: true, vehicle: true },
  });

  return NextResponse.json(workOrder, { status: 201 });
}
