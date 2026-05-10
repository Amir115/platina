'use client';
import { useState, useEffect } from 'react';
import type { WorkOrderWithRelations, WorkOrderStatus } from '@/types';
import { WorkOrderCard } from '@/components/WorkOrderCard';
import { NewOrderModal } from '@/components/NewOrderModal';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';

export default function DashboardPage() {
  const [orders, setOrders] = useState<WorkOrderWithRelations[]>([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [refreshTick, setRefreshTick] = useState(0);

  useEffect(() => {
    const params = new URLSearchParams();
    if (search) params.set('search', search);
    if (statusFilter) params.set('status', statusFilter);
    fetch(`/api/work-orders?${params}`)
      .then((res) => (res.ok ? res.json() : []))
      .then(setOrders);
  }, [search, statusFilter, refreshTick]);

  function refresh() {
    setRefreshTick((t) => t + 1);
  }

  async function handleStatusChange(id: string, status: WorkOrderStatus) {
    await fetch(`/api/work-orders/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    refresh();
  }

  return (
    <main className="max-w-5xl mx-auto px-6 py-6" dir="rtl">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-gray-900">כרטיסי עבודה</h2>
        <Button onClick={() => setModalOpen(true)}>+ כרטיס חדש</Button>
      </div>

      <div className="flex gap-3 mb-6">
        <input
          type="text"
          placeholder="חיפוש לפי לקוח או לוחית רישוי..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 border border-gray-200 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">כל הסטטוסים</option>
          <option value="PENDING">ממתין</option>
          <option value="IN_PROGRESS">בטיפול</option>
          <option value="READY">מוכן</option>
          <option value="DELIVERED">נמסר</option>
        </select>
      </div>

      {orders.length === 0 ? (
        <EmptyState title="אין כרטיסי עבודה" description='לחץ על "+ כרטיס חדש" להתחיל' />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {orders.map((order) => (
            <WorkOrderCard key={order.id} order={order} onStatusChange={handleStatusChange} />
          ))}
        </div>
      )}

      <NewOrderModal open={modalOpen} onClose={() => setModalOpen(false)} onCreated={refresh} />
    </main>
  );
}
