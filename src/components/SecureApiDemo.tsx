/**
 * RSA Encrypted API Demo Component
 *
 * This component demonstrates how to use RSA encryption for secure API calls.
 * Use this as a reference for implementing secure forms and data submission.
 */

'use client';

import { useState } from 'react';
import { useRSAEncryption } from '@/hooks/useRSAEncryption';

type DemoResponse = {
  message: string;
  action: string;
  processedAt: string;
  receivedData: Record<string, any>;
};

export function SecureApiDemo() {
  const { securePost, loading, error, isEncryptionAvailable } = useRSAEncryption();
  const [result, setResult] = useState<DemoResponse | null>(null);
  const [inputData, setInputData] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const response = await securePost<DemoResponse>('/api/secure-example', {
        action: 'demo_action',
        data: {
          userInput: inputData,
          timestamp: new Date().toISOString(),
          sensitiveInfo: 'This data is encrypted with RSA',
        },
      });

      setResult(response);
    } catch (err) {
      console.error('Secure request failed:', err);
    }
  };

  return (
    <div className="mx-auto max-w-md rounded-xl bg-white p-6 shadow-md">
      <h2 className="mb-4 text-xl font-bold">RSA Encrypted API Demo</h2>

      {!isEncryptionAvailable && (
        <div className="mb-4 rounded bg-yellow-100 p-3 text-yellow-800">
          ⚠️ RSA encryption is not available. Check NEXT_PUBLIC_RSA_PUBLIC_KEY.
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="inputData" className="block text-sm font-medium text-gray-700">
            Enter some data:
          </label>
          <input
            type="text"
            id="inputData"
            value={inputData}
            onChange={e => setInputData(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
            placeholder="Type something..."
          />
        </div>

        <button
          type="submit"
          disabled={loading || !isEncryptionAvailable}
          className="w-full rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? 'Sending encrypted...' : 'Send Encrypted Request'}
        </button>
      </form>

      {error && (
        <div className="mt-4 rounded bg-red-100 p-3 text-red-800">
          Error:
          {' '}
          {error}
        </div>
      )}

      {result && (
        <div className="mt-4 rounded bg-green-100 p-3 text-green-800">
          <h3 className="font-bold">Response (decrypted):</h3>
          <pre className="mt-2 overflow-auto text-xs">
            {JSON.stringify(result, null, 2)}
          </pre>
        </div>
      )}

      <div className="mt-4 text-xs text-gray-500">
        <p>✅ Request parameters are RSA encrypted</p>
        <p>✅ Response data is RSA encrypted</p>
        <p>✅ Timestamp verification prevents replay attacks</p>
      </div>
    </div>
  );
}

export default SecureApiDemo;
