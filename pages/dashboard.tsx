'use client';

import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { usePassphrase } from '@/contexts/PassphraseContext';
import { Dashboard } from '@/components/dashboard/Dashboard';
import { PassphrasePrompt } from '@/components/auth/PassphrasePrompt';
import { useRouter } from 'next/router';
import { useEffect } from 'react';

export default function DashboardPage() {
  const { user, loading } = useAuth();
  const { isPassphraseSet } = usePassphrase();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/');
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect
  }

  if (!isPassphraseSet) {
    return <PassphrasePrompt />;
  }

  return <Dashboard />;
}