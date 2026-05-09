import type { WorkOrderWithRelations, WorkOrderStatus } from '@/types';
import { STATUS_TRANSITIONS, STATUS_CTA } from '@/types';
import { StatusBadge } from './StatusBadge';

interface WorkOrderCardProps {
  order: WorkOrderWithRelations;
  onStatusChange: (id: string, status: WorkOrderStatus) => void;
}

export function WorkOrderCard({ order, onStatusChange }: WorkOrderCardProps) {
  const nextStatus = STATUS_TRANSITIONS[order.status];

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm flex flex-col gap-3">
      <div className="flex items-start justify-between">
        <span className="text-xs font-mono text-gray-400">#{order.orderNumber}</span>
        <StatusBadge status={order.status} />
      </div>

      <div>
        <p className="font-semibold text-gray-900">{order.customer.name}</p>
        <p className="text-sm text-gray-500">{order.customer.phone}</p>
      </div>

      <div className="text-sm text-gray-600">
        <span className="font-medium">{order.vehicle.licensePlate}</span>
        {' · '}
        {order.vehicle.make} {order.vehicle.model} {order.vehicle.year}
      </div>

      <p className="text-sm text-gray-700 line-clamp-2">{order.description}</p>

      {nextStatus && (
        <button
          onClick={() => onStatusChange(order.id, nextStatus)}
          className="mt-auto text-sm font-medium text-blue-600 hover:text-blue-800 text-start"
        >
          {STATUS_CTA[order.status]} ←
        </button>
      )}
    </div>
  );
}
