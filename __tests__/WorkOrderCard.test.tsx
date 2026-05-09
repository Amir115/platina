import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { WorkOrderCard } from '@/components/WorkOrderCard';
import type { WorkOrderWithRelations } from '@/types';

function makeOrder(overrides: Partial<WorkOrderWithRelations> = {}): WorkOrderWithRelations {
  return {
    id: 'order-1',
    orderNumber: 1001,
    status: 'PENDING',
    description: 'בדיקת שמן ומסנן',
    notes: null,
    estimatedCost: null,
    finalCost: null,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
    completedAt: null,
    customerId: 'cust-1',
    vehicleId: 'veh-1',
    customer: {
      id: 'cust-1',
      name: 'דוד לוי',
      phone: '0501234567',
      email: null,
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-01'),
    },
    vehicle: {
      id: 'veh-1',
      licensePlate: '12-345-67',
      make: 'טויוטה',
      model: 'קורולה',
      year: 2020,
      color: null,
      mileage: null,
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-01'),
    },
    ...overrides,
  } as WorkOrderWithRelations;
}

describe('WorkOrderCard', () => {
  it('renders customer name and phone', () => {
    render(<WorkOrderCard order={makeOrder()} onStatusChange={vi.fn()} />);
    expect(screen.getByText('דוד לוי')).toBeInTheDocument();
    expect(screen.getByText('0501234567')).toBeInTheDocument();
  });

  it('renders vehicle license plate', () => {
    render(<WorkOrderCard order={makeOrder()} onStatusChange={vi.fn()} />);
    expect(screen.getByText(/12-345-67/)).toBeInTheDocument();
  });

  it('renders description', () => {
    render(<WorkOrderCard order={makeOrder()} onStatusChange={vi.fn()} />);
    expect(screen.getByText('בדיקת שמן ומסנן')).toBeInTheDocument();
  });

  it('shows התחל טיפול CTA for PENDING', () => {
    render(<WorkOrderCard order={makeOrder({ status: 'PENDING' })} onStatusChange={vi.fn()} />);
    expect(screen.getByRole('button', { name: /התחל טיפול/ })).toBeInTheDocument();
  });

  it('shows סמן כמוכן CTA for IN_PROGRESS', () => {
    render(<WorkOrderCard order={makeOrder({ status: 'IN_PROGRESS' })} onStatusChange={vi.fn()} />);
    expect(screen.getByRole('button', { name: /סמן כמוכן/ })).toBeInTheDocument();
  });

  it('shows סמן כנמסר CTA for READY', () => {
    render(<WorkOrderCard order={makeOrder({ status: 'READY' })} onStatusChange={vi.fn()} />);
    expect(screen.getByRole('button', { name: /סמן כנמסר/ })).toBeInTheDocument();
  });

  it('hides CTA for DELIVERED', () => {
    render(<WorkOrderCard order={makeOrder({ status: 'DELIVERED' })} onStatusChange={vi.fn()} />);
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  it('calls onStatusChange with next status when CTA clicked', () => {
    const onStatusChange = vi.fn();
    render(
      <WorkOrderCard order={makeOrder({ status: 'PENDING' })} onStatusChange={onStatusChange} />,
    );
    fireEvent.click(screen.getByRole('button', { name: /התחל טיפול/ }));
    expect(onStatusChange).toHaveBeenCalledWith('order-1', 'IN_PROGRESS');
  });
});
