'use client';

import type { Campaign } from '@/types/Campaign';
import Link from 'next/link';

type VerificationNeededListProps = {
  campaigns: Campaign[];
  onVerify: (campaignId: string) => Promise<void>;
  onMarkExpired: (campaignId: string) => Promise<void>;
};

/**
 * Admin component to display campaigns needing verification
 * Validates: Requirements 5.9, 11.4
 */
export function VerificationNeededList({
  campaigns,
  onVerify,
  onMarkExpired,
}: VerificationNeededListProps) {
  const getReactionStats = (_campaign: Campaign) => {
    // TODO: Get actual reaction stats from campaign data
    // For now, return placeholder data
    return {
      stillWorks: 0,
      expired: 0,
      infoIncorrect: 0,
      total: 0,
    };
  };

  const getPercentage = (count: number, total: number) => {
    if (total === 0) {
      return 0;
    }
    return Math.round((count / total) * 100);
  };

  if (campaigns.length === 0) {
    return (
      <div className="rounded-lg border border-gray-200 bg-gray-50 p-8 text-center">
        <p className="text-gray-600">No campaigns need verification at this time.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {campaigns.map((campaign) => {
        const stats = getReactionStats(campaign);
        const translation = campaign.translations?.[0];

        return (
          <div
            key={campaign.id}
            className="rounded-lg border-2 border-yellow-400 bg-yellow-50 p-6"
          >
            <div className="mb-4 flex items-start justify-between">
              <div>
                <div className="mb-1 flex items-center gap-2">
                  <span className="text-2xl">⚠️</span>
                  <h3 className="text-lg font-semibold">
                    {translation?.title || 'Untitled Campaign'}
                  </h3>
                </div>
                <p className="text-sm text-gray-600">
                  Platform:
                  {' '}
                  {campaign.platform?.name || 'Unknown'}
                </p>
              </div>
            </div>

            <div className="mb-4 rounded-lg bg-white p-4">
              <h4 className="mb-2 font-medium">User Feedback:</h4>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span>✅</span>
                    <span>Still Works</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-600">
                      {getPercentage(stats.stillWorks, stats.total)}
                      %
                    </span>
                    <span className="rounded-full bg-green-100 px-3 py-1 text-sm font-medium text-green-700">
                      {stats.stillWorks}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span>❌</span>
                    <span>Expired</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-600">
                      {getPercentage(stats.expired, stats.total)}
                      %
                    </span>
                    <span className="rounded-full bg-red-100 px-3 py-1 text-sm font-medium text-red-700">
                      {stats.expired}
                      {' '}
                      ⚠️
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span>📝</span>
                    <span>Info Incorrect</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-600">
                      {getPercentage(stats.infoIncorrect, stats.total)}
                      %
                    </span>
                    <span className="rounded-full bg-yellow-100 px-3 py-1 text-sm font-medium text-yellow-700">
                      {stats.infoIncorrect}
                    </span>
                  </div>
                </div>
              </div>

              {/* Recent Comments Section */}
              <div className="mt-4 border-t pt-4">
                <h4 className="mb-2 font-medium">Recent Comments:</h4>
                <div className="space-y-2 text-sm text-gray-600">
                  <p className="italic">No recent comments available</p>
                  {/* TODO: Display actual recent comments */}
                </div>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <Link
                href={`/campaigns/${campaign.slug}`}
                target="_blank"
                className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm hover:bg-gray-50"
              >
                👁️ View Campaign
              </Link>
              <Link
                href="/admin/campaigns"
                className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm hover:bg-gray-50"
              >
                ✏️ Edit Information
              </Link>
              <button
                onClick={() => onVerify(campaign.id)}
                className="rounded-lg bg-green-600 px-4 py-2 text-sm text-white hover:bg-green-700"
                type="button"
              >
                ✓ Mark as Valid
              </button>
              <button
                onClick={() => onMarkExpired(campaign.id)}
                className="rounded-lg bg-red-600 px-4 py-2 text-sm text-white hover:bg-red-700"
                type="button"
              >
                ✗ Mark as Expired
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
