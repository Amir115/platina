import Link from 'next/link';
import { redirect } from 'next/navigation';
import { UserButton } from '@clerk/nextjs';
import { NavSearch } from '@/components/NavSearch';
import { getGarageContext } from '@/lib/garage-context';

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  try {
    await getGarageContext();
  } catch (e) {
    if (e instanceof Error && e.message.includes('Garage not found')) {
      redirect('/onboarding');
    }
    throw e;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-20" dir="rtl">
        <div className="max-w-5xl mx-auto px-6 py-3 flex items-center gap-6">
          <Link href="/dashboard" className="text-xl font-bold text-gray-900 hover:text-blue-600 transition-colors">פלטינה</Link>
          <div className="flex gap-5 text-sm">
            <Link
              href="/"
              className="text-gray-600 hover:text-blue-600 transition-colors font-medium"
            >
              כרטיסי עבודה
            </Link>
            <Link
              href="/customers"
              className="text-gray-600 hover:text-blue-600 transition-colors font-medium"
            >
              לקוחות
            </Link>
            <Link
              href="/vehicles"
              className="text-gray-600 hover:text-blue-600 transition-colors font-medium"
            >
              רכבים
            </Link>
          </div>
          <div className="flex-1 flex justify-start">
            <NavSearch />
          </div>
          <UserButton />
        </div>
      </nav>
      {children}
    </div>
  );
}
