import { getTranslations } from 'next-intl/server';
import SubmissionSuccess from '@/components/SubmissionSuccess';

export async function generateMetadata(props: { params: Promise<{ locale: string }> }) {
  const { locale } = await props.params;
  const t = await getTranslations({ locale, namespace: 'SubmitCampaign' });

  return {
    title: t('success_title'),
    description: t('success_description'),
  };
}

export default function SubmitSuccessPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <SubmissionSuccess />
    </div>
  );
}
