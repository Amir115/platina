'use client';
import { useState, useRef } from 'react';
import type { Customer, Vehicle } from '@prisma/client';
import type { CreateWorkOrderInput } from '@/types';

interface PrefillVehicle {
  licensePlate: string;
  make: string;
  model: string;
  year: number;
}

interface NewOrderModalProps {
  open: boolean;
  onClose: () => void;
  onCreated: () => void;
  prefillCustomer?: { name: string; phone: string };
  prefillVehicle?: PrefillVehicle;
}

const EMPTY_FORM: Partial<CreateWorkOrderInput> = {};

export function NewOrderModal({
  open,
  onClose,
  onCreated,
  prefillCustomer,
  prefillVehicle,
}: NewOrderModalProps) {
  const [form, setForm] = useState<Partial<CreateWorkOrderInput>>(() => ({
    ...(prefillCustomer
      ? { customerName: prefillCustomer.name, customerPhone: prefillCustomer.phone }
      : {}),
    ...(prefillVehicle
      ? {
          licensePlate: prefillVehicle.licensePlate,
          vehicleMake: prefillVehicle.make,
          vehicleModel: prefillVehicle.model,
          vehicleYear: prefillVehicle.year,
        }
      : {}),
  }));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [suggestions, setSuggestions] = useState<Customer[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [vehicleSuggestions, setVehicleSuggestions] = useState<Vehicle[]>([]);
  const [showVehicleSuggestions, setShowVehicleSuggestions] = useState(false);
  const searchTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const vehicleTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  if (!open) return null;

  function set<K extends keyof CreateWorkOrderInput>(key: K, value: CreateWorkOrderInput[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function handleCustomerNameChange(value: string) {
    set('customerName', value);
    if (searchTimeout.current) clearTimeout(searchTimeout.current);
    if (value.length < 2) {
      setSuggestions([]);
      return;
    }
    searchTimeout.current = setTimeout(async () => {
      const res = await fetch(`/api/customers?search=${encodeURIComponent(value)}`);
      if (res.ok) {
        const data: Customer[] = await res.json();
        setSuggestions(data.slice(0, 5));
        setShowSuggestions(true);
      }
    }, 300);
  }

  function selectCustomer(customer: Customer) {
    set('customerName', customer.name);
    set('customerPhone', customer.phone);
    setSuggestions([]);
    setShowSuggestions(false);
    // Fetch this customer's vehicles
    fetch(`/api/vehicles?customerId=${customer.id}`)
      .then((r) => (r.ok ? r.json() : []))
      .then((vehicles: Vehicle[]) => {
        if (vehicles.length > 0) {
          setVehicleSuggestions(vehicles);
          setShowVehicleSuggestions(true);
        }
      });
  }

  function selectVehicle(vehicle: Vehicle) {
    set('licensePlate', vehicle.licensePlate);
    set('vehicleMake', vehicle.make);
    set('vehicleModel', vehicle.model);
    set('vehicleYear', vehicle.year);
    setVehicleSuggestions([]);
    setShowVehicleSuggestions(false);
  }

  function handlePlateChange(value: string) {
    set('licensePlate', value);
    if (vehicleTimeout.current) clearTimeout(vehicleTimeout.current);
    if (value.length < 2) return;
    vehicleTimeout.current = setTimeout(async () => {
      const res = await fetch(`/api/vehicles/search?plate=${encodeURIComponent(value)}`);
      if (res.ok) {
        const data: Vehicle[] = await res.json();
        if (data.length > 0) {
          setVehicleSuggestions(data);
          setShowVehicleSuggestions(true);
        }
      }
    }, 300);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/work-orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        setForm(EMPTY_FORM);
        onCreated();
        onClose();
      } else {
        const data = await res.json();
        setError(data?.error?.formErrors?.[0] ?? 'שגיאה ביצירת הכרטיס');
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div
        className="bg-white rounded-xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
        dir="rtl"
      >
        <div className="flex items-center justify-between px-6 py-4 border-b sticky top-0 bg-white">
          <h2 className="text-lg font-bold">כרטיס עבודה חדש</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-xl leading-none"
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-4 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2 relative">
              <label className="block text-sm font-medium text-gray-700 mb-1">שם לקוח</label>
              <input
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={form.customerName ?? ''}
                onChange={(e) => handleCustomerNameChange(e.target.value)}
                onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
                onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
                required
              />
              {showSuggestions && suggestions.length > 0 && (
                <ul className="absolute z-10 w-full bg-white border border-gray-200 rounded-lg shadow-lg mt-1 text-sm">
                  {suggestions.map((c) => (
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

            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">טלפון</label>
              <input
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={form.customerPhone ?? ''}
                onChange={(e) => set('customerPhone', e.target.value)}
                required
              />
            </div>

            {showVehicleSuggestions && vehicleSuggestions.length > 0 && (
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  רכבים קיימים של הלקוח
                </label>
                <div className="flex flex-wrap gap-2">
                  {vehicleSuggestions.map((v) => (
                    <button
                      key={v.id}
                      type="button"
                      onMouseDown={() => selectVehicle(v)}
                      className="px-3 py-1.5 bg-gray-100 hover:bg-blue-100 text-gray-800 text-xs font-mono rounded-lg transition-colors"
                    >
                      {v.licensePlate} · {v.make} {v.model}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="relative">
              <label className="block text-sm font-medium text-gray-700 mb-1">לוחית רישוי</label>
              <input
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                value={form.licensePlate ?? ''}
                onChange={(e) => handlePlateChange(e.target.value)}
                onBlur={() => setTimeout(() => setShowVehicleSuggestions(false), 150)}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">שנה</label>
              <input
                type="number"
                min={1980}
                max={new Date().getFullYear() + 1}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={form.vehicleYear ?? ''}
                onChange={(e) => set('vehicleYear', Number(e.target.value))}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">יצרן</label>
              <input
                placeholder="Toyota"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={form.vehicleMake ?? ''}
                onChange={(e) => set('vehicleMake', e.target.value)}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">דגם</label>
              <input
                placeholder="Corolla"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={form.vehicleModel ?? ''}
                onChange={(e) => set('vehicleModel', e.target.value)}
                required
              />
            </div>

            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                ק&quot;מ נוכחי (אופציונלי)
              </label>
              <input
                type="number"
                min={0}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={form.mileage ?? ''}
                onChange={(e) =>
                  e.target.value
                    ? set('mileage', Number(e.target.value))
                    : // eslint-disable-next-line @typescript-eslint/no-unused-vars
                      setForm(({ mileage: _m, ...rest }) => rest)
                }
              />
            </div>

            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">תיאור התקלה</label>
              <textarea
                rows={3}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                value={form.description ?? ''}
                onChange={(e) => set('description', e.target.value)}
                required
              />
            </div>
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <div className="flex gap-2 justify-start pt-1">
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 text-sm font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'שומר...' : 'צור כרטיס'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              ביטול
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
