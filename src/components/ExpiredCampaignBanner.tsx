'use client';

import { useTranslations } from 'next-intl';
import { useSocialMediaPromptContext } from './SocialMediaPromptProvider';

type ExpiredCampaignBannerProps = {
  campaignTitle: string;
};

export default function ExpiredCampaignBanner({ campaignTitle }: ExpiredCampaignBannerProps) {
  const t = useTranslations('CampaignDetail');
  const { openModal } = useSocialMediaPromptContext();

  const handleFollowClick = () => {
    openModal('expired');
  };

  return (
    <div className="mb-6 rounded-lg border-2 border-orange-200 bg-orange-50 p-6">
      <div className="flex items-start gap-4">
        <div className="shrink-0">
          <svg className="size-6 text-orange-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <div className="flex-1">
          <h3 className="mb-2 text-lg font-semibold text-orange-900">
            {t('expired_banner_title')}
          </h3>
          <p className="mb-4 text-sm text-orange-800">
            {t('expired_banner_description')}
          </p>
          <button
            onClick={handleFollowClick}
            className="inline-flex items-center gap-2 rounded-lg bg-orange-600 px-4 py-2 font-medium text-white transition-colors hover:bg-orange-700"
            type="button"
          >
            <svg className="size-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
            </svg>
            {t('expired_banner_cta')}
          </button>
        </div>
      </div>
    </div>
  );
}
