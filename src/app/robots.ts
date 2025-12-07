import type { MetadataRoute } from 'next';
import { getBaseUrl } from '@/utils/Helpers';

/**
 * Robots.txt Configuration
 * Validates: Requirements 15.5
 *
 * Configures search engine crawler access:
 * - Allow all public pages
 * - Disallow admin and user dashboard pages
 * - Provide sitemap location
 */
export default function robots(): MetadataRoute.Robots {
  const baseUrl = getBaseUrl();

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/dashboard/*',
          '/admin/*',
          '/api/*',
        ],
      },
      {
        userAgent: 'Googlebot',
        allow: '/',
        disallow: [
          '/dashboard/*',
          '/admin/*',
          '/api/*',
        ],
      },
      {
        userAgent: 'Bingbot',
        allow: '/',
        disallow: [
          '/dashboard/*',
          '/admin/*',
          '/api/*',
        ],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
