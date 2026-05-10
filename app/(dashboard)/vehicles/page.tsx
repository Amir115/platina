'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import type { VehicleWithCustomer } from '@/types';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { Spinner } from '@/components/ui/Spinner';
import { VehicleModal } from '@/components/VehicleModal';

export default function VehiclesPage() {
  const [vehicles, setVehicles] = useState<VehicleWithCustomer[] | null>(null);
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [refreshTick, setRefreshTick] = useState(0);
  const router = useRouter();

  useEffect(() => {
    const params = new URLSearchParams();
    if (search) params.set('search', search);
    fetch(`/api/vehicles?${params}`)
      .then((res) => (res.ok ? res.json() : []))
      .then(setVehicles);
  }, [search, refreshTick]);

  return (
    <main className="max-w-5xl mx-auto px-6 py-6" dir="rtl">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-gray-900">רכבים</h2>
        <Button onClick={() => setModalOpen(true)}>+ רכב חדש</Button>
      </div>

      <div className="mb-6">
        <input
          type="text"
          placeholder="חיפוש לפי לוחית רישוי, יצרן, דגם או לקוח..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full max-w-sm border border-gray-200 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {vehicles === null ? (
        <div className="flex justify-center py-20">
          <Spinner className="w-6 h-6 text-blue-500" />
        </div>
      ) : vehicles.length === 0 ? (
        <EmptyState
          title="אין רכבים"
          description={search ? 'לא נמצאו רכבים עבור החיפוש' : 'לחץ על "+ רכב חדש" להוסיף'}
          action={
            !search ? <Button onClick={() => setModalOpen(true)}>+ רכב חדש</Button> : undefined
          }
        />
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-right px-4 py-3 font-medium text-gray-600">לוחית רישוי</th>
                <th className="text-right px-4 py-3 font-medium text-gray-600">יצרן / דגם / שנה</th>
                <th className="text-right px-4 py-3 font-medium text-gray-600">לקוח</th>
                <th className="text-right px-4 py-3 font-medium text-gray-600">ק&quot;מ</th>
                <th className="text-right px-4 py-3 font-medium text-gray-600">כרטיסי עבודה</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {vehicles.map((vehicle) => (
                <tr
                  key={vehicle.id}
                  onClick={() => router.push(`/vehicles/${vehicle.id}`)}
                  className="hover:bg-gray-50 transition-colors cursor-pointer"
                >
                  <td className="px-4 py-3">
                    <span className="font-mono font-semibold text-gray-900 tracking-wider">
                      {vehicle.licensePlate}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-700">
                    {vehicle.make} {vehicle.model}{' '}
                    <span className="text-gray-400">{vehicle.year}</span>
                  </td>
                  <td className="px-4 py-3">
                    {vehicle.customer ? (
                      <Link
                        href={`/customers/${vehicle.customer.id}`}
                        onClick={(e) => e.stopPropagation()}
                        className="text-blue-600 hover:underline"
                      >
                        {vehicle.customer.name}
                      </Link>
                    ) : (
                      <span className="text-gray-400">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {vehicle.mileage != null ? vehicle.mileage.toLocaleString() : '—'}
                  </td>
                  <td className="px-4 py-3 text-gray-600">{vehicle._count.workOrders}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <VehicleModal
        key={modalOpen ? 'open' : 'closed'}
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSaved={(v) => {
          setRefreshTick((t) => t + 1);
          router.push(`/vehicles/${v.id}`);
        }}
      />
    </main>
  );
}
