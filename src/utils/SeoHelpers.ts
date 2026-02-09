import type { Metadata } from 'next';
import type { Campaign } from '@/types/Campaign';
import type { Platform } from '@/types/Platform';
import { AppConfig } from './AppConfig';
import { getBaseUrl } from './Helpers';

const OG_LOCALE_MAP: Record<string, string> = {
  en: 'en_US',
  zh: 'zh_CN',
  fr: 'fr_FR',
};

/**
 * SEO Helpers
 * Validates: Requirements 15.1, 15.2, 15.3
 *
 * Utilities for generating SEO metadata including:
 * - Meta tags (title, description, keywords)
 * - Open Graph tags for social media sharing
 * - JSON-LD structured data for search engines
 */

type SeoConfig = {
  title: string;
  description: string;
  keywords?: string[];
  image?: string;
  url?: string;
  type?: 'website' | 'article';
  publishedTime?: string;
  modifiedTime?: string;
  author?: string;
  locale?: string;
};

/**
 * Generate complete metadata for Next.js pages
 */
export function generateMetadata(config: SeoConfig): Metadata {
  const baseUrl = getBaseUrl();
  const fullUrl = config.url ? `${baseUrl}${config.url}` : baseUrl;
  const imageUrl = config.image || `${baseUrl}/og-image.png`;
  const locale = config.locale || AppConfig.defaultLocale;
  const ogLocale = OG_LOCALE_MAP[locale] || 'en_US';

  // Build hreflang alternates
  const languages = Object.fromEntries(
    AppConfig.locales.map(l => [
      l,
      l === AppConfig.defaultLocale
        ? fullUrl
        : fullUrl.replace(baseUrl, `${baseUrl}/${l}`),
    ]),
  );

  return {
    title: config.title,
    description: config.description,
    keywords: config.keywords,
    authors: config.author ? [{ name: config.author }] : undefined,
    openGraph: {
      title: config.title,
      description: config.description,
      url: fullUrl,
      siteName: 'AI Free Pool',
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: config.title,
        },
      ],
      locale: ogLocale,
      type: config.type || 'website',
      ...(config.publishedTime && { publishedTime: config.publishedTime }),
      ...(config.modifiedTime && { modifiedTime: config.modifiedTime }),
    },
    twitter: {
      card: 'summary_large_image',
      title: config.title,
      description: config.description,
      images: [imageUrl],
    },
    alternates: {
      canonical: fullUrl,
      languages,
    },
  };
}

/**
 * Generate metadata for campaign detail pages
 */
export function generateCampaignMetadata(
  campaign: Campaign,
  locale: string,
): Metadata {
  const translation = campaign.translations?.find(t => t.locale === locale)
    || campaign.translations?.[0];

  if (!translation) {
    return {
      title: 'Campaign Not Found',
    };
  }

  const title = `${translation.title} - ${campaign.platform?.name || 'AI Free Pool'}`;
  const description = translation.description || translation.title;
  const keywords = [
    campaign.platform?.name || '',
    'AI',
    'free credit',
    'free tier',
    ...(campaign.aiModels || []),
    ...(campaign.conditionTags?.map(ct => ct.name) || []),
    ...(campaign.tags?.map(t => t.name) || []),
  ].filter(Boolean);

  return generateMetadata({
    title,
    description,
    keywords,
    image: campaign.platform?.logo ?? undefined,
    url: `/campaigns/${campaign.slug}`,
    type: 'article',
    publishedTime: campaign.createdAt?.toISOString(),
    modifiedTime: campaign.updatedAt?.toISOString(),
    author: campaign.submittedBy ?? undefined,
    locale,
  });
}

/**
 * Generate metadata for platform pages
 */
export function generatePlatformMetadata(
  platform: Platform,
  _locale: string,
): Metadata {
  const title = `${platform.name} Free Credits & Campaigns`;
  const description = platform.description
    || `Discover all free credit campaigns and offers from ${platform.name}. Get free AI credits and try premium features.`;

  const keywords = [
    platform.name,
    'AI',
    'free credit',
    'free tier',
    'campaigns',
    'offers',
  ];

  return generateMetadata({
    title,
    description,
    keywords,
    image: platform.logo ?? undefined,
    url: `/platforms/${platform.slug}`,
    type: 'website',
    locale: _locale,
  });
}

/**
 * Generate JSON-LD structured data for campaigns
 * Validates: Requirements 15.3
 */
export function generateCampaignJsonLd(campaign: Campaign, locale: string) {
  const translation = campaign.translations?.find(t => t.locale === locale)
    || campaign.translations?.[0];

  if (!translation) {
    return null;
  }

  const baseUrl = getBaseUrl();

  return {
    '@context': 'https://schema.org',
    '@type': 'Offer',
    'name': translation.title,
    'description': translation.description || translation.title,
    'url': `${baseUrl}/campaigns/${campaign.slug}`,
    'image': campaign.platform?.logo,
    'price': '0',
    'priceCurrency': 'USD',
    'availability': campaign.status === 'published'
      && (!campaign.endDate || new Date(campaign.endDate) > new Date())
      ? 'https://schema.org/InStock'
      : 'https://schema.org/OutOfStock',
    'validFrom': campaign.startDate?.toISOString(),
    'validThrough': campaign.endDate?.toISOString(),
    'seller': {
      '@type': 'Organization',
      'name': campaign.platform?.name,
      'url': campaign.platform?.website,
      'logo': campaign.platform?.logo,
    },
    'offers': {
      '@type': 'Offer',
      'price': '0',
      'priceCurrency': 'USD',
      'availability': 'https://schema.org/InStock',
    },
  };
}

/**
 * Generate JSON-LD structured data for platforms
 * Validates: Requirements 15.3
 */
export function generatePlatformJsonLd(platform: Platform) {
  const baseUrl = getBaseUrl();

  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    'name': platform.name,
    'description': platform.description,
    'url': platform.website || `${baseUrl}/platforms/${platform.slug}`,
    'logo': platform.logo,
    'sameAs': [
      platform.socialLinks?.twitter,
      platform.socialLinks?.github,
      platform.socialLinks?.discord,
    ].filter(Boolean),
  };
}

/**
 * Generate JSON-LD breadcrumb list
 * Validates: Requirements 15.3
 */
export function generateBreadcrumbJsonLd(items: Array<{ name: string; url: string }>) {
  const baseUrl = getBaseUrl();

  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    'itemListElement': items.map((item, index) => ({
      '@type': 'ListItem',
      'position': index + 1,
      'name': item.name,
      'item': `${baseUrl}${item.url}`,
    })),
  };
}

/**
 * Generate JSON-LD website search box
 * Validates: Requirements 15.3
 */
export function generateWebsiteJsonLd() {
  const baseUrl = getBaseUrl();

  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    'name': 'AI Free Pool',
    'description': 'Discover and track free AI credits and campaigns from top AI platforms',
    'url': baseUrl,
    'potentialAction': {
      '@type': 'SearchAction',
      'target': {
        '@type': 'EntryPoint',
        'urlTemplate': `${baseUrl}/campaigns?search={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  };
}

/**
 * Generate JSON-LD FAQ for campaign pages
 * Validates: Requirements 15.3
 */
export function generateFaqJsonLd(faqs: Array<{ question: string; answer: string }>) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    'mainEntity': faqs.map(faq => ({
      '@type': 'Question',
      'name': faq.question,
      'acceptedAnswer': {
        '@type': 'Answer',
        'text': faq.answer,
      },
    })),
  };
}
