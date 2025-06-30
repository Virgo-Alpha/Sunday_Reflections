'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { usePassphrase } from '@/contexts/PassphraseContext';
import { ReflectionForm } from '@/components/reflection/ReflectionForm';
import { PassphrasePrompt } from '@/components/auth/PassphrasePrompt';
import { useRouter } from 'next/router';

export default function ReflectPage() {
  const { user, loading } = useAuth();
  const { isPassphraseSet } = usePassphrase();
  const router = useRouter();
  const [redirecting, setRedirecting] = useState(false); // Track redirect state

  // Trigger redirect only once the loading is done and the user is not available
  useEffect(() => {
    if (!loading && !user && !redirecting) {
      setRedirecting(true); // Set to true to prevent further redirects
      router.push('/');
    }
  }, [user, loading, router, redirecting]);

  if (loading || redirecting) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
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

  return <ReflectionForm />;
}