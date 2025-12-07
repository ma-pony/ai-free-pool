/**
 * Admin Authentication Utilities
 *
 * This module provides utilities for checking admin permissions.
 * It supports two methods:
 * 1. Clerk roles (via session claims metadata)
 * 2. Environment variable whitelist (ADMIN_USER_IDS)
 */

/**
 * Check if a user has admin privileges
 *
 * @param auth - Clerk auth object from auth() or currentUser()
 * @returns true if user is an admin, false otherwise
 */
export function isAdmin(auth: { userId: string | null; sessionClaims?: any }): boolean {
  const { userId, sessionClaims } = auth;

  if (!userId) {
    return false;
  }

  // Method 1: Check Clerk role metadata
  // In Clerk Dashboard, you can set user metadata with role: 'admin'
  const clerkRole = sessionClaims?.metadata?.role;
  if (clerkRole === 'admin') {
    return true;
  }

  // Method 2: Check environment variable whitelist
  const adminIds = process.env.ADMIN_USER_IDS?.split(',').map(id => id.trim()) || [];
  if (adminIds.includes(userId)) {
    return true;
  }

  return false;
}

/**
 * Get admin user IDs from environment variable
 *
 * @returns Array of admin user IDs
 */
export function getAdminUserIds(): string[] {
  return process.env.ADMIN_USER_IDS?.split(',').map(id => id.trim()).filter(Boolean) || [];
}

/**
 * Check if user ID is in admin whitelist
 *
 * @param userId - Clerk user ID to check
 * @returns true if user ID is in admin list
 */
export function isAdminById(userId: string): boolean {
  const adminIds = getAdminUserIds();
  return adminIds.includes(userId);
}
