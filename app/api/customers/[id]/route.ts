import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getGarageContext } from '@/lib/garage-context';
import { UpdateCustomerSchema } from '@/lib/validators/customers';

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { garageId } = await getGarageContext();
  const { id } = await params;
  const customer = await prisma.customer.findFirst({
    where: { id, garageId },
    include: {
      workOrders: {
        include: { vehicle: true },
        orderBy: { createdAt: 'desc' },
      },
    },
  });

  if (!customer) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  return NextResponse.json(customer);
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { garageId } = await getGarageContext();
    const { id } = await params;
    const body = await request.json();
    const parsed = UpdateCustomerSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }

    const existing = await prisma.customer.findFirst({ where: { id, garageId } });
    if (!existing) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    if (parsed.data.phone) {
      const conflict = await prisma.customer.findFirst({
        where: { phone: parsed.data.phone, garageId, NOT: { id } },
      });
      if (conflict) {
        return NextResponse.json(
          { error: { fieldErrors: { phone: ['מספר טלפון כבר קיים במערכת'] } } },
          { status: 409 },
        );
      }
    }

    const customer = await prisma.customer.update({
      where: { id },
      data: parsed.data,
    });

    return NextResponse.json(customer);
  } catch (e) {
    console.error('[PATCH /api/customers/:id]', e);
    return NextResponse.json({ error: { formErrors: ['שגיאת שרת, נסה שנית'] } }, { status: 500 });
  }
}
