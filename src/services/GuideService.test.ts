import type { GuideData } from './GuideService';
import { describe, expect, it } from 'vitest';
import { isSupportedGuide } from './GuideService';

describe('GuideService', () => {
  it('should recognize supported guide slugs', () => {
    expect(isSupportedGuide('free-ai-credits-2026')).toBe(true);
  });

  it('should reject unsupported guide slugs', () => {
    expect(isSupportedGuide('nonexistent-guide')).toBe(false);
    expect(isSupportedGuide('')).toBe(false);
  });

  it('should have correct GuideData type shape', () => {
    const mockGuide: GuideData = {
      slug: 'free-ai-credits-2026',
      platformGroups: [],
      totalPlatforms: 0,
      totalCampaigns: 0,
    };

    expect(mockGuide.slug).toBe('free-ai-credits-2026');
    expect(mockGuide.platformGroups).toEqual([]);
    expect(mockGuide.totalPlatforms).toBe(0);
    expect(mockGuide.totalCampaigns).toBe(0);
  });
});
