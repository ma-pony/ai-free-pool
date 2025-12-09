/**
 * RSA Encrypted API Route Example
 *
 * This route demonstrates how to use RSA encryption for secure API communication.
 * All request parameters are encrypted with RSA, and responses are also encrypted.
 */

import type { NextRequest } from 'next/server';
import {
  createRSAEncryptedResponse,
  createRSAErrorResponse,
  getRSADecryptedBody,
} from '@/utils/RSAApiSecurity';

type SecureRequestBody = {
  action: string;
  data: Record<string, any>;
};

/**
 * POST handler with manual encryption handling
 */
export async function POST(request: NextRequest) {
  try {
    // Check if request is encrypted
    const encryptionHeader = request.headers.get('x-encryption');

    let body: SecureRequestBody;

    if (encryptionHeader === 'rsa') {
      // Decrypt the encrypted request body
      body = await getRSADecryptedBody<SecureRequestBody>(request);
    } else {
      // Fallback to plain JSON (for backward compatibility or testing)
      body = await request.json();
    }

    // Process the request
    const result = {
      message: 'Request processed successfully',
      action: body.action,
      processedAt: new Date().toISOString(),
      receivedData: body.data,
    };

    // Return encrypted response
    return createRSAEncryptedResponse(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Request failed';
    return createRSAErrorResponse(message, 400);
  }
}

/**
 * Alternative: Using the withRSASecurity wrapper
 * Uncomment below to use the wrapper approach instead
 */
// const handler = async (request: NextRequest, decryptedBody?: SecureRequestBody) => {
//   const result = {
//     message: 'Request processed with wrapper',
//     data: decryptedBody,
//     processedAt: new Date().toISOString(),
//   };
//   return createRSAEncryptedResponse(result);
// };
//
// export const POST = withRSASecurity(handler, {
//   requireEncryption: true,
//   maxRequestAge: 5 * 60 * 1000,
// });
