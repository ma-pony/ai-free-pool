import { getTranslations } from 'next-intl/server';
import { Suspense } from 'react';
import FeaturedCampaignList from '@/components/admin/FeaturedCampaignList';

export async function generateMetadata(props: { params: Promise<{ locale: string }> }) {
  const params = await props.params;
  const t = await getTranslations({
    locale: params.locale,
    namespace: 'Admin',
  });

  return {
    title: t('featured_campaigns'),
  };
}

export default async function FeaturedCampaignsPage() {
  const t = await getTranslations('Admin');

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">{t('featured_campaigns')}</h1>
        <p className="mt-2 text-gray-600">
          {t('featured_campaigns_description')}
        </p>
      </div>

      <Suspense
        fallback={(
          <div className="flex items-center justify-center py-12">
            <div className="size-8 animate-spin rounded-full border-4 border-primary-500 border-t-transparent" />
          </div>
        )}
      >
        <FeaturedCampaignList />
      </Suspense>
    </div>
  );
}
