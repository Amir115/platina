import Link from 'next/link';
import { UserButton } from '@clerk/nextjs';
import { getGarageContext } from '@/lib/garage-context';
import { redirect } from 'next/navigation';

export default async function DashboardPage() {
  let garageName: string;

  try {
    const { garage } = await getGarageContext();
    garageName = garage.name;
  } catch {
    redirect('/onboarding');
  }

  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
        <span className="text-xl font-bold text-gray-900">פלטינה</span>
        <UserButton />
      </header>

      <main className="max-w-2xl mx-auto px-6 py-12">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">ברוך הבא לפלטינה</h1>
        <p className="text-gray-500 mb-8">{garageName}</p>

        <div className="grid gap-4">
          <Link
            href="/"
            className="block bg-white border border-gray-200 rounded-xl p-5 hover:border-blue-400 hover:shadow-sm transition-all"
          >
            <h2 className="font-semibold text-gray-900">כרטיסי עבודה</h2>
            <p className="text-sm text-gray-500 mt-1">ניהול כרטיסי עבודה ומעקב סטטוס</p>
          </Link>

          <Link
            href="/customers"
            className="block bg-white border border-gray-200 rounded-xl p-5 hover:border-blue-400 hover:shadow-sm transition-all"
          >
            <h2 className="font-semibold text-gray-900">לקוחות</h2>
            <p className="text-sm text-gray-500 mt-1">ניהול לקוחות ורכבים</p>
          </Link>

          <Link
            href="/vehicles"
            className="block bg-white border border-gray-200 rounded-xl p-5 hover:border-blue-400 hover:shadow-sm transition-all"
          >
            <h2 className="font-semibold text-gray-900">רכבים</h2>
            <p className="text-sm text-gray-500 mt-1">חיפוש לפי לוחית רישוי והיסטוריית טיפולים</p>
          </Link>
        </div>
      </main>
    </div>
  );
}
