'use client';

import React, { createContext, useContext, useState } from 'react';

interface PassphraseContextType {
  passphrase: string | null;
  setPassphrase: (passphrase: string | null) => void;
  isPassphraseSet: boolean;
}

const PassphraseContext = createContext<PassphraseContextType>({
  passphrase: null,
  setPassphrase: () => {},
  isPassphraseSet: false,
});

export const usePassphrase = () => {
  const context = useContext(PassphraseContext);
  if (!context) {
    throw new Error('usePassphrase must be used within a PassphraseProvider');
  }
  return context;
};

export const PassphraseProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [passphrase, setPassphraseState] = useState<string | null>(null);

  const setPassphrase = (newPassphrase: string | null) => {
    setPassphraseState(newPassphrase);
  };

  return (
    <PassphraseContext.Provider 
      value={{ 
        passphrase, 
        setPassphrase, 
        isPassphraseSet: !!passphrase 
      }}
    >
      {children}
    </PassphraseContext.Provider>
  );
};