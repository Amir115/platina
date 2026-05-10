'use client';
import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import type { Vehicle, WorkOrder } from '@prisma/client';
import type { CustomerWithRelations } from '@/types';
import { Button } from '@/components/ui/Button';
import { Spinner } from '@/components/ui/Spinner';
import { EmptyState } from '@/components/ui/EmptyState';
import { StatusBadge } from '@/components/StatusBadge';
import { CustomerModal } from '@/components/CustomerModal';
import { NewOrderModal } from '@/components/NewOrderModal';

type WorkOrderWithVehicle = WorkOrder & { vehicle: Vehicle };

export default function CustomerDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [customer, setCustomer] = useState<CustomerWithRelations | null>(null);
  const [editOpen, setEditOpen] = useState(false);
  const [newOrderOpen, setNewOrderOpen] = useState(false);
  const [refreshTick, setRefreshTick] = useState(0);

  useEffect(() => {
    fetch(`/api/customers/${id}`)
      .then((res) => {
        if (res.status === 404) {
          router.push('/customers');
          return null;
        }
        return res.ok ? res.json() : null;
      })
      .then((data) => {
        if (data) setCustomer(data);
      });
  }, [id, refreshTick, router]);

  const vehicles = customer
    ? [
        ...new Map(
          (customer.workOrders as WorkOrderWithVehicle[]).map((wo) => [wo.vehicle.id, wo.vehicle]),
        ).values(),
      ]
    : [];

  if (!customer) {
    return (
      <div className="flex justify-center py-32">
        <Spinner className="w-6 h-6 text-blue-500" />
      </div>
    );
  }

  return (
    <main className="max-w-5xl mx-auto px-6 py-6" dir="rtl">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Link href="/customers" className="text-sm text-blue-600 hover:underline">
            ← לקוחות
          </Link>
          <h2 className="text-lg font-semibold text-gray-900">{customer.name}</h2>
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

      <div className="bg-white rounded-xl border border-gray-200 p-5 mb-6 grid grid-cols-2 gap-4 text-sm">
        <div>
          <p className="text-gray-500 mb-0.5">שם מלא</p>
          <p className="font-medium">{customer.name}</p>
        </div>
        <div>
          <p className="text-gray-500 mb-0.5">טלפון</p>
          <p className="font-medium">{customer.phone}</p>
        </div>
        {customer.email && (
          <div>
            <p className="text-gray-500 mb-0.5">אימייל</p>
            <p className="font-medium">{customer.email}</p>
          </div>
        )}
        {customer.notes && (
          <div className="col-span-2">
            <p className="text-gray-500 mb-0.5">הערות</p>
            <p className="text-gray-700">{customer.notes}</p>
          </div>
        )}
      </div>

      {vehicles.length > 0 && (
        <div className="mb-6">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">רכבים</h3>
          <div className="flex flex-wrap gap-2">
            {vehicles.map((v) => (
              <Link
                key={v.id}
                href={`/vehicles/${v.id}`}
                className="bg-gray-100 hover:bg-blue-50 text-gray-700 text-sm px-3 py-1.5 rounded-lg font-medium transition-colors"
              >
                {v.make} {v.model} {v.year} · <span className="font-mono">{v.licensePlate}</span>
              </Link>
            ))}
          </div>
        </div>
      )}

      <div>
        <h3 className="text-sm font-semibold text-gray-700 mb-3">
          היסטוריית כרטיסי עבודה ({customer.workOrders.length})
        </h3>
        {customer.workOrders.length === 0 ? (
          <EmptyState title="אין כרטיסי עבודה" description='לחץ על "+ כרטיס עבודה" ליצור אחד' />
        ) : (
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-right px-4 py-3 font-medium text-gray-600">#</th>
                  <th className="text-right px-4 py-3 font-medium text-gray-600">רכב</th>
                  <th className="text-right px-4 py-3 font-medium text-gray-600">תיאור</th>
                  <th className="text-right px-4 py-3 font-medium text-gray-600">סטטוס</th>
                  <th className="text-right px-4 py-3 font-medium text-gray-600">תאריך</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {(customer.workOrders as WorkOrderWithVehicle[]).map((wo) => (
                  <tr key={wo.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 text-gray-500">#{wo.orderNumber}</td>
                    <td className="px-4 py-3">{wo.vehicle.licensePlate}</td>
                    <td className="px-4 py-3 text-gray-700 max-w-xs truncate">{wo.description}</td>
                    <td className="px-4 py-3">
                      <StatusBadge status={wo.status} />
                    </td>
                    <td className="px-4 py-3 text-gray-500">
                      {new Date(wo.createdAt).toLocaleDateString('he-IL')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <CustomerModal
        key={editOpen ? 'edit-open' : 'edit-closed'}
        open={editOpen}
        onClose={() => setEditOpen(false)}
        onSaved={() => setRefreshTick((t) => t + 1)}
        customer={customer}
      />

      <NewOrderModal
        key={newOrderOpen ? 'order-open' : 'order-closed'}
        open={newOrderOpen}
        onClose={() => setNewOrderOpen(false)}
        onCreated={() => setRefreshTick((t) => t + 1)}
        prefillCustomer={{ name: customer.name, phone: customer.phone }}
      />
    </main>
  );
}
