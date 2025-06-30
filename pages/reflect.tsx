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
  const [isRedirecting, setIsRedirecting] = useState(false); // Track redirect state

  useEffect(() => {
    // Only redirect if loading is complete and user is still not logged in
    if (!loading && !user && !isRedirecting) {
      setIsRedirecting(true); // Prevent additional redirects
      router.push('/');
    }
  }, [user, isRedirecting, router]);

  if (!user) {
    return null; // Will redirect if no user
  }

  if (!isPassphraseSet) {
    return <PassphrasePrompt />;
  }

  return <ReflectionForm />;
}