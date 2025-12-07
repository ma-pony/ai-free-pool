/**
 * Examples of how to use request validation in API routes
 *
 * This file demonstrates different validation strategies for various security requirements.
 *
 * 1. Basic origin validation:
 *
 * ```typescript
 * import { withRequestValidation } from '@/utils/RequestValidation';
 *
 * const handler = async (request: NextRequest) => {
 *   // Your handler logic
 *   return NextResponse.json({ success: true });
 * };
 *
 * export const POST = withRequestValidation(handler, {
 *   allowedOrigins: [
 *     process.env.NEXT_PUBLIC_APP_URL!,
 *     'https://yourdomain.com',
 *   ],
 * });
 * ```
 *
 * 2. Strict validation with CSRF protection:
 *
 * ```typescript
 * import { withRequestValidation } from '@/utils/RequestValidation';
 *
 * const handler = async (request: NextRequest) => {
 *   // Your handler logic
 *   return NextResponse.json({ success: true });
 * };
 *
 * export const POST = withRequestValidation(handler, {
 *   allowedOrigins: [process.env.NEXT_PUBLIC_APP_URL!],
 *   requireCSRF: true,
 *   allowedMethods: ['POST'],
 *   allowedContentTypes: ['application/json'],
 * });
 * ```
 *
 * 3. Manual validation for custom logic:
 *
 * ```typescript
 * import {
 *   validateRequest,
 *   createValidationErrorResponse,
 *   getRealIP,
 * } from '@/utils/RequestValidation';
 *
 * export async function POST(request: NextRequest) {
 *   // Validate request
 *   const validation = await validateRequest(request, {
 *     allowedOrigins: [process.env.NEXT_PUBLIC_APP_URL!],
 *   });
 *
 *   if (!validation.valid) {
 *     return createValidationErrorResponse(validation);
 *   }
 *
 *   // Additional custom validation
 *   const ip = getRealIP(request);
 *   if (isBlacklisted(ip)) {
 *     return NextResponse.json(
 *       { error: 'Access denied' },
 *       { status: 403 }
 *     );
 *   }
 *
 *   // Your handler logic
 *   return NextResponse.json({ success: true });
 * }
 * ```
 *
 * 4. Combining multiple security layers:
 *
 * ```typescript
 * import { withRequestValidation } from '@/utils/RequestValidation';
 * import { withRateLimit } from '@/utils/RateLimitHelpers';
 * import { arcjetWithStrictRateLimit } from '@/libs/Arcjet';
 *
 * const handler = async (request: NextRequest) => {
 *   // Your handler logic
 *   return NextResponse.json({ success: true });
 * };
 *
 * // Apply multiple layers of security
 * export const POST = withRequestValidation(
 *   withRateLimit(handler, arcjetWithStrictRateLimit),
 *   {
 *     allowedOrigins: [process.env.NEXT_PUBLIC_APP_URL!],
 *     requireCSRF: true,
 *   }
 * );
 * ```
 *
 * 5. IP-based access control:
 *
 * ```typescript
 * import { isIPAllowed, getRealIP } from '@/utils/RequestValidation';
 *
 * export async function POST(request: NextRequest) {
 *   // Check if IP is allowed (for admin endpoints)
 *   const allowedIPs = process.env.ADMIN_IPS?.split(',') || [];
 *
 *   if (allowedIPs.length > 0 && !isIPAllowed(request, allowedIPs)) {
 *     return NextResponse.json(
 *       { error: 'Access denied' },
 *       { status: 403 }
 *     );
 *   }
 *
 *   // Your handler logic
 *   return NextResponse.json({ success: true });
 * }
 * ```
 *
 * Recommended validation by endpoint type:
 *
 * - Public read operations (GET /api/campaigns):
 *   - No validation needed (or basic origin check)
 *
 * - User submissions (POST /api/campaigns/submit):
 *   - Origin validation
 *   - Rate limiting
 *
 * - Admin operations (POST /api/admin/*):
 *   - Origin validation
 *   - CSRF protection
 *   - Rate limiting
 *   - Optional: IP whitelist
 *
 * - Authentication endpoints (POST /api/auth/*):
 *   - Origin validation
 *   - CSRF protection
 *   - Strict rate limiting
 *
 * - Bulk operations (POST /api/admin/bulk-import):
 *   - Origin validation
 *   - CSRF protection
 *   - Very strict rate limiting
 *   - IP whitelist (recommended)
 *
 * Security best practices:
 *
 * 1. Always validate origin for state-changing operations
 * 2. Use CSRF protection for authenticated endpoints
 * 3. Combine with rate limiting to prevent abuse
 * 4. Log validation failures for monitoring
 * 5. Use HTTPS in production (enforced by Next.js)
 * 6. Keep allowed origins list minimal
 * 7. Regularly review and update security rules
 * 8. Monitor for suspicious patterns
 */

export {};
