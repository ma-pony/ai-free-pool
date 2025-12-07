# Security Implementation Guide

## Overview

This document describes the security measures implemented in the AI Free Pool application, covering encryption, rate limiting, bot detection, code obfuscation, and request validation.

## Table of Contents

1. [API Encryption](#api-encryption)
2. [Rate Limiting](#rate-limiting)
3. [Bot Detection](#bot-detection)
4. [Code Obfuscation](#code-obfuscation)
5. [Request Validation](#request-validation)
6. [Security Best Practices](#security-best-practices)
7. [Monitoring and Logging](#monitoring-and-logging)

## API Encryption

### Overview

API encryption protects sensitive data transmitted between client and server using AES-256 encryption.

**Validates**: Requirements 18.2, 18.3, 18.4, 18.5

### Implementation

```typescript
import { createEncryptedResponse, getDecryptedBody } from '@/utils/ApiSecurity';
// Client-side: Encrypt request and decrypt response
import { createEncryptedRequest, decryptResponse } from '@/utils/ApiSecurity';

import { decryptData, encryptData } from '@/utils/Encryption';

// Server-side: Decrypt request and encrypt response
export async function POST(request: NextRequest) {
  const body = await getDecryptedBody(request);
  const result = await processData(body);
  return createEncryptedResponse(result);
}

const { body, headers } = createEncryptedRequest(data);
const response = await fetch('/api/endpoint', {
  method: 'POST',
  headers,
  body,
});
const result = await decryptResponse(response);
```

### Configuration

Set the encryption key in environment variables:

```bash
# Generate a secure key
openssl rand -hex 32

# Add to .env.local
API_ENCRYPTION_KEY=your_generated_key_here
```

### When to Use

- ✅ User submissions with personal data
- ✅ Admin operations
- ✅ Authentication endpoints
- ✅ Payment information
- ❌ Public data (campaign listings)
- ❌ Search queries

## Rate Limiting

### Overview

Rate limiting prevents abuse by limiting the number of requests from a single IP address.

**Validates**: Requirements 18.6

### Implementation

```typescript
import { arcjetWithApiRateLimit } from '@/libs/Arcjet';
import { withRateLimit } from '@/utils/RateLimitHelpers';

const handler = async (request: NextRequest) => {
  // Your handler logic
  return NextResponse.json({ success: true });
};

export const POST = withRateLimit(handler, arcjetWithApiRateLimit);
```

### Rate Limit Tiers

| Tier | Requests | Window | Use Case |
|------|----------|--------|----------|
| Search | 200 | 1 min | Search, filter operations |
| API | 100 | 1 min | General API routes |
| Strict | 10 | 1 min | User submissions, admin |
| Critical | 3 | 5 min | Bulk operations, sensitive |

### Configuration

Rate limits are configured in `src/libs/Arcjet.ts`:

```typescript
export const arcjetWithApiRateLimit = arcjet({
  key: process.env.ARCJET_KEY ?? '',
  characteristics: ['ip.src'],
  rules: [
    shield({ mode: 'LIVE' }),
    tokenBucket({
      mode: 'LIVE',
      refillRate: 100,
      interval: 60,
      capacity: 120,
    }),
  ],
});
```

### Customizing Limits

Adjust limits based on your traffic patterns:

```typescript
// More lenient for high-traffic endpoints
refillRate: 200,
capacity: 250,

// Stricter for sensitive operations
refillRate: 5,
capacity: 10,
```

## Bot Detection

### Overview

Bot detection blocks malicious bots while allowing legitimate crawlers (search engines, social media).

**Validates**: Requirements 18.7

### Implementation

Bot detection is configured in the middleware (`src/proxy.ts`):

```typescript
const aj = arcjet.withRule(
  detectBot({
    mode: 'LIVE',
    allow: [
      'CATEGORY:SEARCH_ENGINE', // Google, Bing, etc.
      'CATEGORY:PREVIEW', // Social media previews
      'CATEGORY:MONITOR', // Uptime monitors
    ],
  }),
);
```

### Allowed Bots

- ✅ Search engines (Google, Bing, Baidu, Yandex, DuckDuckGo)
- ✅ Social media preview bots (Facebook, Twitter, LinkedIn)
- ✅ Uptime monitoring services
- ❌ Scrapers and crawlers
- ❌ Automated testing tools
- ❌ Malicious bots

### API Route Protection

```typescript
import { withBotProtection } from '@/utils/BotDetection';

const handler = async (request: NextRequest) => {
  return NextResponse.json({ success: true });
};

// Block all bots
export const POST = withBotProtection(handler, false);

// Allow good bots
export const GET = withBotProtection(handler, true);
```

## Code Obfuscation

### Overview

Code obfuscation makes client-side JavaScript harder to read and reverse engineer.

**Validates**: Requirements 18.1

### Configuration

Enable obfuscation in production builds:

```bash
# .env.production
ENABLE_CODE_OBFUSCATION=true
```

### Build Commands

```bash
# With obfuscation (slower, more secure)
ENABLE_CODE_OBFUSCATION=true npm run build

# Without obfuscation (faster, for debugging)
npm run build
```

### Impact

- **Build time**: 2-3x slower
- **Bundle size**: ~10% larger
- **Runtime**: Minimal impact

See [CODE_OBFUSCATION.md](./CODE_OBFUSCATION.md) for detailed documentation.

## Request Validation

### Overview

Request validation ensures requests come from legitimate sources and meet security requirements.

**Validates**: Requirements 18.8, 18.10

### Implementation

```typescript
import { withRequestValidation } from '@/utils/RequestValidation';

const handler = async (request: NextRequest) => {
  return NextResponse.json({ success: true });
};

export const POST = withRequestValidation(handler, {
  allowedOrigins: [process.env.NEXT_PUBLIC_APP_URL!],
  requireCSRF: true,
  allowedMethods: ['POST'],
  allowedContentTypes: ['application/json'],
});
```

### Validation Types

1. **Origin Validation**: Checks request origin
2. **Method Validation**: Ensures correct HTTP method
3. **Content-Type Validation**: Validates content type
4. **CSRF Protection**: Prevents cross-site request forgery
5. **Size Validation**: Limits request size
6. **Header Validation**: Checks required headers

### CSRF Protection

For state-changing operations:

```typescript
export const POST = withRequestValidation(handler, {
  requireCSRF: true,
});
```

Client must include CSRF token:

```typescript
headers: {
  'x-csrf-token': getCsrfToken(),
}
```

## Security Best Practices

### 1. Defense in Depth

Apply multiple security layers:

```typescript
export const POST = withRequestValidation(
  withRateLimit(
    withBotProtection(
      withApiSecurity(handler, { requireEncryption: true }),
      false
    ),
    arcjetWithStrictRateLimit
  ),
  {
    allowedOrigins: [process.env.NEXT_PUBLIC_APP_URL!],
    requireCSRF: true,
  }
);
```

### 2. Environment Variables

Never hardcode secrets:

```typescript
// ❌ Bad
const apiKey = 'sk-1234567890';

// ✅ Good
const apiKey = process.env.OPENAI_API_KEY;
```

### 3. HTTPS Only

Always use HTTPS in production:

```typescript
// next.config.ts
const config = {
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=31536000; includeSubDomains',
          },
        ],
      },
    ];
  },
};
```

### 4. Input Validation

Always validate user input:

```typescript
import { z } from 'zod';

const schema = z.object({
  email: z.string().email(),
  age: z.number().min(0).max(120),
});

const result = schema.safeParse(input);
if (!result.success) {
  return NextResponse.json(
    { error: 'Invalid input' },
    { status: 400 }
  );
}
```

### 5. Error Handling

Don't leak sensitive information:

```typescript
// ❌ Bad
catch (error) {
  return NextResponse.json({ error: error.message });
}

// ✅ Good
catch (error) {
  console.error('Error:', error);
  return NextResponse.json(
    { error: 'An error occurred' },
    { status: 500 }
  );
}
```

### 6. Authentication

Use Clerk for authentication:

```typescript
import { auth } from '@clerk/nextjs/server';

export async function POST(request: NextRequest) {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }

  // Process authenticated request
}
```

### 7. Authorization

Check permissions:

```typescript
import { auth, clerkClient } from '@clerk/nextjs/server';

export async function POST(request: NextRequest) {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }

  const user = await clerkClient.users.getUser(userId);
  const isAdmin = user.publicMetadata.role === 'admin';

  if (!isAdmin) {
    return NextResponse.json(
      { error: 'Forbidden' },
      { status: 403 }
    );
  }

  // Process admin request
}
```

## Monitoring and Logging

### 1. Security Events

Log security-related events:

```typescript
import { logBotAccess } from '@/utils/BotDetection';
import { logRateLimitViolation } from '@/utils/RateLimitHelpers';
import { logValidationFailure } from '@/utils/RequestValidation';

// These functions automatically log to console
// In production, integrate with monitoring services
```

### 2. Sentry Integration

Monitor errors and security issues:

```typescript
import * as Sentry from '@sentry/nextjs';

Sentry.captureException(error, {
  tags: {
    security: true,
    type: 'rate_limit_violation',
  },
  extra: {
    ip: getRealIP(request),
    path: request.url,
  },
});
```

### 3. Metrics to Track

- Rate limit violations
- Bot detection blocks
- Validation failures
- Authentication failures
- Unusual traffic patterns
- Error rates by endpoint

### 4. Alerts

Set up alerts for:

- High rate of 429 responses (rate limiting)
- High rate of 403 responses (bot detection)
- Spike in 401/403 responses (auth issues)
- Unusual traffic from single IP
- Multiple failed login attempts

## Security Checklist

### Development

- [ ] Use environment variables for secrets
- [ ] Validate all user input
- [ ] Implement proper error handling
- [ ] Use HTTPS in development (optional)
- [ ] Test security features locally

### Staging

- [ ] Enable all security features
- [ ] Test rate limiting
- [ ] Test bot detection
- [ ] Verify encryption works
- [ ] Check CSRF protection
- [ ] Review logs for issues

### Production

- [ ] Enable code obfuscation
- [ ] Configure Arcjet with production key
- [ ] Set up monitoring and alerts
- [ ] Enable HTTPS (required)
- [ ] Review and adjust rate limits
- [ ] Set up IP whitelist for admin (optional)
- [ ] Enable security headers
- [ ] Regular security audits

## Troubleshooting

### Rate Limiting Issues

**Problem**: Legitimate users getting rate limited

**Solution**:
1. Increase rate limits for affected endpoints
2. Use user-based rate limiting instead of IP-based
3. Implement exponential backoff on client

### Bot Detection Issues

**Problem**: Search engines being blocked

**Solution**:
1. Check allowed bot categories in `src/proxy.ts`
2. Add specific bot to allow list
3. Verify Arcjet configuration

### Encryption Issues

**Problem**: Decryption fails

**Solution**:
1. Verify API_ENCRYPTION_KEY is set correctly
2. Check key matches between client and server
3. Ensure data is properly encrypted before sending

### Validation Issues

**Problem**: Valid requests being rejected

**Solution**:
1. Check allowed origins list
2. Verify CSRF token is being sent
3. Check content-type headers
4. Review validation logs

## References

- [Arcjet Documentation](https://docs.arcjet.com/)
- [Next.js Security](https://nextjs.org/docs/app/building-your-application/configuring/security)
- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Clerk Security](https://clerk.com/docs/security)
- [Sentry Security](https://docs.sentry.io/product/security/)

## Support

For security issues or questions:

1. Check this documentation
2. Review example files in `src/utils/*Example.ts`
3. Check Arcjet dashboard for insights
4. Review Sentry for error patterns
5. Contact security team (if applicable)

## Updates

This document should be updated when:

- New security features are added
- Rate limits are adjusted
- Bot detection rules change
- Security vulnerabilities are discovered
- Best practices evolve

**Last Updated**: December 2024
