# Platform Filter Implementation

## Overview
Added platform filtering functionality to the campaign list page, allowing users to filter campaigns by one or multiple platforms.

## Changes Made

### 1. Type Definitions (`src/types/Campaign.ts`)
- Added `platformIds?: string[]` to `CampaignListFilters` type
- Supports filtering by multiple platforms simultaneously

### 2. Backend Service (`src/services/CampaignService.ts`)
- Updated `getCampaigns()` function to support `platformIds` filter
- Uses `inArray()` query for efficient multi-platform filtering
- Maintains backward compatibility with single `platformId` filter

### 3. API Route (`src/app/api/campaigns/route.ts`)
- Added `platforms` query parameter support
- Parses comma-separated platform IDs from URL
- Passes `platformIds` to service layer

### 4. Server Component (`src/app/[locale]/(marketing)/campaigns/page.tsx`)
- Fetches all active platforms using `getPlatforms({ status: 'active' })`
- Passes `availablePlatforms` to client component
- Platforms are fetched in parallel with other data for optimal performance

### 5. Client Component (`src/app/[locale]/(marketing)/campaigns/CampaignListClient.tsx`)
- Added `availablePlatforms` prop of type `Platform[]`
- Updated URL parameter handling to include `platforms`
- Updated API request to include `platformIds` parameter
- Preserves platform filters when applying quick filters
- Updated active filter count to include platform filters

### 6. Filter Components

#### FilterSidebar (`src/components/FilterSidebar.tsx`)
- Added `availablePlatforms` prop
- Added `handlePlatformToggle()` function for multi-select
- Added platform filter section between difficulty and categories
- Shows active platform count badge
- Collapsible section (default: collapsed)
- Updates `hasActiveFilters` to include platform filters

#### CampaignFilters (`src/components/CampaignFilters.tsx`)
- Added `availablePlatforms` prop
- Passes platforms to both desktop sidebar and mobile drawer
- Updated active filter count calculation

#### FilterDrawer (`src/components/FilterDrawer.tsx`)
- Added `availablePlatforms` prop
- Passes platforms to FilterSidebar component

### 7. Translations
Added to both `src/locales/zh.json` and `src/locales/en.json`:
- `Filters.platforms`: "平台" / "Platforms"
- `Filters.noPlatforms`: "暂无平台" / "No platforms available"

## Features

### Multi-Platform Selection
- Users can select multiple platforms simultaneously
- Checkbox-based interface for easy selection
- Shows count badge when platforms are selected

### URL Persistence
- Platform filters are saved in URL query parameters
- Format: `?platforms=id1,id2,id3`
- Enables sharing filtered views via URL

### Filter Integration
- Works seamlessly with existing filters (categories, AI models, conditions)
- Included in "Clear All" functionality
- Preserved when using quick filters

### UI/UX
- Collapsible section to save space (default: collapsed)
- Hover effects on checkboxes
- Active count badge for quick reference
- Consistent styling with other filter sections

## Database Query
The platform filter uses efficient SQL queries:
```sql
WHERE platform_id IN ('id1', 'id2', 'id3')
```

## Performance
- Platforms are fetched once on page load
- Only active platforms are shown
- Parallel data fetching with other resources
- Indexed database queries for fast filtering

## Testing Checklist
- [ ] Platform filter shows all active platforms
- [ ] Selecting platforms filters campaigns correctly
- [ ] Multiple platforms can be selected
- [ ] URL updates when platforms are selected
- [ ] Filters persist on page refresh
- [ ] "Clear All" removes platform filters
- [ ] Quick filters preserve platform selection
- [ ] Mobile drawer shows platform filter
- [ ] Count badge shows correct number
- [ ] Works with other filters (categories, AI models, etc.)

## Future Enhancements
- Add platform logos/icons to filter options
- Group platforms by category (if applicable)
- Add "Select All" / "Deselect All" buttons
- Show campaign count per platform
- Add platform search within filter
