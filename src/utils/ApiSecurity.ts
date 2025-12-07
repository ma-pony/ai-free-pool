import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { decryptData, encryptData, verifyRequestSignature } from './Encryption';

/**
 * API Security utilities for request/response encryption and validation
 */

export type EncryptedRequest = {
  data: string; // Encrypted payload
  signature?: string; // Request signature
  timestamp?: number; // Request timestamp
};

export type SecureApiOptions = {
  requireEncryption?: boolean;
  requireSignature?: boolean;
  allowedOrigins?: string[];
};

/**
 * Extracts and decrypts request body
 * @param request - Next.js request object
 * @returns Decrypted request data
 */
export async function getDecryptedBody<T = any>(request: NextRequest): Promise<T> {
  try {
    const body = await request.json();

    // Check if body is encrypted
    if (body.data && typeof body.data === 'string') {
      return decryptData<T>(body.data);
    }

    // Return as-is if not encrypted (for backward compatibility)
    return body as T;
  } catch (error) {
    throw new Error('Failed to parse or decrypt request body');
  }
}

/**
 * Creates an encrypted response
 * @param data - Data to encrypt and return
 * @param status - HTTP status code
 * @returns NextResponse with encrypted data
 */
export function createEncryptedResponse(data: any, status: number = 200): NextResponse {
  const encrypted = encryptData(data);

  return NextResponse.json(
    {
      success: true,
      data: encrypted,
    },
    { status },
  );
}

/**
 * Creates a standard error response
 * @param message - Error message
 * @param status - HTTP status code
 * @returns NextResponse with error
 */
export function createErrorResponse(message: string, status: number = 400): NextResponse {
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
 * Validates request signature and origin
 * @param request - Next.js request object
 * @param options - Security options
 * @returns Validation result
 */
export async function validateSecureRequest(
  request: NextRequest,
  options: SecureApiOptions = {},
): Promise<{ valid: boolean; error?: string }> {
  const {
    requireSignature = false,
    allowedOrigins = [],
  } = options;

  // Validate origin if specified
  if (allowedOrigins.length > 0) {
    const origin = request.headers.get('origin');
    const referer = request.headers.get('referer');

    const requestOrigin = origin || (referer ? new URL(referer).origin : null);

    if (!requestOrigin || !allowedOrigins.includes(requestOrigin)) {
      return {
        valid: false,
        error: 'Invalid request origin',
      };
    }
  }

  // Validate signature if required
  if (requireSignature) {
    const signature = request.headers.get('x-signature');
    const timestamp = request.headers.get('x-timestamp');

    if (!signature || !timestamp) {
      return {
        valid: false,
        error: 'Missing signature or timestamp',
      };
    }

    try {
      const body = await request.clone().json();
      const path = new URL(request.url).pathname;
      const method = request.method;

      const isValid = verifyRequestSignature(
        signature,
        method,
        path,
        Number.parseInt(timestamp, 10),
        body,
      );

      if (!isValid) {
        return {
          valid: false,
          error: 'Invalid signature or expired request',
        };
      }
    } catch (error) {
      return {
        valid: false,
        error: 'Failed to validate signature',
      };
    }
  }

  return { valid: true };
}

/**
 * Wraps an API handler with security features
 * @param handler - Original API handler
 * @param options - Security options
 * @returns Wrapped handler with security
 */
export function withApiSecurity(
  handler: (request: NextRequest) => Promise<NextResponse>,
  options: SecureApiOptions = {},
) {
  return async (request: NextRequest): Promise<NextResponse> => {
    // Validate request
    const validation = await validateSecureRequest(request, options);

    if (!validation.valid) {
      return createErrorResponse(validation.error || 'Invalid request', 403);
    }

    // Call original handler
    return handler(request);
  };
}

/**
 * Client-side helper to create encrypted request
 * @param data - Data to encrypt
 * @param includeSignature - Whether to include signature
 * @returns Request body and headers
 */
export function createEncryptedRequest(
  data: any,
  includeSignature: boolean = false,
): {
  body: string;
  headers: Record<string, string>;
} {
  const encrypted = encryptData(data);
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (includeSignature && typeof window !== 'undefined') {
    // Note: In production, signature generation should be done server-side
    // This is a simplified example
    const timestamp = Date.now();
    headers['x-timestamp'] = timestamp.toString();
  }

  return {
    body: JSON.stringify({ data: encrypted }),
    headers,
  };
}

/**
 * Client-side helper to decrypt response
 * @param response - Fetch response
 * @returns Decrypted data
 */
export async function decryptResponse<T = any>(response: Response): Promise<T> {
  const json = await response.json();

  if (!json.success) {
    throw new Error(json.error?.message || 'Request failed');
  }

  if (json.data && typeof json.data === 'string') {
    return decryptData<T>(json.data);
  }

  return json.data as T;
}
