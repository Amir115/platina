'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import type { Customer } from '@prisma/client';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { Spinner } from '@/components/ui/Spinner';
import { CustomerModal } from '@/components/CustomerModal';

type CustomerWithCount = Customer & { _count: { workOrders: number } };

export default function CustomersPage() {
  const [customers, setCustomers] = useState<CustomerWithCount[] | null>(null);
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [refreshTick, setRefreshTick] = useState(0);

  useEffect(() => {
    const params = new URLSearchParams();
    if (search) params.set('search', search);
    fetch(`/api/customers?${params}`)
      .then((res) => (res.ok ? res.json() : []))
      .then(setCustomers);
  }, [search, refreshTick]);

  return (
    <main className="max-w-5xl mx-auto px-6 py-6" dir="rtl">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-gray-900">לקוחות</h2>
        <Button onClick={() => setModalOpen(true)}>+ לקוח חדש</Button>
      </div>

      <div className="mb-6">
        <input
          type="text"
          placeholder="חיפוש לפי שם או טלפון..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full max-w-sm border border-gray-200 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {customers === null ? (
        <div className="flex justify-center py-20">
          <Spinner className="w-6 h-6 text-blue-500" />
        </div>
      ) : customers.length === 0 ? (
        <EmptyState
          title="אין לקוחות"
          description={search ? 'לא נמצאו לקוחות עבור החיפוש' : 'לחץ על "+ לקוח חדש" להוסיף'}
          action={
            !search ? <Button onClick={() => setModalOpen(true)}>+ לקוח חדש</Button> : undefined
          }
        />
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-right px-4 py-3 font-medium text-gray-600">שם</th>
                <th className="text-right px-4 py-3 font-medium text-gray-600">טלפון</th>
                <th className="text-right px-4 py-3 font-medium text-gray-600">אימייל</th>
                <th className="text-right px-4 py-3 font-medium text-gray-600">כרטיסי עבודה</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {customers.map((customer) => (
                <tr key={customer.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3">
                    <Link
                      href={`/customers/${customer.id}`}
                      className="font-medium text-blue-600 hover:underline"
                    >
                      {customer.name}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-gray-600">{customer.phone}</td>
                  <td className="px-4 py-3 text-gray-500">{customer.email ?? '—'}</td>
                  <td className="px-4 py-3 text-gray-600">{customer._count.workOrders}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <CustomerModal
        key={modalOpen ? 'open' : 'closed'}
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSaved={() => setRefreshTick((t) => t + 1)}
      />
    </main>
  );
}
