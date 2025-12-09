import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';

type IAboutProps = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata(props: IAboutProps): Promise<Metadata> {
  const { locale } = await props.params;
  const t = await getTranslations({
    locale,
    namespace: 'About',
  });

  return {
    title: t('meta_title'),
    description: t('meta_description'),
  };
}

export default async function About(props: IAboutProps) {
  const { locale } = await props.params;
  setRequestLocale(locale);
  const t = await getTranslations({
    locale,
    namespace: 'About',
  });

  return (
    <div className="space-y-6">
      <section>
        <h2 className="mb-4 text-2xl font-bold text-gray-900">{t('title')}</h2>
        <p className="leading-relaxed text-gray-700">
          {t('intro')}
        </p>
      </section>

      <section>
        <h3 className="mb-3 text-xl font-semibold text-gray-900">{t('what_we_offer_title')}</h3>
        <ul className="list-inside list-disc space-y-2 text-gray-700">
          <li>{t('offer_1')}</li>
          <li>{t('offer_2')}</li>
          <li>{t('offer_3')}</li>
          <li>{t('offer_4')}</li>
          <li>{t('offer_5')}</li>
        </ul>
      </section>

      <section>
        <h3 className="mb-3 text-xl font-semibold text-gray-900">{t('how_it_works_title')}</h3>
        <ol className="list-inside list-decimal space-y-2 text-gray-700">
          <li>{t('step_1')}</li>
          <li>{t('step_2')}</li>
          <li>{t('step_3')}</li>
          <li>{t('step_4')}</li>
          <li>{t('step_5')}</li>
        </ol>
      </section>

      <section>
        <h3 className="mb-3 text-xl font-semibold text-gray-900">{t('community_title')}</h3>
        <p className="leading-relaxed text-gray-700">
          {t('community_text')}
        </p>
      </section>
    </div>
  );
}
