import type { Campaign } from '@/types/Campaign';
import Image from 'next/image';
/**
 * HeroHotCampaigns Component
 * Hero 区域热门活动预览
 */
import Link from 'next/link';

type HeroHotCampaignsProps = {
  campaigns: Campaign[];
  locale: string;
};

export default function HeroHotCampaigns({ campaigns, locale }: HeroHotCampaignsProps) {
  if (!campaigns || campaigns.length === 0) {
    return null;
  }

  return (
    <div className="mt-4 rounded-xl bg-white/10 p-5 backdrop-blur-sm">
      <h3 className="mb-4 flex items-center gap-2 font-semibold text-white">
        <span>🔥</span>
        <span>热门活动</span>
      </h3>
      <div className="space-y-3">
        {campaigns.slice(0, 3).map((campaign) => {
          const translation = campaign.translations?.find(t => t.locale === locale)
            || campaign.translations?.[0];

          return (
            <Link
              key={campaign.id}
              href={`/campaigns/${campaign.slug}`}
              className="flex items-center gap-3 rounded-lg bg-white/10 p-3 transition-colors hover:bg-white/20"
            >
              {/* Platform Logo */}
              {campaign.platform?.logo
                ? (
                    <div className="relative size-10 shrink-0 overflow-hidden rounded-lg bg-white/20">
                      <Image
                        src={campaign.platform.logo}
                        alt={campaign.platform.name}
                        fill
                        className="object-contain p-1"
                        sizes="40px"
                      />
                    </div>
                  )
                : (
                    <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-white/20 text-xl">
                      🎯
                    </div>
                  )}

              {/* Campaign Info */}
              <div className="min-w-0 flex-1">
                <div className="truncate font-medium text-white">
                  {translation?.title || 'Untitled'}
                </div>
                {campaign.freeCredit && (
                  <div className="text-sm text-white/70">
                    💰
                    {' '}
                    {campaign.freeCredit}
                  </div>
                )}
              </div>

              {/* Arrow */}
              <span className="text-white/50">→</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
