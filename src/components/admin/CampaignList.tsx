'use client';

import type { Campaign } from '@/types/Campaign';
import { useState } from 'react';

type CampaignListProps = {
  initialCampaigns: Campaign[];
  onEdit: (campaign: Campaign) => void;
  onDelete: (id: string) => void;
};

export function CampaignList({ initialCampaigns, onEdit, onDelete }: CampaignListProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'published' | 'rejected' | 'expired'>('all');
  const [difficultyFilter, setDifficultyFilter] = useState<'all' | 'easy' | 'medium' | 'hard'>('all');

  const filteredCampaigns = initialCampaigns.filter((campaign) => {
    // Search in translations
    const matchesSearch = campaign.translations?.some(t =>
      t.title.toLowerCase().includes(searchTerm.toLowerCase())
      || t.description?.toLowerCase().includes(searchTerm.toLowerCase()),
    ) || campaign.platform?.name.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'all' || campaign.status === statusFilter;
    const matchesDifficulty = difficultyFilter === 'all' || campaign.difficultyLevel === difficultyFilter;

    return matchesSearch && matchesStatus && matchesDifficulty;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      case 'expired':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getDifficultyColor = (difficulty?: string | null) => {
    switch (difficulty) {
      case 'easy':
        return 'bg-green-100 text-green-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'hard':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getDaysUntilExpiry = (endDate?: Date | null) => {
    if (!endDate) {
      return null;
    }
    const now = new Date();
    const end = new Date(endDate);
    const diffTime = end.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex gap-4">
        <input
          type="text"
          placeholder="Search campaigns..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          className="flex-1 rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none"
        />
        <select
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value as typeof statusFilter)}
          className="rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none"
        >
          <option value="all">All Status</option>
          <option value="pending">Pending</option>
          <option value="published">Published</option>
          <option value="rejected">Rejected</option>
          <option value="expired">Expired</option>
        </select>
        <select
          value={difficultyFilter}
          onChange={e => setDifficultyFilter(e.target.value as typeof difficultyFilter)}
          className="rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none"
        >
          <option value="all">All Difficulty</option>
          <option value="easy">Easy</option>
          <option value="medium">Medium</option>
          <option value="hard">Hard</option>
        </select>
      </div>

      {/* Campaign List */}
      <div className="overflow-x-auto rounded-lg border border-gray-200">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                Campaign
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                Platform
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                Difficulty
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                Expires
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium tracking-wider text-gray-500 uppercase">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white">
            {filteredCampaigns.length === 0
              ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                      No campaigns found
                    </td>
                  </tr>
                )
              : (
                  filteredCampaigns.map((campaign) => {
                    const daysUntilExpiry = getDaysUntilExpiry(campaign.endDate);
                    const title = campaign.translations?.[0]?.title || 'Untitled';

                    return (
                      <tr key={campaign.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <div>
                            <div className="font-medium text-gray-900">{title}</div>
                            <div className="text-sm text-gray-500">{campaign.slug}</div>
                            {campaign.freeCredit && (
                              <div className="mt-1 text-sm text-green-600">
                                💰
                                {' '}
                                {campaign.freeCredit}
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center">
                            {campaign.platform?.logo && (
                              <img
                                src={campaign.platform.logo}
                                alt={campaign.platform.name}
                                className="mr-2 size-6 rounded object-cover"
                              />
                            )}
                            <span className="text-sm text-gray-900">
                              {campaign.platform?.name || 'Unknown'}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${getStatusColor(campaign.status)}`}
                          >
                            {campaign.status}
                          </span>
                          {campaign.isFeatured && (
                            <span className="ml-2 inline-flex rounded-full bg-yellow-100 px-2 py-1 text-xs font-semibold text-yellow-800">
                              ⭐ Featured
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          {campaign.difficultyLevel
                            ? (
                                <span
                                  className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${getDifficultyColor(campaign.difficultyLevel)}`}
                                >
                                  {campaign.difficultyLevel}
                                </span>
                              )
                            : (
                                <span className="text-gray-400">-</span>
                              )}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500">
                          {campaign.endDate
                            ? (
                                <div>
                                  <div>{new Date(campaign.endDate).toLocaleDateString()}</div>
                                  {daysUntilExpiry !== null && (
                                    <div
                                      className={`text-xs ${
                                        daysUntilExpiry < 0
                                          ? 'text-red-600'
                                          : daysUntilExpiry < 7
                                            ? 'text-orange-600'
                                            : 'text-gray-500'
                                      }`}
                                    >
                                      {daysUntilExpiry < 0
                                        ? `Expired ${Math.abs(daysUntilExpiry)} days ago`
                                        : `${daysUntilExpiry} days left`}
                                    </div>
                                  )}
                                </div>
                              )
                            : (
                                <span className="text-gray-400">No expiry</span>
                              )}
                        </td>
                        <td className="px-6 py-4 text-right text-sm font-medium">
                          <button
                            onClick={() => onEdit(campaign)}
                            className="mr-3 text-blue-600 hover:text-blue-900"
                            type="button"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => {
                              if (confirm(`Are you sure you want to delete "${title}"?`)) {
                                onDelete(campaign.id);
                              }
                            }}
                            className="text-red-600 hover:text-red-900"
                            type="button"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
