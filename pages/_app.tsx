import '../app/globals.css';
import type { AppProps } from 'next/app';
import { ThemeProvider } from '@/components/ui/theme-provider';
import { AuthProvider } from '@/contexts/AuthContext';
import { PassphraseProvider } from '@/contexts/PassphraseContext';
import { Toaster } from '@/components/ui/sonner';
import { BoltBadge } from '@/components/BoltBadge';

export default function App({ Component, pageProps }: AppProps) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <AuthProvider>
        <PassphraseProvider>
          <Component {...pageProps} />
          <Toaster />
          <BoltBadge />
        </PassphraseProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}