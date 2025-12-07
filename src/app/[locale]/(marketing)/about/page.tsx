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
        <h2 className="mb-4 text-2xl font-bold text-gray-900">About AI Free Pool</h2>
        <p className="leading-relaxed text-gray-700">
          AI Free Pool is a community-driven platform that helps you discover and track free AI credits,
          trials, and promotions from top AI platforms. Our mission is to make AI tools more accessible
          by aggregating the latest free credit campaigns in one place.
        </p>
      </section>

      <section>
        <h3 className="mb-3 text-xl font-semibold text-gray-900">What We Offer</h3>
        <ul className="list-inside list-disc space-y-2 text-gray-700">
          <li>Curated list of AI free credit campaigns</li>
          <li>Real-time updates on new promotions</li>
          <li>Community contributions and verification</li>
          <li>Bookmark and track your favorite campaigns</li>
          <li>Multi-language support</li>
        </ul>
      </section>

      <section>
        <h3 className="mb-3 text-xl font-semibold text-gray-900">How It Works</h3>
        <ol className="list-inside list-decimal space-y-2 text-gray-700">
          <li>Browse campaigns from various AI platforms</li>
          <li>Filter by category, platform, or credit amount</li>
          <li>Bookmark campaigns you're interested in</li>
          <li>Submit new campaigns you discover</li>
          <li>Get notified about new opportunities</li>
        </ol>
      </section>

      <section>
        <h3 className="mb-3 text-xl font-semibold text-gray-900">Join Our Community</h3>
        <p className="leading-relaxed text-gray-700">
          Follow us on social media to stay updated with the latest AI free credit campaigns
          and never miss an opportunity to try new AI tools for free.
        </p>
      </section>
    </div>
  );
};
