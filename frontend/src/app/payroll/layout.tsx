'use client';

import { ReactNode, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { PayrollSidebar } from '@/components/payroll/PayrollSidebar';
import { useAuth } from '@/providers/auth-provider';
import Navbar from '@/components/Navbar';

export default function PayrollLayout({ children }: { children: ReactNode }) {
  const { status } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.replace('/auth/login');
    }
  }, [status, router]);

  if (status !== 'authenticated') return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-black relative text-white">
      <Navbar />
      {/* Animated background orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-20 w-96 h-96 bg-slate-700/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-slate-600/20 rounded-full blur-3xl animate-pulse delay-1000" />
      </div>

      <div className="relative z-10 mx-auto w-full px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-[18rem_1fr] xl:grid-cols-[20rem_1fr] gap-6">
          <div className="rounded-2xl overflow-hidden">
            <PayrollSidebar />
          </div>
          <main className="min-w-0 backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-6 md:p-8">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}

