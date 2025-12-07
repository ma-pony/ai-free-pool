# Analytics Implementation

## Overview

AI Free Pool uses **PostHog** for comprehensive analytics tracking. PostHog is already configured and integrated throughout the application to track user behavior and platform metrics.

## Configuration

### Environment Variables

```env
NEXT_PUBLIC_POSTHOG_KEY=your_posthog_key
NEXT_PUBLIC_POSTHOG_HOST=https://us.i.posthog.com
```

### Setup

PostHog is initialized in `src/components/analytics/PostHogProvider.tsx` and wraps the entire application in `src/app/[locale]/layout.tsx`.

## Tracked Events

### Page Views (Requirement 16.1)
- **Event**: `$pageview`
- **Tracked automatically** on every page navigation
- **Properties**: `$current_url`, `path`

### Campaign Interactions

#### Campaign Clicks (Requirement 16.2)
- **Event**: `campaign_click`
- **Triggered**: When user clicks on a campaign card
- **Properties**:
  - `campaign_id`
  - `campaign_title`
  - `platform`

#### Campaign Views
- **Event**: `campaign_view`
- **Triggered**: When user views a campaign detail page
- **Properties**:
  - `campaign_id`
  - `campaign_title`
  - `platform`

### Reactions (Requirement 16.3)
- **Event**: `reaction_submitted`
- **Triggered**: When user submits a reaction (still_works, expired, info_incorrect)
- **Properties**:
  - `campaign_id`
  - `reaction_type`

### Comments (Requirement 16.3)
- **Event**: `comment_submitted`
- **Triggered**: When user posts a comment or reply
- **Properties**:
  - `campaign_id`
  - `is_reply`

#### Comment Reactions
- **Event**: `comment_reaction_added`
- **Triggered**: When user adds emoji reaction to a comment
- **Properties**:
  - `comment_id`
  - `emoji`

### Bookmarks (Requirement 16.4)
- **Event**: `bookmark_action`
- **Triggered**: When user adds or removes a bookmark
- **Properties**:
  - `campaign_id`
  - `action` (added/removed)

### Campaign Submissions (Requirement 16.5)
- **Event**: `campaign_submitted`
- **Triggered**: When user submits a new campaign
- **Properties**:
  - `platform`
  - `has_translation`

### Search (Requirement 16.6)
- **Event**: `search_performed`
- **Triggered**: When user performs a search
- **Properties**:
  - `query`
  - `results_count`

### Filters
- **Event**: `filter_applied`
- **Triggered**: When user applies a filter
- **Properties**:
  - `filter_type`
  - `filter_value`

### Featured Campaigns
- **Event**: `featured_impression`
- **Triggered**: When a featured campaign is displayed in carousel
- **Properties**:
  - `campaign_id`
  - `position`

- **Event**: `featured_click`
- **Triggered**: When user clicks on a featured campaign
- **Properties**:
  - `campaign_id`
  - `position`

### Social Media Prompts
- **Event**: `social_media_prompt`
- **Triggered**: When social media follow prompt is shown, clicked, or dismissed
- **Properties**:
  - `prompt_type` (welcome, bookmark_3rd, expired_campaign)
  - `action` (shown, clicked, dismissed)

### Authentication
- **Event**: `auth_action`
- **Triggered**: On sign in, sign up, or sign out
- **Properties**:
  - `action`
  - `provider` (google, github)

### Language Switch
- **Event**: `language_switched`
- **Triggered**: When user changes language
- **Properties**:
  - `from_locale`
  - `to_locale`

### Sharing
- **Event**: `campaign_shared`
- **Triggered**: When user shares a campaign
- **Properties**:
  - `campaign_id`
  - `share_method` (native_share, copy_link)

### Admin Actions
- **Event**: `admin_action`
- **Triggered**: When admin performs an action
- **Properties**:
  - `action`
  - `resource_type`
  - `resource_id`

## Usage

### In Components

```typescript
import { trackCampaignClick } from '@/libs/Analytics';

// Track campaign click
trackCampaignClick(campaign.id, campaign.title, platform.name);
```

### User Identification

```typescript
import { identifyUser, resetUser } from '@/libs/Analytics';

// Identify user on login
identifyUser(userId, {
  email: user.email,
  name: user.name,
});

// Reset on logout
resetUser();
```

## Analytics Dashboard

Access your PostHog dashboard at: https://app.posthog.com

### Key Metrics to Monitor

1. **User Engagement**
   - Page views
   - Session duration
   - Bounce rate

2. **Campaign Interactions**
   - Campaign views
   - Campaign clicks
   - Reaction submissions
   - Comment submissions
   - Bookmark additions

3. **User Contributions**
   - Campaign submissions
   - Approval rate
   - Average review time

4. **Search Behavior**
   - Search queries
   - Filter usage
   - Result click-through rate

## Testing

Analytics functions are tested in `src/libs/Analytics.test.ts`. Run tests with:

```bash
npm run test -- src/libs/Analytics.test.ts
```

## Privacy Considerations

- PostHog respects user privacy and GDPR compliance
- No personally identifiable information (PII) is tracked without consent
- Users can opt-out of analytics tracking
- All data is anonymized and aggregated

## Alternative: Google Analytics

If you prefer Google Analytics instead of PostHog:

1. Install react-ga4: `npm install react-ga4`
2. Update environment variables:
   ```env
   NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX
   ```
3. Replace PostHog calls in `src/libs/Analytics.ts` with GA4 equivalents
4. Remove PostHog provider from layout

## Troubleshooting

### Events Not Appearing

1. Check that `NEXT_PUBLIC_POSTHOG_KEY` is set correctly
2. Verify PostHog is initialized in the browser console
3. Check browser console for any errors
4. Ensure you're not blocking analytics with ad blockers

### Testing Locally

PostHog events are sent in both development and production. To test:

1. Open browser DevTools → Network tab
2. Filter by "posthog"
3. Perform actions in the app
4. Verify events are being sent

## Best Practices

1. **Consistent Naming**: Use snake_case for event names and properties
2. **Meaningful Properties**: Include context that helps understand user behavior
3. **Avoid PII**: Never track sensitive user information
4. **Test Events**: Verify events are tracked correctly before deploying
5. **Document Changes**: Update this file when adding new events
