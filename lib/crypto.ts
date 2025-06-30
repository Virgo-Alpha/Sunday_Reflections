export class ReflectionCrypto {
  private static async getCryptoJS() {
    if (typeof window === 'undefined') {
      throw new Error('CryptoJS is not available in server environment');
    }
    
    const CryptoJS = await import('crypto-js');
    return CryptoJS.default || CryptoJS;
  }

  private static async deriveKey(passphrase: string, salt: string): Promise<string> {
    const CryptoJS = await this.getCryptoJS();
    return CryptoJS.PBKDF2(passphrase, salt, {
      keySize: 256 / 32,
      iterations: 10000,
    }).toString();
  }

  static async encrypt(data: any, passphrase: string): Promise<string> {
    const CryptoJS = await this.getCryptoJS();
    const salt = CryptoJS.lib.WordArray.random(128 / 8).toString();
    const key = await this.deriveKey(passphrase, salt);
    const encrypted = CryptoJS.AES.encrypt(JSON.stringify(data), key).toString();
    
    return JSON.stringify({
      salt,
      encrypted,
    });
  }

  static async decrypt(encryptedData: string, passphrase: string): Promise<any> {
    const CryptoJS = await this.getCryptoJS();
    try {
      const { salt, encrypted } = JSON.parse(encryptedData);
      const key = await this.deriveKey(passphrase, salt);
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

// Legacy exports for backward compatibility
export const encrypt = ReflectionCrypto.encrypt;
export const decrypt = ReflectionCrypto.decrypt;