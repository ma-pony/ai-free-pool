import { getTranslations } from 'next-intl/server';
import { Suspense } from 'react';
import { getCampaigns } from '@/services/CampaignService';
import { getConditionTags } from '@/services/ConditionTagService';
import { getPlatforms } from '@/services/PlatformService';
import { getTags } from '@/services/TagService';
import { CampaignListClient } from './CampaignListClient';

// Enable ISR: revalidate every 60 seconds (Requirement 19.6)
export const revalidate = 60;

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'Campaigns' });

  const { generateMetadata: generateSeoMetadata } = await import('@/utils/SeoHelpers');

  return generateSeoMetadata({
    title: t('pageTitle'),
    description: t('pageDescription'),
    keywords: [
      'AI campaigns',
      'free AI credits',
      'AI free tier',
      'OpenAI free',
      'Claude free',
      'Gemini free',
      'AI tools',
      'free trials',
    ],
    url: '/campaigns',
    type: 'website',
  });
}

export default async function CampaignsPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;

  // Fetch initial campaigns with filters from URL
  const initialFilters = {
    status: 'published' as const,
    includeExpired: false,
    includeDeleted: false,
    sortBy: (params.sortBy as 'latest' | 'popular' | 'expiring_soon' | 'highest_credit') || 'latest',
    search: params.search as string | undefined,
    difficultyLevel: params.difficulty as 'easy' | 'medium' | 'hard' | undefined,
    categoryTags: params.categories ? (params.categories as string).split(',') : undefined,
    aiModels: params.aiModels ? (params.aiModels as string).split(',') : undefined,
    conditionTags: params.conditions ? (params.conditions as string).split(',') : undefined,
    limit: 20,
  };

  // Fetch data in parallel
  const [initialCampaigns, conditionTags, allTags, allPlatforms] = await Promise.all([
    getCampaigns(initialFilters),
    getConditionTags(),
    getTags(),
    getPlatforms({ status: 'active' }),
  ]);

  // Separate tags by type
  const categoryTags = allTags.filter(tag => tag.type === 'category');
  const aiModelTags = allTags.filter(tag => tag.type === 'ai_model');

  // Extract unique AI models from campaigns if no AI model tags exist
  const aiModelsFromCampaigns = initialCampaigns
    .flatMap(c => c.aiModels || [])
    .filter((model, index, self) => model && self.indexOf(model) === index)
    .sort();

  const availableAiModels = aiModelTags.length > 0
    ? aiModelTags.map(tag => tag.name)
    : aiModelsFromCampaigns;

  return (
    <div className="min-h-screen bg-gray-50">
      <Suspense fallback={<CampaignListSkeleton />}>
        <CampaignListClient
          initialCampaigns={initialCampaigns}
          initialFilters={initialFilters}
          availableCategories={categoryTags}
          availableAiModels={availableAiModels}
          availableConditions={conditionTags}
          availablePlatforms={allPlatforms}
        />
      </Suspense>
    </div>
  );
}

function CampaignListSkeleton() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8 animate-pulse">
        <div className="h-8 w-64 rounded bg-gray-200"></div>
        <div className="mt-2 h-4 w-96 rounded bg-gray-200"></div>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-4">
        <div className="lg:col-span-1">
          <div className="h-96 animate-pulse rounded-lg bg-white p-4"></div>
        </div>
        <div className="lg:col-span-3">
          <div className="space-y-4">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-48 animate-pulse rounded-lg bg-white p-6"></div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
