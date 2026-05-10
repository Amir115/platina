import type { Customer, Vehicle, WorkOrder, WorkOrderStatus } from '@prisma/client';

export type CustomerWithRelations = Customer & {
  workOrders: (WorkOrder & { vehicle: Vehicle })[];
};

export type { WorkOrderStatus };

export type WorkOrderWithRelations = WorkOrder & {
  customer: Customer;
  vehicle: Vehicle;
};

export type CreateWorkOrderInput = {
  customerName: string;
  customerPhone: string;
  licensePlate: string;
  vehicleMake: string;
  vehicleModel: string;
  vehicleYear: number;
  description: string;
  estimatedCost?: number;
};

export type UpdateWorkOrderInput = {
  status?: WorkOrderStatus;
  notes?: string;
  finalCost?: number;
};

export const STATUS_LABELS: Record<WorkOrderStatus, string> = {
  PENDING: 'ממתין',
  IN_PROGRESS: 'בטיפול',
  READY: 'מוכן',
  DELIVERED: 'נמסר',
};

export const STATUS_TRANSITIONS: Partial<Record<WorkOrderStatus, WorkOrderStatus>> = {
  PENDING: 'IN_PROGRESS',
  IN_PROGRESS: 'READY',
  READY: 'DELIVERED',
};

export const STATUS_CTA: Partial<Record<WorkOrderStatus, string>> = {
  PENDING: 'התחל טיפול',
  IN_PROGRESS: 'סמן כמוכן',
  READY: 'סמן כנמסר',
};
