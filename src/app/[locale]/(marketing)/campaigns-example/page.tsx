'use client';

import type { Campaign, CampaignListFilters } from '@/types/Campaign';
import { useEffect, useState } from 'react';
import { CampaignFilters } from '@/components/CampaignFilters';

export default function CampaignsExamplePage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [filters, setFilters] = useState<CampaignListFilters>({
    status: 'published',
    includeExpired: false,
    includeDeleted: false,
    sortBy: 'latest',
  });

  // Example data for filter options
  const availableCategories = [
    { id: '1', name: 'API', slug: 'api' },
    { id: '2', name: 'Chat', slug: 'chat' },
    { id: '3', name: 'Image Generation', slug: 'image-generation' },
    { id: '4', name: 'Code Editor', slug: 'code-editor' },
  ];

  const availableAiModels = [
    'GPT-4',
    'GPT-3.5',
    'Claude',
    'Gemini',
    'DALL-E',
    'Stable Diffusion',
  ];

  const availableConditions = [
    { id: '1', name: 'New Users Only', slug: 'new-users' },
    { id: '2', name: 'Email Required', slug: 'email-required' },
    { id: '3', name: 'Phone Required', slug: 'phone-required' },
    { id: '4', name: 'Credit Card Required', slug: 'credit-card-required' },
  ];

  // Fetch campaigns when filters change
  useEffect(() => {
    const fetchCampaigns = async () => {
      setLoading(true);
      setError(null);

      try {
        // Build query parameters
        const params = new URLSearchParams();

        if (filters.status) {
          params.append('status', filters.status);
        }
        if (filters.search) {
          params.append('search', filters.search);
        }
        if (filters.difficultyLevel) {
          params.append('difficultyLevel', filters.difficultyLevel);
        }
        if (filters.categoryTags?.length) {
          params.append('categories', filters.categoryTags.join(','));
        }
        if (filters.aiModels?.length) {
          params.append('aiModels', filters.aiModels.join(','));
        }
        if (filters.conditionTags?.length) {
          params.append('conditions', filters.conditionTags.join(','));
        }
        if (filters.sortBy) {
          params.append('sortBy', filters.sortBy);
        }
        if (filters.includeExpired) {
          params.append('includeExpired', 'true');
        }

        const response = await fetch(`/api/campaigns?${params.toString()}`);

        if (!response.ok) {
          throw new Error('Failed to fetch campaigns');
        }

        const data = await response.json();
        setCampaigns(data.data || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchCampaigns();
  }, [filters]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">AI Free Pool Campaigns</h1>
        <p className="mt-2 text-gray-600">
          Discover the latest AI free credit campaigns and promotions
        </p>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-4">
        {/* Filters Sidebar (Desktop) */}
        <div className="lg:col-span-1">
          <CampaignFilters
            filters={filters}
            onFilterChange={setFilters}
            availableCategories={availableCategories}
            availableAiModels={availableAiModels}
            availableConditions={availableConditions}
            showSidebar={true}
          />
        </div>

        {/* Campaign List */}
        <div className="lg:col-span-3">
          {/* Mobile Search and Filter */}
          <div className="mb-4 lg:hidden">
            <CampaignFilters
              filters={filters}
              onFilterChange={setFilters}
              availableCategories={availableCategories}
              availableAiModels={availableAiModels}
              availableConditions={availableConditions}
              showSidebar={false}
            />
          </div>

          {/* Results Count */}
          <div className="mb-4 flex items-center justify-between">
            <p className="text-sm text-gray-600">
              {loading ? 'Loading...' : `${campaigns.length} campaigns found`}
            </p>
          </div>

          {/* Error State */}
          {error && (
            <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-800">
              {error}
            </div>
          )}

          {/* Loading State */}
          {loading && (
            <div className="space-y-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="animate-pulse rounded-lg border border-gray-200 bg-white p-6">
                  <div className="h-4 w-3/4 rounded bg-gray-200"></div>
                  <div className="mt-2 h-4 w-1/2 rounded bg-gray-200"></div>
                </div>
              ))}
            </div>
          )}

          {/* Campaign Cards */}
          {!loading && !error && campaigns.length > 0 && (
            <div className="space-y-4">
              {campaigns.map(campaign => (
                <div
                  key={campaign.id}
                  className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-md"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {campaign.translations?.[0]?.title || 'Untitled Campaign'}
                      </h3>
                      <p className="mt-1 text-sm text-gray-600">
                        {campaign.platform?.name || 'Unknown Platform'}
                      </p>
                      {campaign.freeCredit && (
                        <p className="mt-2 text-sm font-medium text-green-600">
                          💰
                          {' '}
                          {campaign.freeCredit}
                        </p>
                      )}
                      {campaign.difficultyLevel && (
                        <span className="mt-2 inline-block rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-800">
                          {campaign.difficultyLevel}
                        </span>
                      )}
                    </div>
                    {campaign.isFeatured && (
                      <span className="rounded-full bg-gradient-to-r from-yellow-400 to-orange-500 px-3 py-1 text-xs font-medium text-white">
                        ⭐ Featured
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Empty State */}
          {!loading && !error && campaigns.length === 0 && (
            <div className="rounded-lg border border-gray-200 bg-white p-12 text-center">
              <svg
                className="mx-auto size-12 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <h3 className="mt-4 text-lg font-medium text-gray-900">No campaigns found</h3>
              <p className="mt-2 text-sm text-gray-600">
                Try adjusting your filters or search query
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
