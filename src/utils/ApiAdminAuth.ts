/**
 * API Admin Authentication Middleware
 *
 * Utilities for protecting API routes that require admin access
 */

import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { isAdmin } from './AdminAuth';

/**
 * Check if the current request is from an admin user
 * Returns error response if not authenticated or not admin
 *
 * @returns Object with { isAdmin: true, userId: string } if admin, or NextResponse error
 *
 * @example
 * ```typescript
 * export async function POST(request: NextRequest) {
 *   const adminCheck = await requireAdmin();
 *   if (adminCheck instanceof NextResponse) {
 *     return adminCheck; // Return error response
 *   }
 *
 *   const { userId } = adminCheck;
 *   // Continue with admin logic...
 * }
 * ```
 */
export async function requireAdmin(): Promise<
  | { isAdmin: true; userId: string; sessionClaims?: any }
  | NextResponse
> {
  const authData = await auth();
  const { userId, sessionClaims } = authData;

  // Check authentication
  if (!userId) {
    return NextResponse.json(
      {
        success: false,
        error: 'Authentication required',
      },
      { status: 401 },
    );
  }

  // Check admin permissions
  if (!isAdmin(authData)) {
    return NextResponse.json(
      {
        success: false,
        error: 'Admin access required',
      },
      { status: 403 },
    );
  }

  return {
    isAdmin: true,
    userId,
    sessionClaims,
  };
}

/**
 * Check if the current request is from an admin user (non-throwing version)
 *
 * @returns Object with admin status and user info
 *
 * @example
 * ```typescript
 * export async function GET(request: NextRequest) {
 *   const { isAdmin, userId } = await checkAdmin();
 *
 *   if (!isAdmin) {
 *     return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
 *   }
 *
 *   // Continue with admin logic...
 * }
 * ```
 */
export async function checkAdmin(): Promise<{
  isAdmin: boolean;
  userId: string | null;
  sessionClaims?: any;
}> {
  const authData = await auth();
  const { userId, sessionClaims } = authData;

  if (!userId) {
    return { isAdmin: false, userId: null };
  }

  return {
    isAdmin: isAdmin(authData),
    userId,
    sessionClaims,
  };
}
