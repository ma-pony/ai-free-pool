import type { Metadata } from 'next';
import type { Campaign } from '@/types/Campaign';
import type { Platform } from '@/types/Platform';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import Image from 'next/image';

import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getPlatformGuideBySlug, isPlatformGuide, PLATFORM_GUIDE_SLUGS } from '@/services/GuideService';

type TranslationFn = ReturnType<typeof getTranslations> extends Promise<infer T> ? T : never;

export const revalidate = 3600;

type PlatformGuidePageProps = {
  params: Promise<{ locale: string; slug: string }>;
};

export async function generateStaticParams() {
  return PLATFORM_GUIDE_SLUGS.map(slug => ({ slug }));
}

export async function generateMetadata({ params }: PlatformGuidePageProps): Promise<Metadata> {
  const { locale, slug } = await params;
  if (!isPlatformGuide(slug)) {
    return { title: 'Not Found' };
  }

  const t = await getTranslations({ locale, namespace: `PlatformGuide_${slug}` });
  const { generateMetadata: generateSeoMetadata } = await import('@/utils/SeoHelpers');

  return generateSeoMetadata({
    title: t('meta_title'),
    description: t('meta_description'),
    keywords: t('keywords').split(',').map(k => k.trim()),
    url: `/guides/platform/${slug}`,
    type: 'article',
    locale,
  });
}

export default async function PlatformGuidePage({ params }: PlatformGuidePageProps) {
  const { locale, slug } = await params;
  setRequestLocale(locale);

  if (!isPlatformGuide(slug)) {
    notFound();
  }

  const guide = await getPlatformGuideBySlug(slug);
  if (!guide) {
    notFound();
  }

  const t = await getTranslations({ locale, namespace: `PlatformGuide_${slug}` });
  const tCommon = await getTranslations({ locale, namespace: 'PlatformGuide_common' });
  const { generateFaqJsonLd, generateBreadcrumbJsonLd } = await import('@/utils/SeoHelpers');

  const faqs = [
    { question: t('faq_q1'), answer: t('faq_a1') },
    { question: t('faq_q2'), answer: t('faq_a2') },
    { question: t('faq_q3'), answer: t('faq_a3') },
  ];

  const articleJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    'headline': t('meta_title'),
    'description': t('meta_description'),
    'datePublished': '2026-02-01T00:00:00Z',
    'dateModified': new Date().toISOString(),
    'author': { '@type': 'Organization', 'name': 'AI Free Pool' },
  };

  const faqJsonLd = generateFaqJsonLd(faqs);
  const breadcrumbJsonLd = generateBreadcrumbJsonLd([
    { name: 'Home', url: '/' },
    { name: 'Guides', url: '/guides/free-ai-credits-2026' },
    { name: t('title'), url: `/guides/platform/${slug}` },
  ]);

  const primaryPlatform = guide.platforms[0];

  return (
    <div className="min-h-screen bg-gray-50">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />

      {/* Hero Section */}
      <HeroSection t={t} platform={primaryPlatform} />

      {/* Main Content */}
      <div className="mx-auto max-w-4xl px-4 py-12">
        {/* Platform Introduction */}
        <IntroSection t={t} />

        {/* Free Tier Details */}
        <FreeTierSection t={t} tCommon={tCommon} campaigns={guide.campaigns} locale={locale} />

        {/* Pricing Comparison */}
        <PricingSection t={t} tCommon={tCommon} />

        {/* Usage Tips */}
        <TipsSection t={t} tCommon={tCommon} />

        {/* Platform Comparison */}
        <ComparisonSection t={t} tCommon={tCommon} />

        {/* FAQ */}
        <FaqSection tCommon={tCommon} faqs={faqs} />

        {/* CTA */}
        <CtaSection t={t} tCommon={tCommon} platform={primaryPlatform} />
      </div>
    </div>
  );
}

/* ── Sub-components ── */

function HeroSection({ t, platform }: { t: TranslationFn; platform: Platform | undefined }) {
  return (
    <section className="bg-gradient-to-br from-blue-600 to-indigo-700 px-4 py-16 text-white">
      <div className="mx-auto max-w-4xl text-center">
        <div className="mb-6 flex items-center justify-center gap-4">
          {platform?.logo && (
            <Image src={platform.logo} alt={platform.name} width={64} height={64} className="rounded-xl" />
          )}
          <h1 className="text-3xl font-bold md:text-4xl">{t('title')}</h1>
        </div>
        <p className="mx-auto max-w-2xl text-lg text-blue-100">{t('subtitle')}</p>
        <p className="mt-2 text-sm text-blue-200">{t('last_updated')}</p>
      </div>
    </section>
  );
}

function IntroSection({ t }: { t: TranslationFn }) {
  return (
    <section className="mb-12">
      <h2 className="mb-4 text-2xl font-bold text-gray-900">{t('intro_title')}</h2>
      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <p className="mb-4 leading-relaxed text-gray-700">{t('intro_p1')}</p>
        <p className="leading-relaxed text-gray-700">{t('intro_p2')}</p>
        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          {(['feature_1', 'feature_2', 'feature_3'] as const).map(key => (
            <div key={key} className="rounded-lg bg-blue-50 p-4">
              <div className="mb-1 font-semibold text-blue-900">{t(`${key}_title`)}</div>
              <div className="text-sm text-blue-700">{t(`${key}_desc`)}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function FreeTierSection({ t, tCommon, campaigns, locale }: { t: TranslationFn; tCommon: TranslationFn; campaigns: Campaign[]; locale: string }) {
  return (
    <section className="mb-12">
      <h2 className="mb-4 text-2xl font-bold text-gray-900">{t('free_tier_title')}</h2>
      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <p className="mb-4 leading-relaxed text-gray-700">{t('free_tier_intro')}</p>
        <div className="mb-6 overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="pr-4 pb-3 font-semibold text-gray-900">{tCommon('table_item')}</th>
                <th className="pr-4 pb-3 font-semibold text-gray-900">{tCommon('table_details')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {(['free_row_1', 'free_row_2', 'free_row_3', 'free_row_4'] as const).map(key => (
                <tr key={key}>
                  <td className="py-3 pr-4 font-medium text-gray-700">{t(`${key}_label`)}</td>
                  <td className="py-3 pr-4 text-gray-600">{t(`${key}_value`)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="text-sm text-gray-500">{t('free_tier_note')}</p>

        {campaigns.length > 0 && (
          <div className="mt-6 border-t border-gray-100 pt-6">
            <h3 className="mb-3 font-semibold text-gray-900">{tCommon('active_campaigns')}</h3>
            <div className="space-y-3">
              {campaigns.map(campaign => (
                <Link
                  key={campaign.id}
                  href={`/campaigns/${campaign.slug}`}
                  className="block rounded-lg border border-gray-200 p-4 transition-colors hover:bg-gray-50"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-gray-900">
                      {campaign.translations?.find(tr => tr.locale === locale)?.title
                        || campaign.translations?.[0]?.title
                        || campaign.slug}
                    </span>
                    {campaign.freeCredit && (
                      <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">
                        {campaign.freeCredit}
                      </span>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

function PricingSection({ t, tCommon: _tCommon }: { t: TranslationFn; tCommon: TranslationFn }) {
  return (
    <section className="mb-12">
      <h2 className="mb-4 text-2xl font-bold text-gray-900">{t('pricing_title')}</h2>
      <div className="grid gap-4 sm:grid-cols-3">
        {(['plan_free', 'plan_plus', 'plan_pro'] as const).map(key => (
          <div
            key={key}
            className={`rounded-xl border p-6 shadow-sm ${
              key === 'plan_plus' ? 'border-blue-300 bg-blue-50' : 'border-gray-200 bg-white'
            }`}
          >
            <h3 className="mb-2 text-lg font-bold text-gray-900">{t(`${key}_name`)}</h3>
            <div className="mb-3 text-2xl font-bold text-blue-600">{t(`${key}_price`)}</div>
            <ul className="space-y-2 text-sm text-gray-600">
              {([1, 2, 3] as const).map(i => (
                <li key={i} className="flex items-start gap-2">
                  <span className="mt-0.5 text-green-500">✓</span>
                  <span>{t(`${key}_feature_${i}`)}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <p className="mt-4 text-sm text-gray-500">{t('pricing_note')}</p>
    </section>
  );
}

function TipsSection({ t, tCommon: _tCommon }: { t: TranslationFn; tCommon: TranslationFn }) {
  return (
    <section className="mb-12">
      <h2 className="mb-4 text-2xl font-bold text-gray-900">{t('tips_title')}</h2>
      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="space-y-4">
          {([1, 2, 3, 4] as const).map(i => (
            <div key={i} className="flex items-start gap-3">
              <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-blue-100 text-sm font-bold text-blue-700">
                {i}
              </span>
              <div>
                <h3 className="font-semibold text-gray-900">{t(`tip_${i}_title`)}</h3>
                <p className="mt-1 text-sm text-gray-600">{t(`tip_${i}_desc`)}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function ComparisonSection({ t, tCommon }: { t: TranslationFn; tCommon: TranslationFn }) {
  return (
    <section className="mb-12">
      <h2 className="mb-4 text-2xl font-bold text-gray-900">{t('comparison_title')}</h2>
      <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-sm">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50">
              <th className="p-4 font-semibold text-gray-900">{tCommon('table_platform')}</th>
              <th className="p-4 font-semibold text-gray-900">{tCommon('table_free_tier')}</th>
              <th className="p-4 font-semibold text-gray-900">{tCommon('table_best_for')}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {(['comp_row_1', 'comp_row_2', 'comp_row_3'] as const).map(key => (
              <tr key={key} className="hover:bg-gray-50">
                <td className="p-4 font-medium text-gray-900">{t(`${key}_platform`)}</td>
                <td className="p-4 text-gray-600">{t(`${key}_free`)}</td>
                <td className="p-4 text-gray-600">{t(`${key}_best`)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="mt-4 text-sm text-gray-500">{t('comparison_note')}</p>
    </section>
  );
}

function FaqSection({ tCommon, faqs }: { tCommon: TranslationFn; faqs: Array<{ question: string; answer: string }> }) {
  return (
    <section className="mb-12">
      <h2 className="mb-6 text-2xl font-bold text-gray-900">{tCommon('faq_title')}</h2>
      <div className="space-y-4">
        {faqs.map((faq, i) => (
          <details key={i} className="rounded-lg border border-gray-200 bg-white p-4">
            <summary className="cursor-pointer font-medium text-gray-900">{faq.question}</summary>
            <p className="mt-2 text-gray-600">{faq.answer}</p>
          </details>
        ))}
      </div>
    </section>
  );
}

function CtaSection({ t, tCommon, platform }: { t: TranslationFn; tCommon: TranslationFn; platform: Platform | undefined }) {
  return (
    <section className="rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 p-8 text-center text-white">
      <h2 className="mb-3 text-2xl font-bold">{t('cta_title')}</h2>
      <p className="mb-6 text-blue-100">{t('cta_desc')}</p>
      <div className="flex flex-wrap justify-center gap-4">
        {platform?.website && (
          <a
            href={platform.website}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-lg bg-white px-6 py-3 font-semibold text-blue-700 transition-colors hover:bg-blue-50"
          >
            {tCommon('visit_official')}
          </a>
        )}
        <Link
          href="/guides/free-ai-credits-2026"
          className="rounded-lg border-2 border-white px-6 py-3 font-semibold text-white transition-colors hover:bg-white/10"
        >
          {tCommon('view_all_platforms')}
        </Link>
      </div>
    </section>
  );
}
