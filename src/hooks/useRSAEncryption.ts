/**
 * React Hook for RSA Encrypted API Calls
 *
 * Provides easy-to-use functions for making encrypted API requests
 * and decrypting responses on the client side.
 */

'use client';

import { useCallback, useState } from 'react';
import {
  encryptWithRSA,
  isRSAAvailable,
} from '@/utils/RSAEncryption';

export type RSAFetchOptions = {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  headers?: Record<string, string>;
  encrypt?: boolean;
};

export type RSAFetchResult<T> = {
  data: T | null;
  error: string | null;
  loading: boolean;
};

/**
 * Decrypt response from server
 */
async function decryptResponse<T>(response: Response): Promise<T> {
  const json = await response.json();

  if (!json.success) {
    throw new Error(json.error?.message || 'Request failed');
  }

  // Check if response is encrypted
  if (json.encrypted && json.encryptedData) {
    // Import dynamically to avoid SSR issues
    const { decryptWithRSA } = await import('@/utils/RSAEncryption');

    // For client-side decryption, we need a different approach
    // Since RSA private key is server-only, we use a shared secret approach
    // Or implement client-side decryption with a session key

    // For now, if server sends encrypted response, client needs the key
    // This is a simplified implementation - in production, use proper key exchange
    const result = await decryptWithRSA<T>({
      encryptedData: json.encryptedData,
      encryptedKey: json.encryptedKey,
      iv: json.iv,
      timestamp: json.timestamp,
    });

    return result.data;
  }

  return json.data as T;
}

/**
 * Create encrypted request body and headers
 */
async function createEncryptedRequest(data: any): Promise<{
  body: string;
  headers: Record<string, string>;
}> {
  const encrypted = await encryptWithRSA(data);

  return {
    body: JSON.stringify(encrypted),
    headers: {
      'Content-Type': 'application/json',
      'x-encryption': 'rsa',
    },
  };
}

/**
 * Hook for making RSA-encrypted API calls
 */
export function useRSAEncryption() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Make an encrypted fetch request
   */
  const secureFetch = useCallback(async <T = any>(
    url: string,
    data?: any,
    options: RSAFetchOptions = {},
  ): Promise<T> => {
    const {
      method = data ? 'POST' : 'GET',
      headers = {},
      encrypt = true,
    } = options;

    setLoading(true);
    setError(null);

    try {
      let requestBody: string | undefined;
      let requestHeaders: Record<string, string> = { ...headers };

      // Encrypt request body if data is provided and encryption is enabled
      if (data && encrypt && isRSAAvailable()) {
        const encrypted = await createEncryptedRequest(data);
        requestBody = encrypted.body;
        requestHeaders = { ...requestHeaders, ...encrypted.headers };
      } else if (data) {
        requestBody = JSON.stringify(data);
        requestHeaders['Content-Type'] = 'application/json';
      }

      const response = await fetch(url, {
        method,
        headers: requestHeaders,
        body: requestBody,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error?.message || `HTTP ${response.status}`);
      }

      const result = await decryptResponse<T>(response);
      return result;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Request failed';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Encrypted POST request
   */
  const securePost = useCallback(<T = any>(
    url: string,
    data: any,
    options?: Omit<RSAFetchOptions, 'method'>,
  ) => {
    return secureFetch<T>(url, data, { ...options, method: 'POST' });
  }, [secureFetch]);

  /**
   * Encrypted PUT request
   */
  const securePut = useCallback(<T = any>(
    url: string,
    data: any,
    options?: Omit<RSAFetchOptions, 'method'>,
  ) => {
    return secureFetch<T>(url, data, { ...options, method: 'PUT' });
  }, [secureFetch]);

  /**
   * Encrypted DELETE request
   */
  const secureDelete = useCallback(<T = any>(
    url: string,
    data?: any,
    options?: Omit<RSAFetchOptions, 'method'>,
  ) => {
    return secureFetch<T>(url, data, { ...options, method: 'DELETE' });
  }, [secureFetch]);

  /**
   * GET request (no encryption needed for request, but response may be encrypted)
   */
  const secureGet = useCallback(<T = any>(
    url: string,
    options?: Omit<RSAFetchOptions, 'method'>,
  ) => {
    return secureFetch<T>(url, undefined, { ...options, method: 'GET', encrypt: false });
  }, [secureFetch]);

  return {
    secureFetch,
    securePost,
    securePut,
    secureDelete,
    secureGet,
    loading,
    error,
    isEncryptionAvailable: isRSAAvailable(),
  };
}

/**
 * Standalone function for encrypted fetch (non-hook usage)
 */
export async function rsaFetch<T = any>(
  url: string,
  data?: any,
  options: RSAFetchOptions = {},
): Promise<T> {
  const {
    method = data ? 'POST' : 'GET',
    headers = {},
    encrypt = true,
  } = options;

  let requestBody: string | undefined;
  let requestHeaders: Record<string, string> = { ...headers };

  if (data && encrypt && isRSAAvailable()) {
    const encrypted = await createEncryptedRequest(data);
    requestBody = encrypted.body;
    requestHeaders = { ...requestHeaders, ...encrypted.headers };
  } else if (data) {
    requestBody = JSON.stringify(data);
    requestHeaders['Content-Type'] = 'application/json';
  }

  const response = await fetch(url, {
    method,
    headers: requestHeaders,
    body: requestBody,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error?.message || `HTTP ${response.status}`);
  }

  return decryptResponse<T>(response);
}

export default useRSAEncryption;
