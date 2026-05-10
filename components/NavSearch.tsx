'use client';
import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import type { Vehicle, Customer } from '@prisma/client';

type VehicleResult = Vehicle & { customer: Customer | null };

export function NavSearch() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<VehicleResult[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  function handleChange(value: string) {
    setQuery(value);
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    if (value.length < 2) {
      setResults([]);
      setOpen(false);
      return;
    }
    setLoading(true);
    timeoutRef.current = setTimeout(async () => {
      const res = await fetch(`/api/vehicles/search?plate=${encodeURIComponent(value)}`);
      if (res.ok) {
        const data: VehicleResult[] = await res.json();
        setResults(data);
        setOpen(true);
      }
      setLoading(false);
    }, 300);
  }

  function selectVehicle(vehicle: VehicleResult) {
    setQuery('');
    setOpen(false);
    router.push(`/vehicles/${vehicle.id}`);
  }

  function goToCreate() {
    setQuery('');
    setOpen(false);
    router.push('/vehicles');
  }

  return (
    <div className="relative">
      <input
        type="text"
        dir="ltr"
        placeholder="חיפוש לוחית רישוי..."
        value={query}
        onChange={(e) => handleChange(e.target.value)}
        onBlur={() => setTimeout(() => setOpen(false), 150)}
        onFocus={() => query.length >= 2 && results.length > 0 && setOpen(true)}
        className="w-52 border border-gray-200 rounded-lg px-3 py-1.5 text-sm font-mono placeholder:font-sans placeholder:text-right focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
      {loading && (
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-gray-400">...</span>
      )}
      {open && (
        <div
          className="absolute left-0 top-full mt-1 w-80 bg-white border border-gray-200 rounded-xl shadow-lg z-50 text-sm overflow-hidden"
          dir="rtl"
        >
          {results.length === 0 ? (
            <p className="px-4 py-3 text-gray-500 text-sm">לא נמצאו רכבים</p>
          ) : (
            results.map((v) => (
              <button
                key={v.id}
                onMouseDown={() => selectVehicle(v)}
                className="w-full px-4 py-2.5 text-right hover:bg-blue-50 flex items-center justify-between gap-3 transition-colors"
              >
                <span className="font-mono font-semibold text-gray-900 tracking-wider">
                  {v.licensePlate}
                </span>
                <span className="text-gray-500 text-xs truncate">
                  {v.make} {v.model} · {v.customer?.name ?? '—'}
                </span>
              </button>
            ))
          )}
          <button
            onMouseDown={goToCreate}
            className="w-full px-4 py-2.5 text-right text-blue-600 hover:bg-blue-50 border-t border-gray-100 text-xs font-medium transition-colors"
          >
            + רכב חדש
          </button>
        </div>
      )}
    </div>
  );
}
