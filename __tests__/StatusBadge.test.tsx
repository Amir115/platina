import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { StatusBadge } from '@/components/StatusBadge';

describe('StatusBadge', () => {
  it('renders ממתין for PENDING', () => {
    render(<StatusBadge status="PENDING" />);
    expect(screen.getByText('ממתין')).toBeInTheDocument();
  });

  it('renders בטיפול for IN_PROGRESS', () => {
    render(<StatusBadge status="IN_PROGRESS" />);
    expect(screen.getByText('בטיפול')).toBeInTheDocument();
  });

  it('renders מוכן for READY', () => {
    render(<StatusBadge status="READY" />);
    expect(screen.getByText('מוכן')).toBeInTheDocument();
  });

  it('renders נמסר for DELIVERED', () => {
    render(<StatusBadge status="DELIVERED" />);
    expect(screen.getByText('נמסר')).toBeInTheDocument();
  });
});
