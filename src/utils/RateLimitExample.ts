/**
 * Examples of how to apply rate limiting to API routes
 *
 * This file demonstrates different rate limiting strategies for various types of endpoints.
 *
 * 1. General API routes (moderate traffic):
 *
 * ```typescript
 * import { arcjetWithApiRateLimit } from '@/libs/Arcjet';
 * import { withRateLimit } from '@/utils/RateLimitHelpers';
 *
 * const handler = async (request: NextRequest) => {
 *   // Your handler logic
 *   return NextResponse.json({ success: true });
 * };
 *
 * export const GET = withRateLimit(handler, arcjetWithApiRateLimit);
 * ```
 *
 * 2. Sensitive operations (user submissions, admin actions):
 *
 * ```typescript
 * import { arcjetWithStrictRateLimit } from '@/libs/Arcjet';
 * import { withRateLimit } from '@/utils/RateLimitHelpers';
 *
 * const handler = async (request: NextRequest) => {
 *   // Your handler logic
 *   return NextResponse.json({ success: true });
 * };
 *
 * export const POST = withRateLimit(handler, arcjetWithStrictRateLimit);
 * ```
 *
 * 3. Critical operations (password reset, account deletion):
 *
 * ```typescript
 * import { arcjetWithCriticalRateLimit } from '@/libs/Arcjet';
 * import { withRateLimit } from '@/utils/RateLimitHelpers';
 *
 * const handler = async (request: NextRequest) => {
 *   // Your handler logic
 *   return NextResponse.json({ success: true });
 * };
 *
 * export const POST = withRateLimit(handler, arcjetWithCriticalRateLimit);
 * ```
 *
 * 4. Search and filter operations (high traffic):
 *
 * ```typescript
 * import { arcjetWithSearchRateLimit } from '@/libs/Arcjet';
 * import { withRateLimit } from '@/utils/RateLimitHelpers';
 *
 * const handler = async (request: NextRequest) => {
 *   // Your handler logic
 *   return NextResponse.json({ success: true });
 * };
 *
 * export const GET = withRateLimit(handler, arcjetWithSearchRateLimit);
 * ```
 *
 * 5. Manual rate limit checking (for more control):
 *
 * ```typescript
 * import { arcjetWithApiRateLimit } from '@/libs/Arcjet';
 * import { checkRateLimit, createRateLimitResponse } from '@/utils/RateLimitHelpers';
 *
 * export async function POST(request: NextRequest) {
 *   // Check rate limit
 *   const rateLimitResult = await checkRateLimit(arcjetWithApiRateLimit, request);
 *
 *   if (!rateLimitResult.allowed) {
 *     return createRateLimitResponse(rateLimitResult);
 *   }
 *
 *   // Your handler logic
 *   return NextResponse.json({ success: true });
 * }
 * ```
 *
 * Recommended rate limits by endpoint type:
 *
 * - Public read operations (GET /api/campaigns): arcjetWithSearchRateLimit (200/min)
 * - User submissions (POST /api/campaigns/submit): arcjetWithStrictRateLimit (10/min)
 * - Admin operations (POST /api/admin/*): arcjetWithStrictRateLimit (10/min)
 * - Bulk operations (POST /api/admin/bulk-import): arcjetWithCriticalRateLimit (3/5min)
 * - Authentication (POST /api/auth/*): arcjetWithStrictRateLimit (10/min)
 * - Search/Filter (GET /api/campaigns/search): arcjetWithSearchRateLimit (200/min)
 * - Reactions/Comments (POST /api/reactions): arcjetWithApiRateLimit (100/min)
 *
 * Note: These are starting recommendations. Monitor your application's usage
 * patterns and adjust limits accordingly.
 */

export {};
