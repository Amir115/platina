import { NextResponse } from 'next/server';
import { z } from 'zod';
import { fetchVehicleByPlate } from '@/lib/mot-api';

const QuerySchema = z.object({
  plate: z.string().min(1, 'plate is required'),
});

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const parsed = QuerySchema.safeParse({ plate: searchParams.get('plate') });

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  try {
    const vehicle = await fetchVehicleByPlate(parsed.data.plate);
    if (!vehicle) {
      return NextResponse.json({ error: 'vehicle not found' }, { status: 404 });
    }
    return NextResponse.json(vehicle);
  } catch (err) {
    console.error('[GET /api/vehicles/lookup]', err);
    return NextResponse.json({ error: 'external API error' }, { status: 500 });
  }
}
