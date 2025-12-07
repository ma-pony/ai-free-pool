import type { NextFetchEvent, NextRequest } from 'next/server';
import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import createMiddleware from 'next-intl/middleware';
import { routing } from './libs/I18nRouting';

const handleI18nRouting = createMiddleware(routing);

const isProtectedRoute = createRouteMatcher([
  '/dashboard(.*)',
  '/:locale/dashboard(.*)',
  '/admin(.*)',
  '/:locale/admin(.*)',
  '/api/admin(.*)',
]);

export default async function middleware(
  request: NextRequest,
  event: NextFetchEvent,
) {
  const isApiRoute = request.nextUrl.pathname.startsWith('/api');

  // For API routes, run Clerk middleware without i18n
  if (isApiRoute) {
    return clerkMiddleware(async (auth, req) => {
      if (isProtectedRoute(req)) {
        await auth.protect();
      }
    })(request, event);
  }

  // Run Clerk middleware for all routes to enable auth() usage
  return clerkMiddleware(async (auth, req) => {
    if (isProtectedRoute(req)) {
      // Match both /dashboard and /admin routes
      const locale = req.nextUrl.pathname.match(/(\/.*)\/(?:dashboard|admin)/)?.at(1) ?? '';

      const signInUrl = new URL(`${locale}/sign-in`, req.url);

      await auth.protect({
        unauthenticatedUrl: signInUrl.toString(),
      });
    }

    return handleI18nRouting(req);
  })(request, event);
}

export const config = {
  // Match all pathnames except for
  // - … if they start with `/_next`, `/_vercel` or `monitoring`
  // - … the ones containing a dot (e.g. `favicon.ico`)
  matcher: [
    '/((?!_next|_vercel|monitoring|.*\\..*).*)',
  ],
};
