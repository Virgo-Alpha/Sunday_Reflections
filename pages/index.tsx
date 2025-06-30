import React from 'react';
import { GetServerSideProps } from 'next';
import { useAuth } from '@/contexts/AuthContext';
import { usePassphrase } from '@/contexts/PassphraseContext';
import { HomePage } from '@/components/home/HomePage';
import { PassphraseSetup } from '@/components/auth/PassphraseSetup';
import { Dashboard } from '@/components/dashboard/Dashboard';

export default function Home() {
  const { user, loading } = useAuth();
  const { isPassphraseSet } = usePassphrase();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Not authenticated - show homepage
  if (!user) {
    return <HomePage />;
  }

  // Authenticated but no passphrase set - show passphrase setup
  if (!isPassphraseSet) {
    return <PassphraseSetup />;
  }

  // Authenticated and passphrase set - show dashboard
  return <Dashboard />;
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  // Return empty props since we handle auth client-side
  return {
    props: {},
  };
};