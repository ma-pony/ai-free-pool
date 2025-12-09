/**
 * RSA API Security Utilities
 *
 * Provides secure API communication using RSA hybrid encryption.
 * All request parameters and response data are encrypted.
 */

import type { NextRequest } from 'next/server';
import type { EncryptedPayload } from './RSAEncryption';
import { NextResponse } from 'next/server';
import {
  decryptWithRSA,

  encryptResponseWithRSA,
  isRSADecryptionAvailable,
  verifyTimestamp,
} from './RSAEncryption';

export type RSASecureApiOptions = {
  requireEncryption?: boolean;
  maxRequestAge?: number; // milliseconds
  allowedOrigins?: string[];
};

/**
 * Extract and decrypt RSA-encrypted request body (server-side)
 */
export async function getRSADecryptedBody<T = any>(
  request: NextRequest,
  options: { maxAge?: number } = {},
): Promise<T> {
  if (!isRSADecryptionAvailable()) {
    throw new Error('RSA decryption is not available. Check RSA_PRIVATE_KEY.');
  }

  try {
    const body = await request.json() as EncryptedPayload;

    // Validate payload structure
    if (!body.encryptedData || !body.encryptedKey || !body.iv || !body.timestamp) {
      throw new Error('Invalid encrypted payload structure');
    }

    // Verify timestamp to prevent replay attacks
    const maxAge = options.maxAge || 5 * 60 * 1000; // 5 minutes default
    if (!verifyTimestamp(body.timestamp, maxAge)) {
      throw new Error('Request expired or invalid timestamp');
    }

    // Decrypt the payload
    const result = await decryptWithRSA<T>(body);
    return result.data;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Failed to decrypt request: ${error.message}`);
    }
    throw new Error('Failed to decrypt request');
  }
}

/**
 * Create RSA-encrypted response (server-side)
 */
export async function createRSAEncryptedResponse(
  data: any,
  status: number = 200,
): Promise<NextResponse> {
  try {
    const encrypted = await encryptResponseWithRSA(data);

    return NextResponse.json(
      {
        success: true,
        encrypted: true,
        ...encrypted,
      },
      { status },
    );
  } catch (error) {
    console.error('Failed to encrypt response:', error);
    // Fallback to unencrypted response with error flag
    return NextResponse.json(
      {
        success: true,
        encrypted: false,
        data,
        warning: 'Response encryption failed',
      },
      { status },
    );
  }
}

/**
 * Create error response
 */
export function createRSAErrorResponse(
  message: string,
  status: number = 400,
): NextResponse {
  return NextResponse.json(
    {
      success: false,
      error: {
        message,
        statusCode: status,
      },
    },
    { status },
  );
}

/**
 * Validate secure request
 */
export async function validateRSASecureRequest(
  request: NextRequest,
  options: RSASecureApiOptions = {},
): Promise<{ valid: boolean; error?: string }> {
  const { allowedOrigins = [] } = options;

  // Validate origin if specified
  if (allowedOrigins.length > 0) {
    const origin = request.headers.get('origin');
    const referer = request.headers.get('referer');
    const requestOrigin = origin || (referer ? new URL(referer).origin : null);

    if (!requestOrigin || !allowedOrigins.includes(requestOrigin)) {
      return { valid: false, error: 'Invalid request origin' };
    }
  }

  // Check encryption header
  const encryptionHeader = request.headers.get('x-encryption');
  if (options.requireEncryption && encryptionHeader !== 'rsa') {
    return { valid: false, error: 'RSA encryption required' };
  }

  return { valid: true };
}

/**
 * Wrap API handler with RSA security
 */
export function withRSASecurity(
  handler: (request: NextRequest, decryptedBody?: any) => Promise<NextResponse>,
  options: RSASecureApiOptions = {},
) {
  return async (request: NextRequest): Promise<NextResponse> => {
    // Validate request
    const validation = await validateRSASecureRequest(request, options);
    if (!validation.valid) {
      return createRSAErrorResponse(validation.error || 'Invalid request', 403);
    }

    try {
      // Check if request has encrypted body
      const contentType = request.headers.get('content-type');
      const encryptionHeader = request.headers.get('x-encryption');

      let decryptedBody: any;

      if (contentType?.includes('application/json') && encryptionHeader === 'rsa') {
        decryptedBody = await getRSADecryptedBody(request, {
          maxAge: options.maxRequestAge,
        });
      }

      return handler(request, decryptedBody);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Request processing failed';
      return createRSAErrorResponse(message, 400);
    }
  };
}
