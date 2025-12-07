import arcjet, { fixedWindow, shield, tokenBucket } from '@arcjet/next';

/**
 * Base Arcjet instance with shield protection
 * Can be extended with additional rules in specific routes
 *
 * Rate limiting strategies:
 * - Token Bucket: For API routes that need burst capacity
 * - Fixed Window: For strict rate limits on sensitive operations
 *
 * Usage in routes:
 * ```typescript
 * import arcjet from '@/libs/Arcjet';
 * import { tokenBucket } from '@arcjet/next';
 *
 * const aj = arcjet.withRule(
 *   tokenBucket({
 *     mode: 'LIVE',
 *     refillRate: 10,
 *     interval: 60,
 *     capacity: 100,
 *   })
 * );
 *
 * const decision = await aj.protect(request);
 * if (decision.isDenied()) {
 *   return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
 * }
 * ```
 */

// Create a base Arcjet instance which can be imported and extended in each route.
export default arcjet({
  // Get your site key from https://launch.arcjet.com/Q6eLbRE
  // Use `process.env` instead of Env to reduce bundle size in middleware
  key: process.env.ARCJET_KEY ?? '',
  // Identify the user by their IP address
  characteristics: ['ip.src'],
  rules: [
    // Protect against common attacks with Arcjet Shield
    shield({
      mode: 'LIVE', // will block requests. Use "DRY_RUN" to log only
    }),
    // Other rules are added in different routes
  ],
});

/**
 * Arcjet instance with general API rate limiting
 * Suitable for most API routes
 * - 100 requests per minute per IP
 * - Allows bursts up to 120 requests
 */
export const arcjetWithApiRateLimit = arcjet({
  key: process.env.ARCJET_KEY ?? '',
  characteristics: ['ip.src'],
  rules: [
    shield({ mode: 'LIVE' }),
    tokenBucket({
      mode: 'LIVE',
      refillRate: 100, // 100 tokens per interval
      interval: 60, // 60 seconds
      capacity: 120, // Maximum 120 tokens (allows small bursts)
    }),
  ],
});

/**
 * Arcjet instance with strict rate limiting for sensitive operations
 * Use for: user submissions, admin operations, authentication
 * - 10 requests per minute per IP
 * - No burst capacity
 */
export const arcjetWithStrictRateLimit = arcjet({
  key: process.env.ARCJET_KEY ?? '',
  characteristics: ['ip.src'],
  rules: [
    shield({ mode: 'LIVE' }),
    fixedWindow({
      mode: 'LIVE',
      window: '60s', // 60 second window
      max: 10, // Maximum 10 requests per window
    }),
  ],
});

/**
 * Arcjet instance with very strict rate limiting for critical operations
 * Use for: password resets, account deletion, bulk operations
 * - 3 requests per 5 minutes per IP
 */
export const arcjetWithCriticalRateLimit = arcjet({
  key: process.env.ARCJET_KEY ?? '',
  characteristics: ['ip.src'],
  rules: [
    shield({ mode: 'LIVE' }),
    fixedWindow({
      mode: 'LIVE',
      window: '300s', // 5 minute window
      max: 3, // Maximum 3 requests per window
    }),
  ],
});

/**
 * Arcjet instance for search and filter operations
 * More lenient to allow for user exploration
 * - 200 requests per minute per IP
 */
export const arcjetWithSearchRateLimit = arcjet({
  key: process.env.ARCJET_KEY ?? '',
  characteristics: ['ip.src'],
  rules: [
    shield({ mode: 'LIVE' }),
    tokenBucket({
      mode: 'LIVE',
      refillRate: 200, // 200 tokens per interval
      interval: 60, // 60 seconds
      capacity: 250, // Allow bursts for rapid filtering
    }),
  ],
});
