import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getGarageContext } from '@/lib/garage-context';
import { CreateCustomerSchema } from '@/lib/validators/customers';

export async function GET(request: Request) {
  const { garageId } = await getGarageContext();
  const { searchParams } = new URL(request.url);
  const search = searchParams.get('search');
  const phone = searchParams.get('phone');

  const customers = await prisma.customer.findMany({
    where: phone
      ? { garageId, phone }
      : search
        ? {
            garageId,
            OR: [
              { name: { contains: search, mode: 'insensitive' } },
              { phone: { contains: search, mode: 'insensitive' } },
            ],
          }
        : { garageId },
    include: { _count: { select: { workOrders: true } } },
    orderBy: { createdAt: 'desc' },
  });

  return NextResponse.json(customers);
}

export async function POST(request: Request) {
  try {
    const { garageId } = await getGarageContext();
    const body = await request.json();
    const parsed = CreateCustomerSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }

    const existing = await prisma.customer.findFirst({
      where: { phone: parsed.data.phone, garageId },
    });
    if (existing) {
      return NextResponse.json(
        { error: { fieldErrors: { phone: ['מספר טלפון כבר קיים במערכת'] } } },
        { status: 409 },
      );
    }

    const customer = await prisma.customer.create({ data: { ...parsed.data, garageId } });
    return NextResponse.json(customer, { status: 201 });
  } catch (e) {
    console.error('[POST /api/customers]', e);
    return NextResponse.json({ error: { formErrors: ['שגיאת שרת, נסה שנית'] } }, { status: 500 });
  }
}
