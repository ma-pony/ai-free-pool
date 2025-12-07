import * as CryptoJS from 'crypto-js';

/**
 * Encryption utilities for API data protection
 * Uses AES-256 encryption with the API_ENCRYPTION_KEY from environment variables
 */

const SECRET_KEY = process.env.API_ENCRYPTION_KEY || process.env.NEXT_PUBLIC_API_ENCRYPTION_KEY;

if (!SECRET_KEY) {
  console.warn('API_ENCRYPTION_KEY is not set. Encryption will not work properly.');
}

/**
 * Encrypts data using AES-256 encryption
 * @param data - Any data to encrypt (will be JSON stringified)
 * @returns Encrypted string
 */
export function encryptData(data: any): string {
  if (!SECRET_KEY) {
    throw new Error('API_ENCRYPTION_KEY is not configured');
  }

  const jsonString = JSON.stringify(data);
  return CryptoJS.AES.encrypt(jsonString, SECRET_KEY).toString();
}

/**
 * Decrypts data that was encrypted with encryptData
 * @param encryptedData - Encrypted string
 * @returns Decrypted and parsed data
 */
export function decryptData<T = any>(encryptedData: string): T {
  if (!SECRET_KEY) {
    throw new Error('API_ENCRYPTION_KEY is not configured');
  }

  const bytes = CryptoJS.AES.decrypt(encryptedData, SECRET_KEY);
  const jsonString = bytes.toString(CryptoJS.enc.Utf8);

  if (!jsonString) {
    throw new Error('Failed to decrypt data. Invalid encryption key or corrupted data.');
  }

  return JSON.parse(jsonString);
}

/**
 * Encrypts sensitive fields in an object
 * @param data - Object containing data
 * @param sensitiveFields - Array of field names to encrypt
 * @returns Object with encrypted fields
 */
export function encryptFields<T extends Record<string, any>>(
  data: T,
  sensitiveFields: (keyof T)[],
): T {
  const result = { ...data };

  for (const field of sensitiveFields) {
    if (result[field] !== undefined && result[field] !== null) {
      result[field] = encryptData(result[field]) as any;
    }
  }

  return result;
}

/**
 * Decrypts sensitive fields in an object
 * @param data - Object containing encrypted data
 * @param sensitiveFields - Array of field names to decrypt
 * @returns Object with decrypted fields
 */
export function decryptFields<T extends Record<string, any>>(
  data: T,
  sensitiveFields: (keyof T)[],
): T {
  const result = { ...data };

  for (const field of sensitiveFields) {
    if (result[field] !== undefined && result[field] !== null && typeof result[field] === 'string') {
      try {
        result[field] = decryptData(result[field] as string) as any;
      } catch (error) {
        console.error(`Failed to decrypt field ${String(field)}:`, error);
        // Keep the original value if decryption fails
      }
    }
  }

  return result;
}

/**
 * Creates a hash of data for verification purposes
 * @param data - Data to hash
 * @returns SHA256 hash string
 */
export function hashData(data: any): string {
  const jsonString = JSON.stringify(data);
  return CryptoJS.SHA256(jsonString).toString();
}

/**
 * Verifies if data matches a hash
 * @param data - Data to verify
 * @param hash - Hash to compare against
 * @returns True if data matches hash
 */
export function verifyHash(data: any, hash: string): boolean {
  return hashData(data) === hash;
}

/**
 * Generates a request signature for API validation
 * @param method - HTTP method
 * @param path - API path
 * @param timestamp - Request timestamp
 * @param body - Request body (optional)
 * @returns Signature string
 */
export function generateRequestSignature(
  method: string,
  path: string,
  timestamp: number,
  body?: any,
): string {
  if (!SECRET_KEY) {
    throw new Error('API_ENCRYPTION_KEY is not configured');
  }

  const payload = {
    method: method.toUpperCase(),
    path,
    timestamp,
    body: body ? JSON.stringify(body) : '',
  };

  const message = JSON.stringify(payload);
  return CryptoJS.HmacSHA256(message, SECRET_KEY).toString();
}

/**
 * Verifies a request signature
 * @param signature - Signature to verify
 * @param method - HTTP method
 * @param path - API path
 * @param timestamp - Request timestamp
 * @param body - Request body (optional)
 * @param maxAge - Maximum age of request in milliseconds (default: 5 minutes)
 * @returns True if signature is valid
 */
export function verifyRequestSignature(
  signature: string,
  method: string,
  path: string,
  timestamp: number,
  body?: any,
  maxAge: number = 5 * 60 * 1000, // 5 minutes
): boolean {
  // Check timestamp to prevent replay attacks
  const now = Date.now();
  if (Math.abs(now - timestamp) > maxAge) {
    return false;
  }

  const expectedSignature = generateRequestSignature(method, path, timestamp, body);
  return signature === expectedSignature;
}
