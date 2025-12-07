import { useTranslations } from 'next-intl';

export default function FeaturedBadge() {
  const t = useTranslations('Index');

  return (
    <div className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-yellow-400 to-orange-500 px-3 py-1 text-xs font-semibold text-white shadow-md">
      <span>⭐</span>
      <span>{t('featured')}</span>
    </div>
  );
}
