import type { Metadata } from 'next';
import { ClerkProvider } from '@clerk/nextjs';
import './globals.css';

export const metadata: Metadata = {
  title: 'פלטינה | מערכת ניהול מוסך',
  description: 'מערכת ניהול כרטיסי עבודה למוסכים',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider>
      <html lang="he" dir="rtl">
        <body className="min-h-screen bg-gray-50">{children}</body>
      </html>
    </ClerkProvider>
  );
}
