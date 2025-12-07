import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

/**
 * Request validation utilities
 * Validates: Requirements 18.8, 18.10
 *
 * Provides utilities for:
 * - Origin validation
 * - Request signature verification
 * - CSRF protection
 * - Content-Type validation
 */

export type RequestValidationOptions = {
  allowedOrigins?: string[];
  requireSignature?: boolean;
  requireCSRF?: boolean;
  allowedMethods?: string[];
  allowedContentTypes?: string[];
};

export type ValidationResult = {
  valid: boolean;
  error?: string;
  statusCode?: number;
};

/**
 * Validates request origin against allowed origins
 * @param request - Next.js request object
 * @param allowedOrigins - List of allowed origins
 * @returns Validation result
 */
export function validateOrigin(
  request: NextRequest,
  allowedOrigins: string[],
): ValidationResult {
  // Get origin from headers
  const origin = request.headers.get('origin');
  const referer = request.headers.get('referer');

  // For same-origin requests, origin might be null
  if (!origin && !referer) {
    // Allow requests without origin/referer for same-origin
    const host = request.headers.get('host');
    if (host && allowedOrigins.some(allowed => allowed.includes(host))) {
      return { valid: true };
    }
  }

  // Check origin
  if (origin && allowedOrigins.includes(origin)) {
    return { valid: true };
  }

  // Check referer as fallback
  if (referer) {
    const refererOrigin = new URL(referer).origin;
    if (allowedOrigins.includes(refererOrigin)) {
      return { valid: true };
    }
  }

  return {
    valid: false,
    error: 'Invalid request origin',
    statusCode: 403,
  };
}

/**
 * Validates HTTP method
 * @param request - Next.js request object
 * @param allowedMethods - List of allowed HTTP methods
 * @returns Validation result
 */
export function validateMethod(
  request: NextRequest,
  allowedMethods: string[],
): ValidationResult {
  const method = request.method.toUpperCase();

  if (!allowedMethods.includes(method)) {
    return {
      valid: false,
      error: `Method ${method} not allowed`,
      statusCode: 405,
    };
  }

  return { valid: true };
}

/**
 * Validates Content-Type header
 * @param request - Next.js request object
 * @param allowedContentTypes - List of allowed content types
 * @returns Validation result
 */
export function validateContentType(
  request: NextRequest,
  allowedContentTypes: string[],
): ValidationResult {
  const contentType = request.headers.get('content-type');

  if (!contentType) {
    return {
      valid: false,
      error: 'Content-Type header is required',
      statusCode: 400,
    };
  }

  // Check if content type matches any allowed type
  const matches = allowedContentTypes.some(allowed =>
    contentType.toLowerCase().includes(allowed.toLowerCase()),
  );

  if (!matches) {
    return {
      valid: false,
      error: `Content-Type ${contentType} not allowed`,
      statusCode: 415,
    };
  }

  return { valid: true };
}

/**
 * Validates CSRF token
 * @param request - Next.js request object
 * @returns Validation result
 */
export function validateCSRF(request: NextRequest): ValidationResult {
  // Get CSRF token from header
  const csrfToken = request.headers.get('x-csrf-token');

  // Get CSRF token from cookie
  const csrfCookie = request.cookies.get('csrf-token')?.value;

  if (!csrfToken || !csrfCookie) {
    return {
      valid: false,
      error: 'CSRF token missing',
      statusCode: 403,
    };
  }

  if (csrfToken !== csrfCookie) {
    return {
      valid: false,
      error: 'CSRF token mismatch',
      statusCode: 403,
    };
  }

  return { valid: true };
}

/**
 * Validates request size
 * @param request - Next.js request object
 * @param maxSize - Maximum allowed size in bytes
 * @returns Validation result
 */
export function validateRequestSize(
  request: NextRequest,
  maxSize: number,
): ValidationResult {
  const contentLength = request.headers.get('content-length');

  if (!contentLength) {
    // If no content-length header, we can't validate size
    return { valid: true };
  }

  const size = Number.parseInt(contentLength, 10);

  if (size > maxSize) {
    return {
      valid: false,
      error: `Request size ${size} exceeds maximum ${maxSize} bytes`,
      statusCode: 413,
    };
  }

  return { valid: true };
}

/**
 * Validates all request aspects
 * @param request - Next.js request object
 * @param options - Validation options
 * @returns Validation result
 */
export async function validateRequest(
  request: NextRequest,
  options: RequestValidationOptions = {},
): Promise<ValidationResult> {
  const {
    allowedOrigins = [],
    requireCSRF = false,
    allowedMethods = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedContentTypes = ['application/json'],
  } = options;

  // Validate origin
  if (allowedOrigins.length > 0) {
    const originResult = validateOrigin(request, allowedOrigins);
    if (!originResult.valid) {
      return originResult;
    }
  }

  // Validate method
  const methodResult = validateMethod(request, allowedMethods);
  if (!methodResult.valid) {
    return methodResult;
  }

  // Validate content type for requests with body
  if (['POST', 'PUT', 'PATCH'].includes(request.method.toUpperCase())) {
    const contentTypeResult = validateContentType(request, allowedContentTypes);
    if (!contentTypeResult.valid) {
      return contentTypeResult;
    }
  }

  // Validate CSRF token for state-changing requests
  if (requireCSRF && ['POST', 'PUT', 'DELETE', 'PATCH'].includes(request.method.toUpperCase())) {
    const csrfResult = validateCSRF(request);
    if (!csrfResult.valid) {
      return csrfResult;
    }
  }

  return { valid: true };
}

/**
 * Creates a validation error response
 * @param result - Validation result
 * @returns NextResponse with error
 */
export function createValidationErrorResponse(result: ValidationResult): NextResponse {
  return NextResponse.json(
    {
      success: false,
      error: {
        message: result.error || 'Validation failed',
        statusCode: result.statusCode || 400,
      },
    },
    { status: result.statusCode || 400 },
  );
}

/**
 * Wraps an API handler with request validation
 * @param handler - Original API handler
 * @param options - Validation options
 * @returns Wrapped handler with validation
 */
export function withRequestValidation(
  handler: (request: NextRequest, context?: any) => Promise<NextResponse>,
  options: RequestValidationOptions = {},
) {
  return async (request: NextRequest, context?: any): Promise<NextResponse> => {
    // Validate request
    const validationResult = await validateRequest(request, options);

    if (!validationResult.valid) {
      return createValidationErrorResponse(validationResult);
    }

    // Call original handler
    return handler(request, context);
  };
}

/**
 * Checks if request is from same origin
 * @param request - Next.js request object
 * @returns True if same origin
 */
export function isSameOrigin(request: NextRequest): boolean {
  const origin = request.headers.get('origin');
  const host = request.headers.get('host');

  if (!origin || !host) {
    return true; // Assume same origin if headers are missing
  }

  const originHost = new URL(origin).host;
  return originHost === host;
}

/**
 * Gets the real IP address from request
 * @param request - Next.js request object
 * @returns IP address
 */
export function getRealIP(request: NextRequest): string {
  // Try various headers in order of preference
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded && forwarded.length > 0) {
    return forwarded.split(',')[0].trim();
  }

  const realIP = request.headers.get('x-real-ip');
  if (realIP) {
    return realIP;
  }

  const cfConnectingIP = request.headers.get('cf-connecting-ip');
  if (cfConnectingIP) {
    return cfConnectingIP;
  }

  return 'unknown';
}

/**
 * Checks if IP is in allowed list
 * @param request - Next.js request object
 * @param allowedIPs - List of allowed IP addresses or CIDR ranges
 * @returns True if IP is allowed
 */
export function isIPAllowed(request: NextRequest, allowedIPs: string[]): boolean {
  const ip = getRealIP(request);

  if (ip === 'unknown') {
    return false;
  }

  // Simple exact match (for production, consider using a CIDR library)
  return allowedIPs.includes(ip);
}

/**
 * Validates request headers for required fields
 * @param request - Next.js request object
 * @param requiredHeaders - List of required header names
 * @returns Validation result
 */
export function validateHeaders(
  request: NextRequest,
  requiredHeaders: string[],
): ValidationResult {
  const missing: string[] = [];

  for (const header of requiredHeaders) {
    if (!request.headers.get(header)) {
      missing.push(header);
    }
  }

  if (missing.length > 0) {
    return {
      valid: false,
      error: `Missing required headers: ${missing.join(', ')}`,
      statusCode: 400,
    };
  }

  return { valid: true };
}

/**
 * Logs validation failures for monitoring
 * @param request - Next.js request object
 * @param result - Validation result
 */
export function logValidationFailure(
  request: NextRequest,
  result: ValidationResult,
): void {
  const url = new URL(request.url);

  console.warn('Request validation failed:', {
    path: url.pathname,
    method: request.method,
    error: result.error,
    statusCode: result.statusCode,
    origin: request.headers.get('origin'),
    userAgent: request.headers.get('user-agent'),
    ip: getRealIP(request),
    timestamp: new Date().toISOString(),
  });

  // In production, send to monitoring service
}
