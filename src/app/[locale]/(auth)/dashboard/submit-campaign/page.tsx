import { getTranslations } from 'next-intl/server';
import { CampaignSubmissionForm } from '@/components/CampaignSubmissionForm';

export async function generateMetadata(props: { params: Promise<{ locale: string }> }) {
  const { locale } = await props.params;
  const t = await getTranslations({ locale, namespace: 'SubmitCampaign' });

  return {
    title: t('meta_title'),
    description: t('meta_description'),
  };
}

export default async function SubmitCampaignPage() {
  const t = await getTranslations('SubmitCampaign');

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">{t('title')}</h1>
        <p className="mt-2 text-gray-600">{t('description')}</p>
      </div>

      <CampaignSubmissionForm />
    </div>
  );
}
