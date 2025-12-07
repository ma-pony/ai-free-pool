import { afterEach, describe, expect, it } from 'vitest';
import { getAdminUserIds, isAdmin, isAdminById } from './AdminAuth';

describe('AdminAuth', () => {
  const originalEnv = process.env.ADMIN_USER_IDS;

  afterEach(() => {
    // Restore original environment
    if (originalEnv) {
      process.env.ADMIN_USER_IDS = originalEnv;
    } else {
      delete process.env.ADMIN_USER_IDS;
    }
  });

  describe('isAdmin', () => {
    it('should return false for unauthenticated users', () => {
      const auth = { userId: null };

      expect(isAdmin(auth)).toBe(false);
    });

    it('should return true for users with admin role in Clerk metadata', () => {
      const auth = {
        userId: 'user_123',
        sessionClaims: {
          metadata: {
            role: 'admin',
          },
        },
      };

      expect(isAdmin(auth)).toBe(true);
    });

    it('should return false for users without admin role', () => {
      const auth = {
        userId: 'user_123',
        sessionClaims: {
          metadata: {
            role: 'user',
          },
        },
      };

      expect(isAdmin(auth)).toBe(false);
    });

    it('should return true for users in ADMIN_USER_IDS environment variable', () => {
      process.env.ADMIN_USER_IDS = 'user_123,user_456';
      const auth = {
        userId: 'user_123',
      };

      expect(isAdmin(auth)).toBe(true);
    });

    it('should return false for users not in ADMIN_USER_IDS', () => {
      process.env.ADMIN_USER_IDS = 'user_123,user_456';
      const auth = {
        userId: 'user_789',
      };

      expect(isAdmin(auth)).toBe(false);
    });

    it('should handle whitespace in ADMIN_USER_IDS', () => {
      process.env.ADMIN_USER_IDS = ' user_123 , user_456 ';
      const auth = {
        userId: 'user_123',
      };

      expect(isAdmin(auth)).toBe(true);
    });
  });

  describe('getAdminUserIds', () => {
    it('should return empty array when ADMIN_USER_IDS is not set', () => {
      delete process.env.ADMIN_USER_IDS;

      expect(getAdminUserIds()).toEqual([]);
    });

    it('should return array of admin user IDs', () => {
      process.env.ADMIN_USER_IDS = 'user_123,user_456';

      expect(getAdminUserIds()).toEqual(['user_123', 'user_456']);
    });

    it('should trim whitespace from user IDs', () => {
      process.env.ADMIN_USER_IDS = ' user_123 , user_456 ';

      expect(getAdminUserIds()).toEqual(['user_123', 'user_456']);
    });

    it('should filter out empty strings', () => {
      process.env.ADMIN_USER_IDS = 'user_123,,user_456,';
      const ids = getAdminUserIds();

      expect(ids).toEqual(['user_123', 'user_456']);
    });
  });

  describe('isAdminById', () => {
    it('should return true for admin user ID', () => {
      process.env.ADMIN_USER_IDS = 'user_123,user_456';

      expect(isAdminById('user_123')).toBe(true);
    });

    it('should return false for non-admin user ID', () => {
      process.env.ADMIN_USER_IDS = 'user_123,user_456';

      expect(isAdminById('user_789')).toBe(false);
    });

    it('should return false when ADMIN_USER_IDS is not set', () => {
      delete process.env.ADMIN_USER_IDS;

      expect(isAdminById('user_123')).toBe(false);
    });
  });
});
