'use client';

import type { Campaign } from '@/types/Campaign';
import { useState } from 'react';

type PendingCampaignListProps = {
  campaigns: Campaign[];
  onApprove: (campaignId: string) => Promise<void>;
  onReject: (campaignId: string) => Promise<void>;
  onEditTranslation: (
    campaignId: string,
    locale: 'zh' | 'en',
    title: string,
    description: string | null,
  ) => Promise<void>;
};

export function PendingCampaignList({
  campaigns,
  onApprove,
  onReject,
  onEditTranslation,
}: PendingCampaignListProps) {
  const [expandedCampaigns, setExpandedCampaigns] = useState<Set<string>>(new Set());
  const [editingTranslation, setEditingTranslation] = useState<{
    campaignId: string;
    locale: 'zh' | 'en';
  } | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');

  const toggleExpand = (campaignId: string) => {
    const newExpanded = new Set(expandedCampaigns);
    if (newExpanded.has(campaignId)) {
      newExpanded.delete(campaignId);
    } else {
      newExpanded.add(campaignId);
    }
    setExpandedCampaigns(newExpanded);
  };

  const startEditTranslation = (
    campaignId: string,
    locale: 'zh' | 'en',
    title: string,
    description: string | null,
  ) => {
    setEditingTranslation({ campaignId, locale });
    setEditTitle(title);
    setEditDescription(description || '');
  };

  const saveTranslation = async () => {
    if (!editingTranslation) {
      return;
    }

    await onEditTranslation(
      editingTranslation.campaignId,
      editingTranslation.locale,
      editTitle,
      editDescription || null,
    );

    setEditingTranslation(null);
    setEditTitle('');
    setEditDescription('');
  };

  const cancelEditTranslation = () => {
    setEditingTranslation(null);
    setEditTitle('');
    setEditDescription('');
  };

  return (
    <div className="space-y-4">
      {campaigns.map((campaign) => {
        const isExpanded = expandedCampaigns.has(campaign.id);
        const zhTranslation = campaign.translations?.find(t => t.locale === 'zh');
        const enTranslation = campaign.translations?.find(t => t.locale === 'en');

        return (
          <div
            key={campaign.id}
            className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm"
          >
            {/* Campaign Header */}
            <div className="border-b border-gray-200 bg-gray-50 p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3">
                    {campaign.platform?.logo && (
                      <img
                        src={campaign.platform.logo}
                        alt={campaign.platform.name}
                        className="size-10 rounded object-contain"
                      />
                    )}
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        {zhTranslation?.title || enTranslation?.title || 'Untitled'}
                      </h3>
                      <p className="text-sm text-gray-600">
                        Platform:
                        {' '}
                        {campaign.platform?.name || campaign.pendingPlatform?.name || 'Unknown'}
                        {campaign.pendingPlatform && (
                          <span className="ml-2 rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-800">
                            🆕 New Platform (Pending)
                          </span>
                        )}
                      </p>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => toggleExpand(campaign.id)}
                  className="text-gray-400 hover:text-gray-600"
                  type="button"
                >
                  <svg
                    className={`size-6 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </button>
              </div>
            </div>

            {/* Campaign Details (Expanded) */}
            {isExpanded && (
              <div className="space-y-6 p-6">
                {/* Pending Platform Info */}
                {campaign.pendingPlatform && (
                  <div className="rounded-lg border-2 border-amber-200 bg-amber-50 p-4">
                    <h4 className="mb-3 flex items-center font-medium text-amber-800">
                      <span className="mr-2">🆕</span>
                      New Platform (Pending Review)
                    </h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm font-medium text-amber-700">Platform Name</p>
                        <p className="mt-1 text-sm text-gray-900">
                          {campaign.pendingPlatform.name}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-amber-700">Slug</p>
                        <p className="mt-1 text-sm text-gray-900">
                          {campaign.pendingPlatform.slug}
                        </p>
                      </div>
                      {campaign.pendingPlatform.website && (
                        <div className="col-span-2">
                          <p className="text-sm font-medium text-amber-700">Website</p>
                          <a
                            href={campaign.pendingPlatform.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="mt-1 text-sm text-blue-600 hover:underline"
                          >
                            {campaign.pendingPlatform.website}
                          </a>
                        </div>
                      )}
                      {campaign.pendingPlatform.description && (
                        <div className="col-span-2">
                          <p className="text-sm font-medium text-amber-700">Description</p>
                          <p className="mt-1 text-sm text-gray-900">
                            {campaign.pendingPlatform.description}
                          </p>
                        </div>
                      )}
                    </div>
                    <p className="mt-3 text-xs text-amber-600">
                      ⚠️ Approving this campaign will also create the new platform
                    </p>
                  </div>
                )}

                {/* Submission Info */}
                <div className="grid grid-cols-2 gap-4 rounded-lg bg-gray-50 p-4">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Submitted By</p>
                    <p className="mt-1 text-sm text-gray-900">
                      {campaign.submittedBy || 'Unknown'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Submitted On</p>
                    <p className="mt-1 text-sm text-gray-900">
                      {new Date(campaign.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Free Credit</p>
                    <p className="mt-1 text-sm text-gray-900">
                      {campaign.freeCredit || 'Not specified'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Valid Until</p>
                    <p className="mt-1 text-sm text-gray-900">
                      {campaign.endDate
                        ? new Date(campaign.endDate).toLocaleDateString()
                        : 'Not specified'}
                    </p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-sm font-medium text-gray-500">Official Link</p>
                    <a
                      href={campaign.officialLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-1 text-sm text-blue-600 hover:underline"
                    >
                      {campaign.officialLink}
                    </a>
                  </div>
                </div>

                {/* Translations */}
                <div className="space-y-4">
                  <h4 className="font-medium text-gray-900">Translations</h4>

                  {/* Chinese Translation */}
                  {zhTranslation && (
                    <div className="rounded-lg border border-gray-200 p-4">
                      <div className="mb-2 flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <span className="text-sm font-medium text-gray-700">
                            🇨🇳 Chinese (ZH)
                          </span>
                          {zhTranslation.isAiGenerated && (
                            <span className="rounded-full bg-blue-100 px-2 py-1 text-xs font-medium text-blue-800">
                              ✨ AI Generated
                            </span>
                          )}
                        </div>
                        {editingTranslation?.campaignId === campaign.id
                          && editingTranslation?.locale === 'zh'
                          ? (
                              <div className="space-x-2">
                                <button
                                  onClick={saveTranslation}
                                  className="text-sm text-blue-600 hover:text-blue-800"
                                  type="button"
                                >
                                  Save
                                </button>
                                <button
                                  onClick={cancelEditTranslation}
                                  className="text-sm text-gray-600 hover:text-gray-800"
                                  type="button"
                                >
                                  Cancel
                                </button>
                              </div>
                            )
                          : (
                              <button
                                onClick={() =>
                                  startEditTranslation(
                                    campaign.id,
                                    'zh',
                                    zhTranslation.title,
                                    zhTranslation.description || null,
                                  )}
                                className="text-sm text-blue-600 hover:text-blue-800"
                                type="button"
                              >
                                Edit
                              </button>
                            )}
                      </div>

                      {editingTranslation?.campaignId === campaign.id
                        && editingTranslation?.locale === 'zh'
                        ? (
                            <div className="space-y-2">
                              <input
                                type="text"
                                value={editTitle}
                                onChange={e => setEditTitle(e.target.value)}
                                className="w-full rounded border border-gray-300 px-3 py-2 text-sm"
                                placeholder="Title"
                              />
                              <textarea
                                value={editDescription}
                                onChange={e => setEditDescription(e.target.value)}
                                rows={4}
                                className="w-full rounded border border-gray-300 px-3 py-2 text-sm"
                                placeholder="Description"
                              />
                            </div>
                          )
                        : (
                            <>
                              <p className="text-sm font-medium text-gray-900">
                                {zhTranslation.title}
                              </p>
                              {zhTranslation.description && (
                                <p className="mt-2 text-sm text-gray-600">
                                  {zhTranslation.description}
                                </p>
                              )}
                            </>
                          )}
                    </div>
                  )}

                  {/* English Translation */}
                  {enTranslation && (
                    <div className="rounded-lg border border-gray-200 p-4">
                      <div className="mb-2 flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <span className="text-sm font-medium text-gray-700">
                            🇺🇸 English (EN)
                          </span>
                          {enTranslation.isAiGenerated && (
                            <span className="rounded-full bg-blue-100 px-2 py-1 text-xs font-medium text-blue-800">
                              ✨ AI Generated
                            </span>
                          )}
                        </div>
                        {editingTranslation?.campaignId === campaign.id
                          && editingTranslation?.locale === 'en'
                          ? (
                              <div className="space-x-2">
                                <button
                                  onClick={saveTranslation}
                                  className="text-sm text-blue-600 hover:text-blue-800"
                                  type="button"
                                >
                                  Save
                                </button>
                                <button
                                  onClick={cancelEditTranslation}
                                  className="text-sm text-gray-600 hover:text-gray-800"
                                  type="button"
                                >
                                  Cancel
                                </button>
                              </div>
                            )
                          : (
                              <button
                                onClick={() =>
                                  startEditTranslation(
                                    campaign.id,
                                    'en',
                                    enTranslation.title,
                                    enTranslation.description || null,
                                  )}
                                className="text-sm text-blue-600 hover:text-blue-800"
                                type="button"
                              >
                                Edit
                              </button>
                            )}
                      </div>

                      {editingTranslation?.campaignId === campaign.id
                        && editingTranslation?.locale === 'en'
                        ? (
                            <div className="space-y-2">
                              <input
                                type="text"
                                value={editTitle}
                                onChange={e => setEditTitle(e.target.value)}
                                className="w-full rounded border border-gray-300 px-3 py-2 text-sm"
                                placeholder="Title"
                              />
                              <textarea
                                value={editDescription}
                                onChange={e => setEditDescription(e.target.value)}
                                rows={4}
                                className="w-full rounded border border-gray-300 px-3 py-2 text-sm"
                                placeholder="Description"
                              />
                            </div>
                          )
                        : (
                            <>
                              <p className="text-sm font-medium text-gray-900">
                                {enTranslation.title}
                              </p>
                              {enTranslation.description && (
                                <p className="mt-2 text-sm text-gray-600">
                                  {enTranslation.description}
                                </p>
                              )}
                            </>
                          )}
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex items-center justify-end space-x-3 border-t border-gray-200 pt-4">
                  <button
                    onClick={() => onReject(campaign.id)}
                    className="rounded-md border border-red-300 bg-white px-4 py-2 text-sm font-medium text-red-700 hover:bg-red-50"
                    type="button"
                  >
                    ❌ Reject
                  </button>
                  <button
                    onClick={() => onApprove(campaign.id)}
                    className="rounded-md bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700"
                    type="button"
                  >
                    ✅ Approve & Publish
                  </button>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
