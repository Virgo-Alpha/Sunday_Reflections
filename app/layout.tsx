import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { ThemeProvider } from '@/components/ui/theme-provider';
import { AuthProvider } from '@/contexts/AuthContext';
import { PassphraseProvider } from '@/contexts/PassphraseContext';
import { Toaster } from '@/components/ui/sonner';
import { BoltBadge } from '@/components/BoltBadge';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Sunday Reflections - Weekly Self-Discovery Journal',
  description: 'Your weekly journey of self-discovery and growth. Navigate life with intention using the power of reflection.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <AuthProvider>
            <PassphraseProvider>
              {children}
              <Toaster />
              <BoltBadge />
            </PassphraseProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}