'use client';
import { useState } from 'react';
import type { Customer } from '@prisma/client';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';

interface CustomerModalProps {
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
  customer?: Customer;
}

interface FormState {
  name: string;
  phone: string;
  email: string;
  notes: string;
}

export function CustomerModal({ open, onClose, onSaved, customer }: CustomerModalProps) {
  const [form, setForm] = useState<FormState>({
    name: customer?.name ?? '',
    phone: customer?.phone ?? '',
    email: customer?.email ?? '',
    notes: customer?.notes ?? '',
  });
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({});
  const [loading, setLoading] = useState(false);
  const [phoneChecking, setPhoneChecking] = useState(false);

  function set(key: keyof FormState, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
    setErrors((e) => ({ ...e, [key]: undefined }));
  }

  async function checkPhoneUniqueness() {
    if (!form.phone || form.phone === customer?.phone) return;
    setPhoneChecking(true);
    try {
      const res = await fetch(`/api/customers?phone=${encodeURIComponent(form.phone)}`);
      const data: Customer[] = await res.json();
      if (data.length > 0) {
        setErrors((e) => ({ ...e, phone: 'מספר טלפון כבר קיים במערכת' }));
      }
    } finally {
      setPhoneChecking(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setErrors({});

    const payload = {
      name: form.name,
      phone: form.phone,
      ...(form.email ? { email: form.email } : {}),
      ...(form.notes ? { notes: form.notes } : {}),
    };

    const url = customer ? `/api/customers/${customer.id}` : '/api/customers';
    const method = customer ? 'PATCH' : 'POST';

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        onSaved();
        onClose();
      } else {
        const data = await res.json();
        const fieldErrors = data?.error?.fieldErrors ?? {};
        setErrors(
          Object.fromEntries(Object.entries(fieldErrors).map(([k, v]) => [k, (v as string[])[0]])),
        );
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <Modal open={open} onClose={onClose} title={customer ? 'עריכת לקוח' : 'לקוח חדש'}>
      <form onSubmit={handleSubmit} className="px-6 py-4 space-y-4">
        <Input
          label="שם מלא"
          value={form.name}
          onChange={(e) => set('name', e.target.value)}
          error={errors.name}
          required
        />
        <Input
          label="טלפון"
          value={form.phone}
          onChange={(e) => set('phone', e.target.value)}
          onBlur={checkPhoneUniqueness}
          error={phoneChecking ? 'בודק...' : errors.phone}
          placeholder="050-1234567"
          required
        />
        <Input
          label="אימייל (אופציונלי)"
          type="email"
          value={form.email}
          onChange={(e) => set('email', e.target.value)}
          error={errors.email}
        />
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-gray-700">הערות (אופציונלי)</label>
          <textarea
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            rows={3}
            value={form.notes}
            onChange={(e) => set('notes', e.target.value)}
          />
        </div>

        <div className="flex gap-2 justify-start pt-1">
          <Button type="submit" disabled={loading || phoneChecking}>
            {loading ? 'שומר...' : customer ? 'שמור שינויים' : 'צור לקוח'}
          </Button>
          <Button type="button" variant="secondary" onClick={onClose}>
            ביטול
          </Button>
        </div>
      </form>
    </Modal>
  );
}
