/**
 * Analytics utility tests
 * Validates that analytics functions can be called without errors
 */

import { beforeEach, describe, expect, it, vi } from 'vitest';

// Mock posthog
vi.mock('posthog-js', () => ({
  default: {
    capture: vi.fn(),
    identify: vi.fn(),
    reset: vi.fn(),
  },
}));

describe('Analytics', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should export all tracking functions', async () => {
    const Analytics = await import('./Analytics');

    expect(typeof Analytics.trackPageView).toBe('function');
    expect(typeof Analytics.trackCampaignClick).toBe('function');
    expect(typeof Analytics.trackCampaignView).toBe('function');
    expect(typeof Analytics.trackReaction).toBe('function');
    expect(typeof Analytics.trackComment).toBe('function');
    expect(typeof Analytics.trackCommentReaction).toBe('function');
    expect(typeof Analytics.trackBookmark).toBe('function');
    expect(typeof Analytics.trackCampaignSubmission).toBe('function');
    expect(typeof Analytics.trackSearch).toBe('function');
    expect(typeof Analytics.trackFilter).toBe('function');
    expect(typeof Analytics.trackSocialMediaPrompt).toBe('function');
    expect(typeof Analytics.trackFeaturedImpression).toBe('function');
    expect(typeof Analytics.trackFeaturedClick).toBe('function');
    expect(typeof Analytics.trackAuth).toBe('function');
    expect(typeof Analytics.trackLanguageSwitch).toBe('function');
    expect(typeof Analytics.trackShare).toBe('function');
    expect(typeof Analytics.trackAdminAction).toBe('function');
    expect(typeof Analytics.identifyUser).toBe('function');
    expect(typeof Analytics.resetUser).toBe('function');
  });

  it('should handle tracking functions being called', async () => {
    const Analytics = await import('./Analytics');

    // These should not throw errors even if posthog is not initialized
    expect(() => Analytics.trackPageView('/test')).not.toThrow();
    expect(() => Analytics.trackCampaignClick('id', 'title', 'platform')).not.toThrow();
    expect(() => Analytics.trackReaction('id', 'still_works')).not.toThrow();
    expect(() => Analytics.trackComment('id', false)).not.toThrow();
    expect(() => Analytics.trackBookmark('id', 'added')).not.toThrow();
    expect(() => Analytics.trackSearch('query', 10)).not.toThrow();
  });
});
