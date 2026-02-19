import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getTranslations, setRequestLocale } from 'next-intl/server';

import { getGuideBySlug, isSupportedGuide } from '@/services/GuideService';

export const revalidate = 3600;

type GuidePageProps = {
  params: Promise<{ locale: string; slug: string }>;
};

export async function generateMetadata({ params }: GuidePageProps): Promise<Metadata> {
  const { locale, slug } = await params;
  if (!isSupportedGuide(slug)) return { title: 'Not Found' };

  const t = await getTranslations({ locale, namespace: 'Guide' });
  const { generateMetadata: generateSeoMetadata } = await import('@/utils/SeoHelpers');

  return generateSeoMetadata({
    title: t('meta_title'),
    description: t('meta_description'),
    keywords: ['free AI credits', 'AI API', 'free tier', '2026', 'OpenAI', 'Anthropic', 'Google AI', 'Claude', 'GPT'],
    url: `/guides/${slug}`,
    type: 'article',
    locale,
  });
}

export default async function GuidePage({ params }: GuidePageProps) {
  const { locale, slug } = await params;
  setRequestLocale(locale);

  const guide = await getGuideBySlug(slug);
  if (!guide) notFound();

  const t = await getTranslations({ locale, namespace: 'Guide' });
  const { generateFaqJsonLd, generateBreadcrumbJsonLd } = await import('@/utils/SeoHelpers');

  const faqs = [
    { question: t('faq_q1'), answer: t('faq_a1') },
    { question: t('faq_q2'), answer: t('faq_a2') },
    { question: t('faq_q3'), answer: t('faq_a3') },
    { question: t('faq_q4'), answer: t('faq_a4') },
  ];

  const articleJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    'headline': t('meta_title'),
    'description': t('meta_description'),
    'datePublished': '2026-01-01T00:00:00Z',
    'dateModified': new Date().toISOString(),
    'author': { '@type': 'Organization', 'name': 'AI Free Pool' },
  };

  const faqJsonLd = generateFaqJsonLd(faqs);
  const breadcrumbJsonLd = generateBreadcrumbJsonLd([
    { name: 'Home', url: '/' },
    { name: 'Guides', url: '/guides' },
    { name: t('title'), url: `/guides/${slug}` },
  ]);

  return (
    <div className="min-h-screen bg-gray-50">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />

      {/* Hero */}
      <section className="bg-gradient-to-br from-blue-600 to-indigo-700 px-4 py-16 text-white">
        <div className="mx-auto max-w-4xl text-center">
          <h1 className="mb-4 text-3xl font-bold md:text-4xl">{t('title')}</h1>
          <p className="text-lg text-blue-100">{t('subtitle')}</p>
          <div className="mt-8 flex justify-center gap-8">
            <div className="text-center">
              <div className="text-3xl font-bold">{guide.totalPlatforms}</div>
              <div className="text-sm text-blue-200">{t('total_platforms')}</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold">{guide.totalCampaigns}</div>
              <div className="text-sm text-blue-200">{t('total_campaigns')}</div>
            </div>
          </div>
        </div>
      </section>

      {/* Platform Cards */}
      <section className="mx-auto max-w-6xl px-4 py-12">
        <h2 className="mb-8 text-2xl font-bold text-gray-900">{t('platform_section_title')}</h2>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {guide.platformGroups.map(({ platform, campaigns }) => (
            <div key={platform.id} className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-md">
              <div className="mb-4 flex items-center gap-3">
                {platform.logo && (
                  <Image src={platform.logo} alt={platform.name} width={40} height={40} className="rounded-lg" />
                )}
                <h3 className="text-lg font-semibold text-gray-900">{platform.name}</h3>
              </div>
              {campaigns.map(campaign => (
                <div key={campaign.id} className="mb-3 border-t border-gray-100 pt-3 last:mb-0">
                  {campaign.freeCredit && (
                    <div className="mb-1 text-sm">
                      <span className="font-medium text-gray-600">{t('free_credit')}:</span>{' '}
                      <span className="font-semibold text-green-600">{campaign.freeCredit}</span>
                    </div>
                  )}
                  {campaign.aiModels && campaign.aiModels.length > 0 && (
                    <div className="mb-1 text-sm">
                      <span className="font-medium text-gray-600">{t('supported_models')}:</span>{' '}
                      <span className="text-gray-800">{campaign.aiModels.join(', ')}</span>
                    </div>
                  )}
                  {campaign.usageLimits && (
                    <div className="mb-2 text-sm">
                      <span className="font-medium text-gray-600">{t('usage_limits')}:</span>{' '}
                      <span className="text-gray-800">{campaign.usageLimits}</span>
                    </div>
                  )}
                  <div className="flex gap-2">
                    <Link
                      href={campaign.officialLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="rounded-md bg-blue-600 px-3 py-1 text-xs font-medium text-white hover:bg-blue-700"
                    >
                      {t('get_started')}
                    </Link>
                    <Link
                      href={`/campaigns/${campaign.slug}`}
                      className="rounded-md border border-gray-300 px-3 py-1 text-xs font-medium text-gray-700 hover:bg-gray-50"
                    >
                      {t('view_details')}
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section className="mx-auto max-w-4xl px-4 pb-16">
        <h2 className="mb-6 text-2xl font-bold text-gray-900">{t('faq_title')}</h2>
        <div className="space-y-4">
          {faqs.map((faq, i) => (
            <details key={i} className="rounded-lg border border-gray-200 bg-white p-4">
              <summary className="cursor-pointer font-medium text-gray-900">{faq.question}</summary>
              <p className="mt-2 text-gray-600">{faq.answer}</p>
            </details>
          ))}
        </div>
      </section>
    </div>
  );
}
