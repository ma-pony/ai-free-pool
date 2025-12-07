import type arcjet from '@arcjet/next';
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

/**
 * Rate limiting helper utilities
 * Provides consistent error responses and logging for rate-limited requests
 */

export type RateLimitResult = {
  allowed: boolean;
  remaining?: number;
  reset?: number;
  reason?: string;
};

/**
 * Checks if a request is rate limited using Arcjet
 * @param aj - Arcjet instance with rate limiting rules
 * @param request - Next.js request object
 * @returns Rate limit result
 */
export async function checkRateLimit(
  aj: ReturnType<typeof arcjet>,
  request: NextRequest,
): Promise<RateLimitResult> {
  try {
    const decision = await aj.protect(request);

    if (decision.isDenied()) {
      // Extract rate limit info if available
      const rateLimitInfo = decision.reason;

      return {
        allowed: false,
        reason: rateLimitInfo?.toString() || 'Rate limit exceeded',
      };
    }

    return {
      allowed: true,
    };
  } catch (error) {
    console.error('Rate limit check error:', error);
    // Allow request if rate limiting fails (fail open)
    return {
      allowed: true,
    };
  }
}

/**
 * Creates a rate limit error response
 * @param result - Rate limit result
 * @returns NextResponse with 429 status
 */
export function createRateLimitResponse(result: RateLimitResult): NextResponse {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (result.remaining !== undefined) {
    headers['X-RateLimit-Remaining'] = result.remaining.toString();
  }

  if (result.reset !== undefined) {
    headers['X-RateLimit-Reset'] = result.reset.toString();
    headers['Retry-After'] = Math.ceil((result.reset - Date.now()) / 1000).toString();
  }

  return NextResponse.json(
    {
      success: false,
      error: {
        message: 'Too many requests. Please try again later.',
        statusCode: 429,
        reason: result.reason,
      },
    },
    {
      status: 429,
      headers,
    },
  );
}

/**
 * Wraps an API handler with rate limiting
 * @param handler - Original API handler
 * @param aj - Arcjet instance with rate limiting rules
 * @returns Wrapped handler with rate limiting
 */
export function withRateLimit(
  handler: (request: NextRequest, context?: any) => Promise<NextResponse>,
  aj: ReturnType<typeof arcjet>,
) {
  return async (request: NextRequest, context?: any): Promise<NextResponse> => {
    // Check rate limit
    const rateLimitResult = await checkRateLimit(aj, request);

    if (!rateLimitResult.allowed) {
      return createRateLimitResponse(rateLimitResult);
    }

    // Call original handler
    return handler(request, context);
  };
}

/**
 * Gets the client identifier for rate limiting
 * Tries to get user ID from auth, falls back to IP address
 * @param request - Next.js request object
 * @param userId - Optional user ID from authentication
 * @returns Client identifier
 */
export function getClientIdentifier(request: NextRequest, userId?: string): string {
  if (userId) {
    return `user:${userId}`;
  }

  // Get IP address
  const forwarded = request.headers.get('x-forwarded-for');
  const ip = forwarded ? forwarded.split(',')[0].trim() : request.headers.get('x-real-ip') || 'unknown';

  return `ip:${ip}`;
}

/**
 * Logs rate limit violations for monitoring
 * @param request - Next.js request object
 * @param identifier - Client identifier
 * @param reason - Rate limit reason
 */
export function logRateLimitViolation(
  request: NextRequest,
  identifier: string,
  reason: string,
): void {
  const url = new URL(request.url);

  console.warn('Rate limit violation:', {
    identifier,
    path: url.pathname,
    method: request.method,
    reason,
    timestamp: new Date().toISOString(),
  });

  // In production, you might want to send this to a monitoring service
  // Example: Sentry, DataDog, etc.
}
