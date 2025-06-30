'use client';

import { ReflectionCrypto } from './crypto';

// Client-side wrapper that ensures crypto operations only happen in browser
export const getReflectionCrypto = () => {
  if (typeof window === 'undefined') {
    throw new Error('ReflectionCrypto can only be used in browser environment');
  }
  return ReflectionCrypto;
};

// Client-side crypto functions that can be safely imported
export const encryptReflection = async (data: any, passphrase: string): Promise<string> => {
  if (typeof window === 'undefined') {
    throw new Error('Encryption can only be performed in browser environment');
  }
  return ReflectionCrypto.encrypt(data, passphrase);
};

export const decryptReflection = async (encryptedData: string, passphrase: string): Promise<any> => {
  if (typeof window === 'undefined') {
    throw new Error('Decryption can only be performed in browser environment');
  }
  return ReflectionCrypto.decrypt(encryptedData, passphrase);
};