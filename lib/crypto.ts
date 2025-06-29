let CryptoJS: any = null;

// Only import CryptoJS in the browser
if (typeof window !== 'undefined') {
  CryptoJS = require('crypto-js');
}

export class ReflectionCrypto {
  private static deriveKey(passphrase: string, salt: string): string {
    if (!CryptoJS) {
      throw new Error('CryptoJS is not available in server environment');
    }
    return CryptoJS.PBKDF2(passphrase, salt, {
      keySize: 256 / 32,
      iterations: 10000,
    }).toString();
  }

  static encrypt(data: any, passphrase: string): string {
    if (!CryptoJS) {
      throw new Error('CryptoJS is not available in server environment');
    }
    const salt = CryptoJS.lib.WordArray.random(128 / 8).toString();
    const key = this.deriveKey(passphrase, salt);
    const encrypted = CryptoJS.AES.encrypt(JSON.stringify(data), key).toString();
    
    return JSON.stringify({
      salt,
      encrypted,
    });
  }

  static decrypt(encryptedData: string, passphrase: string): any {
    if (!CryptoJS) {
      throw new Error('CryptoJS is not available in server environment');
    }
    try {
      const { salt, encrypted } = JSON.parse(encryptedData);
      const key = this.deriveKey(passphrase, salt);
      const decrypted = CryptoJS.AES.decrypt(encrypted, key);
      const decryptedString = decrypted.toString(CryptoJS.enc.Utf8);
      
      if (!decryptedString) {
        throw new Error('Invalid passphrase');
      }
      
      return JSON.parse(decryptedString);
    } catch (error) {
      throw new Error('Failed to decrypt data. Please check your passphrase.');
    }
  }
}