'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface FormState {
  garageName: string;
  phone: string;
  city: string;
}

interface FieldErrors {
  garageName?: string[];
  phone?: string[];
  city?: string[];
}

export default function OnboardingPage() {
  const router = useRouter();
  const [form, setForm] = useState<FormState>({ garageName: '', phone: '', city: '' });
  const [errors, setErrors] = useState<FieldErrors>({});
  const [serverError, setServerError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setErrors({});
    setServerError('');

    const res = await fetch('/api/onboarding', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });

    const data = await res.json();

    if (!res.ok) {
      if (data?.error?.fieldErrors) {
        setErrors(data.error.fieldErrors);
      } else {
        setServerError('אירעה שגיאה, נסה שנית');
      }
      setLoading(false);
      return;
    }

    router.push('/dashboard');
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center" dir="rtl">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 w-full max-w-md">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">ברוכים הבאים לפלטינה</h1>
        <p className="text-gray-500 text-sm mb-6">נא מלא את פרטי המוסך כדי להמשיך</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">שם המוסך</label>
            <input
              type="text"
              value={form.garageName}
              onChange={(e) => setForm({ ...form, garageName: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="מוסך כהן"
            />
            {errors.garageName && (
              <p className="text-red-500 text-xs mt-1">{errors.garageName[0]}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">טלפון</label>
            <input
              type="tel"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="0501234567"
            />
            {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone[0]}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">עיר</label>
            <input
              type="text"
              value={form.city}
              onChange={(e) => setForm({ ...form, city: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="תל אביב"
            />
            {errors.city && <p className="text-red-500 text-xs mt-1">{errors.city[0]}</p>}
          </div>

          {serverError && <p className="text-red-500 text-sm">{serverError}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white rounded-lg py-2 text-sm font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors"
          >
            {loading ? 'שומר...' : 'יצירת מוסך'}
          </button>
        </form>
      </div>
    </div>
  );
}
