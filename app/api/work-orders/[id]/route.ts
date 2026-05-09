import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const UpdateWorkOrderSchema = z.object({
  status: z.enum(['PENDING', 'IN_PROGRESS', 'READY', 'DELIVERED']).optional(),
  notes: z.string().optional(),
  finalCost: z.number().positive().optional(),
});

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const workOrder = await prisma.workOrder.findUnique({
    where: { id },
    include: { customer: true, vehicle: true },
  });

  if (!workOrder) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  return NextResponse.json(workOrder);
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await request.json();
  const parsed = UpdateWorkOrderSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const completedAt = parsed.data.status === 'DELIVERED' ? new Date() : undefined;

  const workOrder = await prisma.workOrder.update({
    where: { id },
    data: { ...parsed.data, ...(completedAt ? { completedAt } : {}) },
    include: { customer: true, vehicle: true },
  });

  return NextResponse.json(workOrder);
}
