import type { WorkOrderStatus } from '@prisma/client'
import { STATUS_LABELS } from '@/types'

const STATUS_COLORS: Record<WorkOrderStatus, string> = {
  PENDING:     'bg-yellow-100 text-yellow-800',
  IN_PROGRESS: 'bg-blue-100 text-blue-800',
  READY:       'bg-green-100 text-green-800',
  DELIVERED:   'bg-gray-100 text-gray-500',
}

export function StatusBadge({ status }: { status: WorkOrderStatus }) {
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[status]}`}>
      {STATUS_LABELS[status]}
    </span>
  )
}
