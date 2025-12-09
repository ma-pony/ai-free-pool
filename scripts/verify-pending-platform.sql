-- SQL queries to verify pending platform functionality
-- Run these queries in your database client or Drizzle Studio

-- 1. Check if pending_platform column exists
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'campaigns'
  AND column_name IN ('platform_id', 'pending_platform');

-- Expected result:
-- platform_id    | uuid  | YES
-- pending_platform | jsonb | YES


-- 2. Check all campaigns with their platform status
SELECT 
  id,
  slug,
  status,
  platform_id,
  pending_platform,
  submitted_by,
  created_at
FROM campaigns
WHERE deleted_at IS NULL
ORDER BY created_at DESC
LIMIT 10;


-- 3. Find campaigns with pending platforms
SELECT 
  id,
  slug,
  status,
  pending_platform,
  created_at
FROM campaigns
WHERE pending_platform IS NOT NULL
  AND deleted_at IS NULL
ORDER BY created_at DESC;


-- 4. Find pending campaigns (awaiting review)
SELECT 
  c.id,
  c.slug,
  c.status,
  c.platform_id,
  c.pending_platform,
  c.submitted_by,
  c.created_at,
  ct.title as campaign_title
FROM campaigns c
LEFT JOIN campaign_translations ct ON c.id = ct.campaign_id AND ct.locale = 'zh'
WHERE c.status = 'pending'
  AND c.deleted_at IS NULL
ORDER BY c.created_at DESC;


-- 5. Statistics
SELECT 
  status,
  COUNT(*) as total,
  COUNT(*) FILTER (WHERE pending_platform IS NOT NULL) as with_pending_platform,
  COUNT(*) FILTER (WHERE platform_id IS NULL) as without_platform
FROM campaigns
WHERE deleted_at IS NULL
GROUP BY status;


-- 6. Check if any platforms were created from pending platforms
-- (Look for platforms created around the same time as campaign approval)
SELECT 
  p.id,
  p.name,
  p.slug,
  p.created_at as platform_created,
  c.id as campaign_id,
  c.slug as campaign_slug,
  c.updated_at as campaign_updated
FROM platforms p
JOIN campaigns c ON c.platform_id = p.id
WHERE c.submitted_by IS NOT NULL
  AND c.status = 'published'
  AND p.created_at >= c.created_at
  AND p.created_at <= c.updated_at + INTERVAL '1 minute'
ORDER BY p.created_at DESC;


-- 7. Detailed view of a specific pending campaign (replace with actual ID)
-- SELECT 
--   c.*,
--   ct_zh.title as title_zh,
--   ct_zh.description as description_zh,
--   ct_en.title as title_en,
--   ct_en.description as description_en,
--   p.name as platform_name
-- FROM campaigns c
-- LEFT JOIN campaign_translations ct_zh ON c.id = ct_zh.campaign_id AND ct_zh.locale = 'zh'
-- LEFT JOIN campaign_translations ct_en ON c.id = ct_en.campaign_id AND ct_en.locale = 'en'
-- LEFT JOIN platforms p ON c.platform_id = p.id
-- WHERE c.id = 'YOUR_CAMPAIGN_ID_HERE';


-- 8. Test insert (DO NOT RUN IN PRODUCTION - for testing only)
-- INSERT INTO campaigns (
--   platform_id,
--   slug,
--   status,
--   official_link,
--   end_date,
--   submitted_by,
--   pending_platform
-- ) VALUES (
--   NULL,
--   'test-campaign-' || floor(random() * 1000)::text,
--   'pending',
--   'https://test.com',
--   NOW() + INTERVAL '30 days',
--   'test_user_123',
--   '{"name": "Test Platform", "slug": "test-platform", "website": "https://test.com", "description": "Test description"}'::jsonb
-- ) RETURNING *;


-- 9. Clean up test data (BE CAREFUL!)
-- DELETE FROM campaigns WHERE slug LIKE 'test-campaign-%';
