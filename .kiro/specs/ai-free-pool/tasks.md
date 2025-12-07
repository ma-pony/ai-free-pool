# Implementation Plan

## Note: Base Template Features
The project is based on next-js-boilerplate which already includes:
- ✅ Next.js 16 + TypeScript + Tailwind CSS 4
- ✅ DrizzleORM + PostgreSQL (Neon)
- ✅ Clerk authentication (Google, GitHub OAuth)
- ✅ next-intl (i18n)
- ✅ React Hook Form + Zod
- ✅ Arcjet (Rate limiting, Bot detection)
- ✅ Vitest + Playwright (Testing)
- ✅ ESLint + Prettier + Lefthook
- ✅ Sentry (Error monitoring)
- ✅ PostHog (Analytics - can switch to Google Analytics)

## Additional Dependencies Needed
The following packages need to be installed:
- `openai` - For AI translation service
- `crypto-js` - For API encryption
- `@types/crypto-js` - TypeScript types
- `papaparse` - For CSV parsing (bulk import)
- `@types/papaparse` - TypeScript types
- `webpack-obfuscator` - For code obfuscation (production)
- `fast-check` - For property-based testing (optional)
- `react-ga4` or keep `posthog-js` - For analytics

## Tasks to Implement

- [x] 1. Configure Project for AI Free Pool
  - Update project name and branding
  - Configure Clerk for social login (Google, GitHub)
  - Set up OpenAI API key for translations
  - Configure Google Analytics (replace PostHog if needed)
  - Update AppConfig.ts with project details
  - _Requirements: All_

- [x] 2. Database Schema and Models
  - [x] 2.1 Create database schema with DrizzleORM
    - Define all 11 tables (platforms, campaigns, campaign_translations, condition_tags, campaign_condition_tags, tags, campaign_tags, reactions, comments, comment_reactions, bookmarks)
    - Set up relationships and constraints
    - Create indexes for performance
    - _Requirements: 1.1, 2.1, 8.1_

  - [ ]* 2.2 Write property test for database schema
    - **Property 1: Platform Creation Completeness**
    - **Validates: Requirements 1.1**

  - [x] 2.3 Generate and run database migrations
    - Generate migration files
    - Test migrations locally
    - _Requirements: 1.1, 2.1_

- [x] 3. Extend User Profile (Clerk already configured)
  - [x] 3.1 Create user profile page
    - Build profile layout with tabs
    - Show user info from Clerk
    - Display contribution statistics
    - _Requirements: 17.1, 17.2, 17.7_

  - [x] 3.2 Add profile customization
    - Allow username editing (if needed beyond Clerk)
    - Add avatar upload (Clerk handles this)
    - _Requirements: 17.3_

- [x] 4. Platform Management (Admin)
  - [x] 4.1 Create platform CRUD operations
    - Implement platform service layer
    - Create API routes for platforms
    - _Requirements: 1.1, 1.5_

  - [ ]* 4.2 Write property test for platform operations
    - **Property 2: Active Platform Filtering**
    - **Property 3: Platform Update Timestamp**
    - **Validates: Requirements 1.3, 1.5**

  - [x] 4.3 Create platform management UI (Admin)
    - Build platform list page
    - Build platform create/edit form
    - Add image upload for logos
    - _Requirements: 1.1, 1.2, 1.5_

  - [ ]* 4.4 Write unit tests for platform UI components
    - Test form validation
    - Test image upload
    - _Requirements: 1.1, 1.2_

- [x] 5. Campaign Management Core
  - [x] 5.1 Create campaign CRUD operations
    - Implement campaign service layer
    - Create API routes for campaigns
    - Implement soft delete
    - _Requirements: 2.1-2.6_

  - [ ]* 5.2 Write property test for campaign lifecycle
    - **Property 4: Campaign Expiration Auto-marking**
    - **Property 5: Expired Campaign Hiding**
    - **Property 7: Soft Delete Preservation**
    - **Validates: Requirements 2.3, 2.4, 2.6**

  - [x] 5.3 Implement condition tags system
    - Create condition tags CRUD
    - Implement tag association logic
    - Implement difficulty calculation
    - _Requirements: 2.7, 2.8, 2.12_

  - [ ]* 5.4 Write property test for difficulty calculation
    - **Property 6: Difficulty Level Calculation**
    - **Validates: Requirements 2.8**

  - [x] 5.5 Create campaign management UI (Admin)
    - Build campaign list page with filters
    - Build campaign create/edit form
    - Add condition tags selector
    - _Requirements: 2.1-2.12_

- [x] 6. Extend Multi-language Support (next-intl already configured)
  - [x] 6.1 Add Chinese locale
    - Create zh.json locale file
    - Add Chinese translations for UI
    - Test language switching
    - _Requirements: 8.1, 8.2_

  - [x] 6.2 Implement AI translation service
    - Create OpenAI API integration
    - Implement translation function
    - Add language detection
    - _Requirements: 8.4, 8.5_

  - [ ]* 6.3 Write property test for translation
    - **Property 15: Translation Locale Uniqueness**
    - **Property 16: Translation Round Trip**
    - **Validates: Requirements 8.5, 8.4**

  - [x] 6.3 Integrate translation into campaign workflow
    - Auto-translate on campaign submission
    - Allow manual translation editing
    - _Requirements: 8.4, 8.5, 8.6, 8.7_

- [x] 7. User Submission Workflow
  - [x] 7.1 Create campaign submission form (Frontend)
    - Build submission form UI
    - Implement form validation
    - Add platform selection/creation
    - _Requirements: 4.1, 4.2_

  - [x] 7.2 Implement submission API
    - Create submission endpoint
    - Set status to pending
    - Record submitter
    - Trigger AI translation
    - _Requirements: 4.3, 4.4, 8.4_

  - [ ]* 7.3 Write property test for submission workflow
    - **Property 8: User Submission Status**
    - **Validates: Requirements 4.3, 4.4**

  - [x] 7.4 Create admin review interface
    - Build pending campaigns list
    - Add approve/reject actions
    - Show AI translations with edit option
    - _Requirements: 4.5, 4.6, 8.6_

- [x] 8. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 9. Reaction System
  - [x] 9.1 Create reaction CRUD operations
    - Implement reaction service layer
    - Create API routes for reactions
    - Implement reaction statistics aggregation
    - _Requirements: 5.1-5.7_

  - [ ]* 9.2 Write property test for reactions
    - **Property 9: Reaction Uniqueness**
    - **Property 10: Reaction Statistics Accuracy**
    - **Property 11: Verification Trigger Threshold**
    - **Validates: Requirements 5.3, 5.5, 5.6, 5.7, 5.8**

  - [x] 9.3 Create reaction UI components
    - Build reaction buttons
    - Show reaction statistics
    - Highlight user's reaction
    - _Requirements: 5.1-5.7_

  - [x] 9.4 Implement verification alert system
    - Auto-mark campaigns needing verification
    - Create admin verification queue
    - _Requirements: 5.8, 5.9_

- [x] 10. Comment System
  - [x] 10.1 Create comment CRUD operations
    - Implement comment service layer
    - Create API routes for comments
    - Support nested replies
    - _Requirements: 6.1-6.4, 6.8_

  - [ ]* 10.2 Write property test for comments
    - **Property 12: Comment Nesting Integrity**
    - **Validates: Requirements 6.8**

  - [x] 10.2 Implement emoji reactions for comments
    - Create emoji reaction endpoints
    - Implement reaction aggregation
    - _Requirements: 6.5-6.7_

  - [ ]* 10.3 Write property test for emoji reactions
    - **Property 13: Emoji Reaction Uniqueness**
    - **Validates: Requirements 6.5, 6.7**

  - [x] 10.4 Create comment UI components
    - Build comment list with nesting
    - Build comment form
    - Add emoji reaction buttons
    - Show "useful" badge for admin-marked comments
    - _Requirements: 6.1-6.9_

- [x] 11. Bookmark System
  - [x] 11.1 Create bookmark CRUD operations
    - Implement bookmark service layer
    - Create API routes for bookmarks
    - _Requirements: 7.1-7.4_

  - [ ]* 11.2 Write property test for bookmarks
    - **Property 14: Bookmark Uniqueness**
    - **Validates: Requirements 7.2, 7.4**

  - [x] 11.3 Create bookmark UI
    - Add bookmark button to campaign cards
    - Create bookmarks page in user profile
    - Show expired status for bookmarked campaigns
    - _Requirements: 7.1-7.6_

- [x] 12. Search and Filter System
   - [x] 12.1 Implement search functionality
    - Create full-text search endpoint
    - Search across platform name, title, description
    - _Requirements: 9.1_

  - [ ]* 12.2 Write property test for search
    - **Property 17: Search Result Relevance**
    - **Validates: Requirements 9.1**

  - [x] 12.3 Implement filter system
    - Create filter API with multiple criteria
    - Support category, AI model, difficulty, conditions filters
    - _Requirements: 9.2-9.6_

  - [ ]* 12.4 Write property test for filters
    - **Property 18: Multi-Filter Conjunction**
    - **Validates: Requirements 9.8**

  - [x] 12.5 Create filter UI
    - Build filter sidebar (desktop)
    - Build filter drawer (mobile)
    - Add sort options
    - _Requirements: 9.2-9.8_

- [-] 13. Tag System
  - [x] 13.1 Create tag CRUD operations
    - Implement tag service layer
    - Create API routes for tags
    - _Requirements: 10.1-10.4_

  - [ ]* 13.2 Write property test for tags
    - **Property 19: Tag Association Uniqueness**
    - **Validates: Requirements 10.1**

  - [x] 13.3 Create tag management UI (Admin)
    - Build tag list page
    - Add tag create/edit form
    - Implement tag autocomplete
    - _Requirements: 10.1, 10.2_

  - [x] 13.4 Create tag browsing UI (Frontend)
    - Build tag cloud/list page
    - Add tag filtering
    - _Requirements: 10.3, 10.4_

- [x] 14. Featured Campaigns System
  - [x] 14.1 Implement featured campaign logic
    - Create featured campaign endpoints
    - Implement auto-expiration
    - Track impressions and clicks
    - _Requirements: 12.1-12.4_

  - [ ]* 14.2 Write property test for featured campaigns
    - **Property 20: Featured Campaign Expiration**
    - **Validates: Requirements 12.3**

  - [x] 14.3 Create featured management UI (Admin)
    - Build featured campaigns page
    - Add set/remove featured actions
    - Show statistics
    - _Requirements: 12.1, 12.5_

  - [x] 14.4 Display featured campaigns (Frontend)
    - Create featured carousel on homepage
    - Add featured badge to campaign cards
    - _Requirements: 12.2_

- [x] 15. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 16. Frontend Pages - Homepage
  - [x] 16.1 Create homepage layout
    - Build hero section
    - Add featured carousel
    - Show recent campaigns
    - Add category quick links
    - Add statistics section
    - _Requirements: 13.1-13.7_

  - [ ]* 16.2 Write unit tests for homepage components
    - Test carousel functionality
    - Test category links
    - _Requirements: 13.1-13.7_

- [x] 17. Frontend Pages - Campaign List
  - [x] 17.1 Create campaign list page
    - Build campaign cards grid
    - Implement infinite scroll/pagination
    - Add search bar
    - Integrate filter sidebar
    - _Requirements: 9.1-9.8_

  - [x] 17.2 Create campaign card component
    - Show platform logo and name
    - Display campaign info
    - Show condition tags
    - Display reaction statistics
    - Add bookmark button
    - _Requirements: 2.1-2.12, 5.1-5.7, 7.1-7.4_

- [x] 18. Frontend Pages - Campaign Detail
  - [x] 18.1 Create campaign detail page
    - Build campaign header
    - Show key information card
    - Display description
    - Add CTA button
    - _Requirements: 2.1-2.12_

  - [x] 18.2 Integrate reactions on detail page
    - Add reaction buttons
    - Show statistics
    - _Requirements: 5.1-5.9_

  - [x] 18.3 Integrate comments on detail page
    - Show comment list
    - Add comment form
    - Support replies and emoji reactions
    - _Requirements: 6.1-6.9_

  - [x] 18.4 Add related campaigns section
    - Show campaigns from same platform
    - Show campaigns in same category
    - _Requirements: 1.4_

- [x] 19. Frontend Pages - Platform Page
  - [x] 19.1 Create platform detail page
    - Build platform header
    - Show platform statistics
    - List active campaigns
    - Add collapsed expired campaigns section
    - _Requirements: 1.3, 1.4_

- [x] 20. Frontend Pages - User Profile
  - [x] 20.1 Create user profile page
    - Build profile sidebar
    - Show contribution statistics
    - _Requirements: 17.1, 17.2, 17.7_

  - [ ]* 20.2 Write property test for contribution statistics
    - **Property 25: User Contribution Statistics Accuracy**
    - **Validates: Requirements 17.7**

  - [x] 20.3 Create bookmarks tab
    - List bookmarked campaigns
    - Show expired status
    - _Requirements: 17.4, 7.5, 7.6_

  - [x] 20.4 Create submitted campaigns tab
    - List user's submissions
    - Show approval status
    - _Requirements: 17.5, 4.7_

  - [x] 20.5 Create settings tab
    - Add profile edit form
    - Allow avatar upload
    - _Requirements: 17.3_

- [x] 21. Admin Dashboard
  - [x] 21.1 Create admin layout
    - Build sidebar navigation
    - Add admin header
    - Implement access control
    - _Requirements: 11.1_

  - [x] 21.2 Create dashboard overview page
    - Show statistics cards
    - Add quick actions
    - Display recent activity
    - Show charts
    - _Requirements: 11.2, 11.9_

  - [x] 21.3 Create pending review page
    - List pending campaigns
    - Add batch operations
    - Show AI translations
    - Implement approve/reject actions
    - _Requirements: 11.3, 11.5_

  - [x] 21.4 Create verification needed page
    - List campaigns needing verification
    - Show user feedback statistics
    - Display recent comments
    - Add quick actions
    - _Requirements: 11.4_

  - [x] 21.5 Create bulk import page
    - Build file upload interface
    - Implement CSV/JSON parsing
    - Show preview and validation
    - Add import progress
    - _Requirements: 11.6, 11.7, 11.8_

  - [x] 21.6 Create settings page
    - Add general settings form
    - Add social media links form
    - Create condition tags management
    - Show security settings
    - _Requirements: 13.5, 13.6_

- [x] 22. Social Media Integration
  - [x] 22.1 Create social media components
    - Build social media icons
    - Create follow modal with QR codes
    - _Requirements: 13.5, 13.6_

  - [x] 22.2 Implement social media prompts
    - Add welcome modal (first visit)
    - Add prompt after 3rd bookmark
    - Add prompt on expired campaign view
    - _Requirements: 13.1-13.4_

  - [x] 22.3 Add social media to header/footer
    - Display icons in header
    - Add detailed info in footer
    - _Requirements: 13.5_

  - [x] 22.4 Create mobile social media navigation
    - Add to bottom navigation bar
    - _Requirements: 13.7_

- [x] 23. Mobile Optimization
  - [x] 23.1 Implement responsive layouts
    - Adapt all pages for mobile
    - Use Tailwind breakpoints
    - _Requirements: 14.1_

  - [x] 23.2 Create mobile navigation
    - Build bottom navigation bar
    - Add hamburger menu
    - _Requirements: 14.4_

  - [x] 23.3 Optimize mobile interactions
    - Ensure large touch targets
    - Add pull-to-refresh
    - Implement drawer for filters
    - _Requirements: 14.2, 14.3, 14.5, 14.6_

  - [x] 23.4 Add mobile sharing
    - Integrate native share API
    - _Requirements: 14.7_

- [x] 24. SEO Optimization
  - [x] 24.1 Implement SEO metadata
    - Add meta tags to all pages
    - Generate Open Graph tags
    - Create JSON-LD structured data
    - _Requirements: 15.1, 15.2, 15.3_

  - [ ]* 24.2 Write property test for SEO metadata
    - **Property 21: SEO Metadata Completeness**
    - **Validates: Requirements 15.1, 15.2, 15.3**

  - [x] 24.3 Create sitemap and robots.txt
    - Generate dynamic sitemap.xml
    - Create robots.txt
    - _Requirements: 15.4, 15.5_

  - [x] 24.4 Implement semantic URLs
    - Use slugs for campaigns and platforms
    - Create URL structure for categories
    - _Requirements: 15.6, 15.7, 15.8_

  - [ ]* 24.5 Write property test for URL slugs
    - **Property 22: URL Slug Uniqueness**
    - **Validates: Requirements 15.6, 15.7, 15.8**

- [x] 25. Enhance Security (Arcjet already configured)
  - [x] 25.1 Implement API encryption
    - Create encryption/decryption utilities using crypto-js
    - Apply to sensitive API routes
    - _Requirements: 18.2, 18.3, 18.4, 18.5_

  - [ ]* 25.2 Write property test for encryption
    - **Property 23: API Encryption Round Trip**
    - **Validates: Requirements 18.2, 18.3, 18.4, 18.5**

  - [x] 25.3 Configure Arcjet rate limiting
    - Adjust rate limits for API routes
    - Set appropriate thresholds
    - _Requirements: 18.6_

  - [ ]* 25.4 Write property test for rate limiting
    - **Property 24: Rate Limit Enforcement**
    - **Validates: Requirements 18.6**

  - [x] 25.5 Configure Arcjet bot detection
    - Review and adjust bot detection rules
    - Ensure search engines are allowed
    - _Requirements: 18.7_

  - [x] 25.6 Add code obfuscation
    - Install webpack-obfuscator
    - Configure for production builds
    - _Requirements: 18.1_

  - [x] 25.7 Add request validation
    - Implement request signature verification
    - Validate request origins
    - _Requirements: 18.8, 18.10_

- [x] 26. Analytics Integration (PostHog already configured, can use or replace)
  - [x] 26.1 Configure analytics (Google Analytics or keep PostHog)
    - If using GA: Initialize GA4 and remove PostHog
    - If keeping PostHog: Configure events
    - _Requirements: 16.1_

  - [x] 26.2 Implement event tracking
    - Track page views
    - Track campaign clicks
    - Track reactions and comments
    - Track bookmarks
    - Track submissions
    - Track searches
    - _Requirements: 16.1-16.6_

- [x] 27. Performance Optimization (Next.js optimizations already in place)
  - [x] 27.1 Optimize images
    - Use Next.js Image component for all images
    - Configure image optimization in next.config.ts
    - Add lazy loading where appropriate
    - _Requirements: 19.1, 19.3_

  - [x] 27.2 Optimize data fetching strategies
    - Implement ISR for campaign list pages
    - Use SSR for campaign detail pages
    - Use SSG for static pages (homepage, categories)
    - _Requirements: 19.6_

  - [x] 27.3 Optimize database queries
    - Add appropriate indexes to schema
    - Use DrizzleORM's eager loading
    - Implement efficient pagination
    - _Requirements: 19.2_

- [x] 28. Final Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 29. Deployment Preparation
  - [x] 29.1 Configure environment variables
    - Set up production environment variables
    - Configure Vercel secrets
    - _Requirements: All_

  - [x] 29.2 Test production build
    - Run production build locally
    - Test all features
    - _Requirements: All_

  - [x] 29.3 Deploy to Vercel
    - Connect GitHub repository
    - Configure build settings
    - Deploy to production
    - _Requirements: All_

  - [x] 29.4 Post-deployment verification
    - Test all features in production
    - Verify database connections
    - Check analytics tracking
    - Test authentication
    - _Requirements: All_
