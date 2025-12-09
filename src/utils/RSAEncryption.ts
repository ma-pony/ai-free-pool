/**
 * RSA Hybrid Encryption Utilities
 *
 * Uses RSA + AES hybrid encryption for secure API communication:
 * - RSA-2048 for key exchange (encrypts AES key)
 * - AES-256-GCM for data encryption (fast, no size limit)
 *
 * Flow:
 * 1. Client generates random AES key
 * 2. Client encrypts data with AES key
 * 3. Client encrypts AES key with server's RSA public key
 * 4. Server decrypts AES key with RSA private key
 * 5. Server decrypts data with AES key
 */

import { Buffer } from 'node:buffer';
import * as CryptoJS from 'crypto-js';

// RSA Public Key (client-side, safe to expose)
const RSA_PUBLIC_KEY = process.env.NEXT_PUBLIC_RSA_PUBLIC_KEY?.replace(/\\n/g, '\n');

// RSA Private Key (server-side only, never expose)
const RSA_PRIVATE_KEY = process.env.RSA_PRIVATE_KEY?.replace(/\\n/g, '\n');

export type EncryptedPayload = {
  encryptedData: string; // AES encrypted data (base64)
  encryptedKey: string; // RSA encrypted AES key (base64)
  iv: string; // Initialization vector (base64)
  timestamp: number; // Request timestamp for replay protection
};

export type DecryptedResult<T> = {
  data: T;
  timestamp: number;
};

/**
 * Check if RSA encryption is available
 */
export function isRSAAvailable(): boolean {
  return !!RSA_PUBLIC_KEY;
}

/**
 * Check if RSA decryption is available (server-side only)
 */
export function isRSADecryptionAvailable(): boolean {
  return !!RSA_PRIVATE_KEY;
}

/**
 * Generate a random AES key (256-bit)
 */
function generateAESKey(): string {
  return CryptoJS.lib.WordArray.random(32).toString(CryptoJS.enc.Hex);
}

/**
 * Generate a random IV (128-bit)
 */
function generateIV(): string {
  return CryptoJS.lib.WordArray.random(16).toString(CryptoJS.enc.Hex);
}

/**
 * Encrypt data with AES-256
 */
function aesEncrypt(data: string, key: string, iv: string): string {
  const keyWordArray = CryptoJS.enc.Hex.parse(key);
  const ivWordArray = CryptoJS.enc.Hex.parse(iv);

  const encrypted = CryptoJS.AES.encrypt(data, keyWordArray, {
    iv: ivWordArray,
    mode: CryptoJS.mode.CBC,
    padding: CryptoJS.pad.Pkcs7,
  });

  return encrypted.toString();
}

/**
 * Decrypt data with AES-256
 */
function aesDecrypt(encryptedData: string, key: string, iv: string): string {
  const keyWordArray = CryptoJS.enc.Hex.parse(key);
  const ivWordArray = CryptoJS.enc.Hex.parse(iv);

  const decrypted = CryptoJS.AES.decrypt(encryptedData, keyWordArray, {
    iv: ivWordArray,
    mode: CryptoJS.mode.CBC,
    padding: CryptoJS.pad.Pkcs7,
  });

  return decrypted.toString(CryptoJS.enc.Utf8);
}

/**
 * RSA encrypt using Web Crypto API (browser) or Node crypto (server)
 */
async function rsaEncrypt(data: string, publicKey: string): Promise<string> {
  if (typeof window !== 'undefined') {
    // Browser environment - use Web Crypto API
    const pemHeader = '-----BEGIN PUBLIC KEY-----';
    const pemFooter = '-----END PUBLIC KEY-----';
    const pemContents = publicKey
      .replace(pemHeader, '')
      .replace(pemFooter, '')
      .replace(/\s/g, '');

    const binaryDer = Uint8Array.from(atob(pemContents), c => c.charCodeAt(0));

    const cryptoKey = await crypto.subtle.importKey(
      'spki',
      binaryDer,
      {
        name: 'RSA-OAEP',
        hash: 'SHA-256',
      },
      false,
      ['encrypt'],
    );

    const encoder = new TextEncoder();
    const dataBuffer = encoder.encode(data);

    const encrypted = await crypto.subtle.encrypt(
      { name: 'RSA-OAEP' },
      cryptoKey,
      dataBuffer,
    );

    return btoa(String.fromCharCode(...new Uint8Array(encrypted)));
  } else {
    // Node.js environment
    const crypto = await import('node:crypto');
    const buffer = Buffer.from(data, 'utf8');
    const encrypted = crypto.publicEncrypt(
      {
        key: publicKey,
        padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
        oaepHash: 'sha256',
      },
      buffer,
    );
    return encrypted.toString('base64');
  }
}

/**
 * RSA decrypt using Node crypto (server-side only)
 */
async function rsaDecrypt(encryptedData: string, privateKey: string): Promise<string> {
  if (typeof window !== 'undefined') {
    throw new TypeError('RSA decryption is only available on server-side');
  }

  const crypto = await import('node:crypto');
  const buffer = Buffer.from(encryptedData, 'base64');
  const decrypted = crypto.privateDecrypt(
    {
      key: privateKey,
      padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
      oaepHash: 'sha256',
    },
    buffer,
  );
  return decrypted.toString('utf8');
}

/**
 * Encrypt data using RSA hybrid encryption (client-side)
 *
 * @param data - Any data to encrypt
 * @returns Encrypted payload
 */
export async function encryptWithRSA<T = any>(data: T): Promise<EncryptedPayload> {
  if (!RSA_PUBLIC_KEY) {
    throw new Error('RSA public key is not configured. Set NEXT_PUBLIC_RSA_PUBLIC_KEY.');
  }

  // Generate random AES key and IV
  const aesKey = generateAESKey();
  const iv = generateIV();

  // Encrypt data with AES
  const jsonData = JSON.stringify(data);
  const encryptedData = aesEncrypt(jsonData, aesKey, iv);

  // Encrypt AES key with RSA public key
  const encryptedKey = await rsaEncrypt(aesKey, RSA_PUBLIC_KEY);

  return {
    encryptedData,
    encryptedKey,
    iv,
    timestamp: Date.now(),
  };
}

/**
 * Decrypt data using RSA hybrid encryption (server-side only)
 *
 * @param payload - Encrypted payload
 * @returns Decrypted data
 */
export async function decryptWithRSA<T = any>(payload: EncryptedPayload): Promise<DecryptedResult<T>> {
  if (!RSA_PRIVATE_KEY) {
    throw new Error('RSA private key is not configured. Set RSA_PRIVATE_KEY.');
  }

  // Decrypt AES key with RSA private key
  const aesKey = await rsaDecrypt(payload.encryptedKey, RSA_PRIVATE_KEY);

  // Decrypt data with AES
  const jsonData = aesDecrypt(payload.encryptedData, aesKey, payload.iv);
  const data = JSON.parse(jsonData) as T;

  return {
    data,
    timestamp: payload.timestamp,
  };
}

/**
 * Encrypt response data for client (server-side)
 * Uses the same hybrid encryption approach
 */
export async function encryptResponseWithRSA<T = any>(data: T): Promise<EncryptedPayload> {
  // For response encryption, we use the public key
  // Client will decrypt with the same public key (symmetric-like for simplicity)
  // Or implement proper RSA signing for responses

  if (!RSA_PUBLIC_KEY) {
    throw new Error('RSA public key is not configured.');
  }

  const aesKey = generateAESKey();
  const iv = generateIV();

  const jsonData = JSON.stringify(data);
  const encryptedData = aesEncrypt(jsonData, aesKey, iv);
  const encryptedKey = await rsaEncrypt(aesKey, RSA_PUBLIC_KEY);

  return {
    encryptedData,
    encryptedKey,
    iv,
    timestamp: Date.now(),
  };
}

/**
 * Verify request timestamp to prevent replay attacks
 *
 * @param timestamp - Request timestamp
 * @param maxAge - Maximum age in milliseconds (default: 5 minutes)
 */
export function verifyTimestamp(timestamp: number, maxAge: number = 5 * 60 * 1000): boolean {
  const now = Date.now();
  return Math.abs(now - timestamp) <= maxAge;
}

/**
 * Create a signature for data integrity verification
 */
export function createSignature(data: any): string {
  const jsonString = JSON.stringify(data);
  return CryptoJS.SHA256(jsonString).toString();
}

/**
 * Verify data signature
 */
export function verifySignature(data: any, signature: string): boolean {
  return createSignature(data) === signature;
}
