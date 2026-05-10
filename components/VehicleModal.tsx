'use client';
import { useState, useRef } from 'react';
import type { Vehicle, Customer } from '@prisma/client';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';

interface VehicleModalProps {
  open: boolean;
  onClose: () => void;
  onSaved: (vehicle: Vehicle) => void;
  vehicle?: Vehicle & { customer: Customer | null };
  prefillCustomerId?: string;
  prefillCustomerName?: string;
}

interface FormState {
  licensePlate: string;
  make: string;
  model: string;
  year: string;
  mileage: string;
  color: string;
  notes: string;
  customerId: string;
  customerSearch: string;
}

export function VehicleModal({
  open,
  onClose,
  onSaved,
  vehicle,
  prefillCustomerId,
  prefillCustomerName,
}: VehicleModalProps) {
  const [form, setForm] = useState<FormState>({
    licensePlate: vehicle?.licensePlate ?? '',
    make: vehicle?.make ?? '',
    model: vehicle?.model ?? '',
    year: vehicle ? String(vehicle.year) : '',
    mileage: vehicle?.mileage != null ? String(vehicle.mileage) : '',
    color: vehicle?.color ?? '',
    notes: vehicle?.notes ?? '',
    customerId: vehicle?.customerId ?? prefillCustomerId ?? '',
    customerSearch: vehicle?.customer?.name ?? prefillCustomerName ?? '',
  });
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [plateChecking, setPlateChecking] = useState(false);
  const [customerSuggestions, setCustomerSuggestions] = useState<Customer[]>([]);
  const [showCustomerSuggestions, setShowCustomerSuggestions] = useState(false);
  const searchTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  function set(key: keyof FormState, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
    setErrors((e) => ({ ...e, [key]: undefined }));
  }

  async function checkPlateUniqueness() {
    const plate = form.licensePlate.toUpperCase();
    if (!plate || plate === vehicle?.licensePlate?.toUpperCase()) return;
    setPlateChecking(true);
    try {
      const res = await fetch(`/api/vehicles/search?plate=${encodeURIComponent(plate)}`);
      const data: Vehicle[] = await res.json();
      if (data.some((v) => v.licensePlate === plate)) {
        setErrors((e) => ({ ...e, licensePlate: 'לוחית רישוי כבר קיימת במערכת' }));
      }
    } finally {
      setPlateChecking(false);
    }
  }

  function handleCustomerSearch(value: string) {
    set('customerSearch', value);
    set('customerId', '');
    if (searchTimeout.current) clearTimeout(searchTimeout.current);
    if (value.length < 2) {
      setCustomerSuggestions([]);
      return;
    }
    searchTimeout.current = setTimeout(async () => {
      const res = await fetch(`/api/customers?search=${encodeURIComponent(value)}`);
      if (res.ok) {
        const data: Customer[] = await res.json();
        setCustomerSuggestions(data.slice(0, 5));
        setShowCustomerSuggestions(true);
      }
    }, 300);
  }

  function selectCustomer(customer: Customer) {
    setForm((f) => ({ ...f, customerId: customer.id, customerSearch: customer.name }));
    setErrors((e) => ({ ...e, customerId: undefined }));
    setCustomerSuggestions([]);
    setShowCustomerSuggestions(false);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.customerId) {
      setErrors((e) => ({ ...e, customerId: 'בחר לקוח מהרשימה' }));
      return;
    }
    setLoading(true);
    setErrors({});
    setSubmitError(null);

    const payload = {
      licensePlate: form.licensePlate,
      make: form.make,
      model: form.model,
      year: parseInt(form.year),
      customerId: form.customerId,
      ...(form.mileage ? { mileage: parseInt(form.mileage) } : {}),
      ...(form.color ? { color: form.color } : {}),
      ...(form.notes ? { notes: form.notes } : {}),
    };

    const url = vehicle ? `/api/vehicles/${vehicle.id}` : '/api/vehicles';
    const method = vehicle ? 'PATCH' : 'POST';

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        const saved: Vehicle = await res.json();
        onSaved(saved);
        onClose();
      } else {
        const data = await res.json();
        const fieldErrors = data?.error?.fieldErrors ?? {};
        const mapped = Object.fromEntries(
          Object.entries(fieldErrors).map(([k, v]) => [k, (v as string[])[0]]),
        );
        if (Object.keys(mapped).length > 0) {
          setErrors(mapped);
        } else {
          setSubmitError(data?.error?.formErrors?.[0] ?? 'שגיאה לא צפויה, נסה שנית');
        }
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <Modal open={open} onClose={onClose} title={vehicle ? 'עריכת רכב' : 'רכב חדש'}>
      <form onSubmit={handleSubmit} className="px-6 py-4 space-y-4">
        <Input
          label="לוחית רישוי"
          value={form.licensePlate}
          onChange={(e) => set('licensePlate', e.target.value)}
          onBlur={checkPlateUniqueness}
          error={plateChecking ? 'בודק...' : errors.licensePlate}
          placeholder="123-45-678"
          disabled={!!vehicle}
          required
        />

        <div className="grid grid-cols-2 gap-3">
          <Input
            label="יצרן"
            value={form.make}
            onChange={(e) => set('make', e.target.value)}
            error={errors.make}
            placeholder="Toyota"
            required
          />
          <Input
            label="דגם"
            value={form.model}
            onChange={(e) => set('model', e.target.value)}
            error={errors.model}
            placeholder="Corolla"
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Input
            label="שנה"
            type="number"
            value={form.year}
            onChange={(e) => set('year', e.target.value)}
            error={errors.year}
            min={1980}
            max={new Date().getFullYear() + 1}
            required
          />
          <Input
            label='ק"מ (אופציונלי)'
            type="number"
            value={form.mileage}
            onChange={(e) => set('mileage', e.target.value)}
            error={errors.mileage}
            min={0}
          />
        </div>

        <Input
          label="צבע (אופציונלי)"
          value={form.color}
          onChange={(e) => set('color', e.target.value)}
          error={errors.color}
        />

        <div className="relative flex flex-col gap-1">
          <label className="text-sm font-medium text-gray-700">לקוח</label>
          <input
            className={`border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.customerId ? 'border-red-400' : 'border-gray-300'}`}
            value={form.customerSearch}
            onChange={(e) => handleCustomerSearch(e.target.value)}
            onBlur={() => setTimeout(() => setShowCustomerSuggestions(false), 150)}
            onFocus={() => customerSuggestions.length > 0 && setShowCustomerSuggestions(true)}
            placeholder="חיפוש לפי שם או טלפון..."
            required
          />
          {errors.customerId && <p className="text-xs text-red-600">{errors.customerId}</p>}
          {showCustomerSuggestions && customerSuggestions.length > 0 && (
            <ul className="absolute top-full z-10 w-full bg-white border border-gray-200 rounded-lg shadow-lg mt-1 text-sm">
              {customerSuggestions.map((c) => (
                <li
                  key={c.id}
                  onMouseDown={() => selectCustomer(c)}
                  className="px-3 py-2 hover:bg-blue-50 cursor-pointer flex justify-between"
                >
                  <span className="font-medium">{c.name}</span>
                  <span className="text-gray-400">{c.phone}</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-gray-700">הערות (אופציונלי)</label>
          <textarea
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            rows={2}
            value={form.notes}
            onChange={(e) => set('notes', e.target.value)}
          />
        </div>

        {submitError && <p className="text-sm text-red-600">{submitError}</p>}

        <div className="flex gap-2 justify-start pt-1">
          <Button type="submit" disabled={loading || plateChecking}>
            {loading ? 'שומר...' : vehicle ? 'שמור שינויים' : 'צור רכב'}
          </Button>
          <Button type="button" variant="secondary" onClick={onClose}>
            ביטול
          </Button>
        </div>
      </form>
    </Modal>
  );
}
