'use client';
import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import type { WorkOrder, Customer } from '@prisma/client';
import type { VehicleWithRelations } from '@/types';
import { Button } from '@/components/ui/Button';
import { Spinner } from '@/components/ui/Spinner';
import { EmptyState } from '@/components/ui/EmptyState';
import { StatusBadge } from '@/components/StatusBadge';
import { VehicleModal } from '@/components/VehicleModal';
import { NewOrderModal } from '@/components/NewOrderModal';

type WorkOrderWithCustomer = WorkOrder & { customer: Customer };

function MileageEditor({
  vehicleId,
  mileage,
  onUpdated,
}: {
  vehicleId: string;
  mileage: number | null;
  onUpdated: (newMileage: number) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(mileage != null ? String(mileage) : '');
  const [saving, setSaving] = useState(false);

  async function save() {
    const num = parseInt(value);
    if (isNaN(num) || num < 0) return;
    setSaving(true);
    const res = await fetch(`/api/vehicles/${vehicleId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ mileage: num }),
    });
    if (res.ok) {
      onUpdated(num);
      setEditing(false);
    }
    setSaving(false);
  }

  if (editing) {
    return (
      <div className="flex items-center gap-2">
        <input
          type="number"
          min={0}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm w-32 focus:outline-none focus:ring-2 focus:ring-blue-500"
          autoFocus
        />
        <Button size="sm" onClick={save} disabled={saving}>
          {saving ? '...' : 'שמור'}
        </Button>
        <Button size="sm" variant="ghost" onClick={() => setEditing(false)}>
          ביטול
        </Button>
      </div>
    );
  }

  return (
    <button
      onClick={() => {
        setValue(mileage != null ? String(mileage) : '');
        setEditing(true);
      }}
      className="text-sm text-gray-700 hover:text-blue-600 transition-colors group flex items-center gap-1.5"
    >
      <span className="font-medium">
        {mileage != null ? `${mileage.toLocaleString()} ק"מ` : 'עדיין לא הוזן'}
      </span>
      <span className="text-gray-400 group-hover:text-blue-500 text-xs">עדכון</span>
    </button>
  );
}

export default function VehicleDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [vehicle, setVehicle] = useState<VehicleWithRelations | null>(null);
  const [mileage, setMileage] = useState<number | null>(null);
  const [editOpen, setEditOpen] = useState(false);
  const [newOrderOpen, setNewOrderOpen] = useState(false);
  const [refreshTick, setRefreshTick] = useState(0);

  useEffect(() => {
    fetch(`/api/vehicles/${id}`)
      .then((res) => {
        if (res.status === 404) {
          router.push('/vehicles');
          return null;
        }
        return res.ok ? res.json() : null;
      })
      .then((data) => {
        if (data) {
          setVehicle(data);
          setMileage(data.mileage);
        }
      });
  }, [id, refreshTick, router]);

  if (!vehicle) {
    return (
      <div className="flex justify-center py-32">
        <Spinner className="w-6 h-6 text-blue-500" />
      </div>
    );
  }

  return (
    <main className="max-w-5xl mx-auto px-6 py-6" dir="rtl">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div className="flex items-center gap-3">
          <Link href="/vehicles" className="text-sm text-blue-600 hover:underline">
            ← רכבים
          </Link>
          <div>
            <h2 className="text-2xl font-mono font-bold text-gray-900 tracking-wider">
              {vehicle.licensePlate}
            </h2>
            <p className="text-sm text-gray-500 mt-0.5">
              {vehicle.make} {vehicle.model} {vehicle.year}
              {vehicle.color && (
                <span className="mr-2 px-2 py-0.5 bg-gray-100 rounded-full text-xs">
                  {vehicle.color}
                </span>
              )}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" size="sm" onClick={() => setEditOpen(true)}>
            עריכה
          </Button>
          <Button size="sm" onClick={() => setNewOrderOpen(true)}>
            + כרטיס עבודה
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        {/* Customer card */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">לקוח</h3>
          {vehicle.customer ? (
            <div className="space-y-1.5 text-sm">
              <Link
                href={`/customers/${vehicle.customer.id}`}
                className="font-semibold text-blue-600 hover:underline"
              >
                {vehicle.customer.name}
              </Link>
              <p>
                <a
                  href={`tel:${vehicle.customer.phone}`}
                  className="text-gray-700 hover:text-blue-600"
                >
                  {vehicle.customer.phone}
                </a>
              </p>
              {vehicle.customer.email && <p className="text-gray-500">{vehicle.customer.email}</p>}
            </div>
          ) : (
            <p className="text-sm text-gray-400">לא משויך ללקוח</p>
          )}
        </div>

        {/* Mileage card */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
            קילומטראז&apos;
          </h3>
          <MileageEditor
            vehicleId={vehicle.id}
            mileage={mileage}
            onUpdated={(v) => setMileage(v)}
          />
        </div>
      </div>

      {/* Service history */}
      <div>
        <h3 className="text-sm font-semibold text-gray-700 mb-3">
          היסטוריית שירות ({vehicle.workOrders.length})
        </h3>
        {vehicle.workOrders.length === 0 ? (
          <EmptyState title="אין כרטיסי עבודה" description='לחץ על "+ כרטיס עבודה" ליצור אחד' />
        ) : (
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-right px-4 py-3 font-medium text-gray-600">#</th>
                  <th className="text-right px-4 py-3 font-medium text-gray-600">תאריך</th>
                  <th className="text-right px-4 py-3 font-medium text-gray-600">תיאור</th>
                  <th className="text-right px-4 py-3 font-medium text-gray-600">סטטוס</th>
                  <th className="text-right px-4 py-3 font-medium text-gray-600">עלות</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {(vehicle.workOrders as WorkOrderWithCustomer[]).map((wo) => (
                  <tr key={wo.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 text-gray-500">#{wo.orderNumber}</td>
                    <td className="px-4 py-3 text-gray-500">
                      {new Date(wo.createdAt).toLocaleDateString('he-IL')}
                    </td>
                    <td className="px-4 py-3 text-gray-700 max-w-xs truncate">{wo.description}</td>
                    <td className="px-4 py-3">
                      <StatusBadge status={wo.status} />
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {wo.finalCost != null
                        ? `₪${Number(wo.finalCost).toLocaleString()}`
                        : wo.estimatedCost != null
                          ? `~₪${Number(wo.estimatedCost).toLocaleString()}`
                          : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <VehicleModal
        key={editOpen ? 'edit-open' : 'edit-closed'}
        open={editOpen}
        onClose={() => setEditOpen(false)}
        onSaved={() => setRefreshTick((t) => t + 1)}
        vehicle={vehicle}
      />

      <NewOrderModal
        key={newOrderOpen ? 'order-open' : 'order-closed'}
        open={newOrderOpen}
        onClose={() => setNewOrderOpen(false)}
        onCreated={() => setRefreshTick((t) => t + 1)}
        prefillCustomer={
          vehicle.customer
            ? { name: vehicle.customer.name, phone: vehicle.customer.phone }
            : undefined
        }
        prefillVehicle={{
          licensePlate: vehicle.licensePlate,
          make: vehicle.make,
          model: vehicle.model,
          year: vehicle.year,
        }}
      />
    </main>
  );
}
