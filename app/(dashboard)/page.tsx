'use client'
import { useState, useEffect, useCallback } from 'react'
import type { WorkOrderWithRelations, WorkOrderStatus } from '@/types'
import { WorkOrderCard } from '@/components/WorkOrderCard'
import { NewOrderModal } from '@/components/NewOrderModal'

export default function DashboardPage() {
  const [orders, setOrders]           = useState<WorkOrderWithRelations[]>([])
  const [search, setSearch]           = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [modalOpen, setModalOpen]     = useState(false)

  const fetchOrders = useCallback(async () => {
    const params = new URLSearchParams()
    if (search)       params.set('search', search)
    if (statusFilter) params.set('status', statusFilter)
    const res = await fetch(`/api/work-orders?${params}`)
    if (res.ok) setOrders(await res.json())
  }, [search, statusFilter])

  useEffect(() => { fetchOrders() }, [fetchOrders])

  async function handleStatusChange(id: string, status: WorkOrderStatus) {
    await fetch(`/api/work-orders/${id}`, {
      method:  'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ status }),
    })
    fetchOrders()
  }

  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <h1 className="text-xl font-bold text-gray-900">פלטינה</h1>
          <button
            onClick={() => setModalOpen(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
          >
            + כרטיס חדש
          </button>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-6">
        <div className="flex gap-3 mb-6">
          <input
            type="text"
            placeholder="חיפוש לפי לקוח או לוחית רישוי..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="flex-1 border border-gray-200 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
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
          <div className="text-center py-20 text-gray-400">
            <p className="text-lg">אין כרטיסי עבודה</p>
            <p className="text-sm mt-1">לחץ על &quot;+ כרטיס חדש&quot; להתחיל</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {orders.map(order => (
              <WorkOrderCard
                key={order.id}
                order={order}
                onStatusChange={handleStatusChange}
              />
            ))}
          </div>
        )}
      </main>

      <NewOrderModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onCreated={fetchOrders}
      />
    </div>
  )
}
