/**
 * Analytics utility for tracking user events
 * Uses PostHog for analytics tracking
 */

import posthog from 'posthog-js';

/**
 * Track a page view event
 * @param path - The page path
 */
export function trackPageView(path: string): void {
  if (typeof window !== 'undefined' && posthog) {
    posthog.capture('$pageview', {
      $current_url: window.origin + path,
      path,
    });
  }
}

/**
 * Track a campaign click event
 * @param campaignId - The campaign ID
 * @param campaignTitle - The campaign title
 * @param platform - The platform name
 */
export function trackCampaignClick(
  campaignId: string,
  campaignTitle: string,
  platform: string,
): void {
  if (typeof window !== 'undefined' && posthog) {
    posthog.capture('campaign_click', {
      campaign_id: campaignId,
      campaign_title: campaignTitle,
      platform,
    });
  }
}

/**
 * Track a campaign view event
 * @param campaignId - The campaign ID
 * @param campaignTitle - The campaign title
 * @param platform - The platform name
 */
export function trackCampaignView(
  campaignId: string,
  campaignTitle: string,
  platform: string,
): void {
  if (typeof window !== 'undefined' && posthog) {
    posthog.capture('campaign_view', {
      campaign_id: campaignId,
      campaign_title: campaignTitle,
      platform,
    });
  }
}

/**
 * Track a reaction submission event
 * @param campaignId - The campaign ID
 * @param reactionType - The type of reaction (still_works, expired, info_incorrect)
 */
export function trackReaction(
  campaignId: string,
  reactionType: 'still_works' | 'expired' | 'info_incorrect',
): void {
  if (typeof window !== 'undefined' && posthog) {
    posthog.capture('reaction_submitted', {
      campaign_id: campaignId,
      reaction_type: reactionType,
    });
  }
}

/**
 * Track a comment submission event
 * @param campaignId - The campaign ID
 * @param isReply - Whether this is a reply to another comment
 */
export function trackComment(campaignId: string, isReply: boolean = false): void {
  if (typeof window !== 'undefined' && posthog) {
    posthog.capture('comment_submitted', {
      campaign_id: campaignId,
      is_reply: isReply,
    });
  }
}

/**
 * Track a comment emoji reaction event
 * @param commentId - The comment ID
 * @param emoji - The emoji used
 */
export function trackCommentReaction(commentId: string, emoji: string): void {
  if (typeof window !== 'undefined' && posthog) {
    posthog.capture('comment_reaction_added', {
      comment_id: commentId,
      emoji,
    });
  }
}

/**
 * Track a bookmark event
 * @param campaignId - The campaign ID
 * @param action - Whether the bookmark was added or removed
 */
export function trackBookmark(
  campaignId: string,
  action: 'added' | 'removed',
): void {
  if (typeof window !== 'undefined' && posthog) {
    posthog.capture('bookmark_action', {
      campaign_id: campaignId,
      action,
    });
  }
}

/**
 * Track a campaign submission event
 * @param platformName - The platform name
 * @param hasTranslation - Whether AI translation was used
 */
export function trackCampaignSubmission(
  platformName: string,
  hasTranslation: boolean,
): void {
  if (typeof window !== 'undefined' && posthog) {
    posthog.capture('campaign_submitted', {
      platform: platformName,
      has_translation: hasTranslation,
    });
  }
}

/**
 * Track a search event
 * @param query - The search query
 * @param resultsCount - Number of results returned
 */
export function trackSearch(query: string, resultsCount: number): void {
  if (typeof window !== 'undefined' && posthog) {
    posthog.capture('search_performed', {
      query,
      results_count: resultsCount,
    });
  }
}

/**
 * Track a filter usage event
 * @param filterType - The type of filter applied
 * @param filterValue - The filter value
 */
export function trackFilter(filterType: string, filterValue: string): void {
  if (typeof window !== 'undefined' && posthog) {
    posthog.capture('filter_applied', {
      filter_type: filterType,
      filter_value: filterValue,
    });
  }
}

/**
 * Track a social media follow prompt event
 * @param promptType - The type of prompt (welcome, bookmark_3rd, expired_campaign)
 * @param action - User action (shown, clicked, dismissed)
 */
export function trackSocialMediaPrompt(
  promptType: 'welcome' | 'bookmark_3rd' | 'expired_campaign',
  action: 'shown' | 'clicked' | 'dismissed',
): void {
  if (typeof window !== 'undefined' && posthog) {
    posthog.capture('social_media_prompt', {
      prompt_type: promptType,
      action,
    });
  }
}

/**
 * Track a featured campaign impression
 * @param campaignId - The campaign ID
 * @param position - The position in the carousel
 */
export function trackFeaturedImpression(
  campaignId: string,
  position: number,
): void {
  if (typeof window !== 'undefined' && posthog) {
    posthog.capture('featured_impression', {
      campaign_id: campaignId,
      position,
    });
  }
}

/**
 * Track a featured campaign click
 * @param campaignId - The campaign ID
 * @param position - The position in the carousel
 */
export function trackFeaturedClick(campaignId: string, position: number): void {
  if (typeof window !== 'undefined' && posthog) {
    posthog.capture('featured_click', {
      campaign_id: campaignId,
      position,
    });
  }
}

/**
 * Track user authentication events
 * @param action - The authentication action (sign_in, sign_up, sign_out)
 * @param provider - The OAuth provider (google, github)
 */
export function trackAuth(
  action: 'sign_in' | 'sign_up' | 'sign_out',
  provider?: 'google' | 'github',
): void {
  if (typeof window !== 'undefined' && posthog) {
    posthog.capture('auth_action', {
      action,
      provider,
    });
  }
}

/**
 * Track language switch event
 * @param fromLocale - The previous locale
 * @param toLocale - The new locale
 */
export function trackLanguageSwitch(fromLocale: string, toLocale: string): void {
  if (typeof window !== 'undefined' && posthog) {
    posthog.capture('language_switched', {
      from_locale: fromLocale,
      to_locale: toLocale,
    });
  }
}

/**
 * Track mobile share event
 * @param campaignId - The campaign ID
 * @param shareMethod - The share method used
 */
export function trackShare(campaignId: string, shareMethod: string): void {
  if (typeof window !== 'undefined' && posthog) {
    posthog.capture('campaign_shared', {
      campaign_id: campaignId,
      share_method: shareMethod,
    });
  }
}

/**
 * Track admin actions
 * @param action - The admin action performed
 * @param resourceType - The type of resource (campaign, platform, tag, etc.)
 * @param resourceId - The resource ID
 */
export function trackAdminAction(
  action: string,
  resourceType: string,
  resourceId?: string,
): void {
  if (typeof window !== 'undefined' && posthog) {
    posthog.capture('admin_action', {
      action,
      resource_type: resourceType,
      resource_id: resourceId,
    });
  }
}

/**
 * Identify a user for analytics
 * @param userId - The user ID
 * @param properties - Additional user properties
 */
export function identifyUser(
  userId: string,
  properties?: Record<string, any>,
): void {
  if (typeof window !== 'undefined' && posthog) {
    posthog.identify(userId, properties);
  }
}

/**
 * Reset user identity (on logout)
 */
export function resetUser(): void {
  if (typeof window !== 'undefined' && posthog) {
    posthog.reset();
  }
}
