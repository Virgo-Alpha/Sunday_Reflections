'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { usePassphrase } from '@/contexts/PassphraseContext';
import { Lock } from 'lucide-react';

export const PassphrasePrompt: React.FC = () => {
  const [passphrase, setPassphraseInput] = useState('');
  const [error, setError] = useState('');
  const { setPassphrase } = usePassphrase();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!passphrase) {
      setError('Please enter your passphrase');
      return;
    }

    setPassphrase(passphrase);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900">
            <Lock className="h-6 w-6 text-blue-600 dark:text-blue-400" />
          </div>
          <CardTitle className="text-2xl font-bold">Enter Your Passphrase</CardTitle>
          <CardDescription>
            Please enter your passphrase to decrypt your reflections
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="passphrase">Passphrase</Label>
              <Input
                id="passphrase"
                type="password"
                placeholder="Enter your passphrase"
                value={passphrase}
                onChange={(e) => setPassphraseInput(e.target.value)}
                required
                autoFocus
              />
            </div>
            
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <Button type="submit" className="w-full">
              Unlock Reflections
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};