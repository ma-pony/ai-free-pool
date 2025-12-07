'use client';

import type { Campaign } from '@/types/Campaign';
import { useTranslations } from 'next-intl';
import { useEffect, useRef, useState } from 'react';

type CampaignSelectorProps = {
  value: string | null;
  onChange: (campaignId: string, campaign: Campaign) => void;
  placeholder?: string;
};

export default function CampaignSelector({
  value,
  onChange,
  placeholder,
}: CampaignSelectorProps) {
  const t = useTranslations('Admin');
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [filteredCampaigns, setFilteredCampaigns] = useState<Campaign[]>([]);
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Fetch campaigns when dropdown opens
  useEffect(() => {
    if (isOpen && campaigns.length === 0) {
      fetchCampaigns();
    }
  }, [isOpen]);

  // Filter campaigns based on search query
  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredCampaigns(campaigns);
    } else {
      const query = searchQuery.toLowerCase();
      const filtered = campaigns.filter((campaign) => {
        const title = campaign.translations?.[0]?.title?.toLowerCase() || '';
        const platformName = campaign.platform?.name?.toLowerCase() || '';
        return title.includes(query) || platformName.includes(query);
      });
      setFilteredCampaigns(filtered);
    }
  }, [searchQuery, campaigns]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const fetchCampaigns = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/campaigns?status=published&limit=100');

      if (!response.ok) {
        throw new Error('Failed to fetch campaigns');
      }

      const data = await response.json();
      setCampaigns(data.data || []);
      setFilteredCampaigns(data.data || []);
    } catch (err) {
      console.error('Error fetching campaigns:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = (campaign: Campaign) => {
    setSelectedCampaign(campaign);
    onChange(campaign.id, campaign);
    setIsOpen(false);
    setSearchQuery('');
  };

  const handleClear = () => {
    setSelectedCampaign(null);
    setSearchQuery('');
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Selected Campaign Display */}
      {selectedCampaign
        ? (
            <div className="flex items-center gap-3 rounded-lg border border-gray-300 bg-white p-3">
              {selectedCampaign.platform?.logo && (
                <img
                  src={selectedCampaign.platform.logo}
                  alt={selectedCampaign.platform.name}
                  className="size-10 rounded object-contain"
                />
              )}
              <div className="flex-1">
                <p className="font-medium">
                  {selectedCampaign.translations?.[0]?.title || 'Untitled'}
                </p>
                <p className="text-sm text-gray-600">
                  {selectedCampaign.platform?.name}
                </p>
              </div>
              <button
                type="button"
                onClick={handleClear}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="size-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          )
        : (
            <button
              type="button"
              onClick={() => setIsOpen(!isOpen)}
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-left hover:border-gray-400"
            >
              <span className="text-gray-500">
                {placeholder || t('select_campaign')}
              </span>
            </button>
          )}

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute z-50 mt-2 w-full rounded-lg border border-gray-300 bg-white shadow-lg">
          {/* Search Input */}
          <div className="border-b border-gray-200 p-3">
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder={t('search_campaigns')}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-primary-500 focus:outline-none"
              autoFocus
            />
          </div>

          {/* Campaign List */}
          <div className="max-h-80 overflow-y-auto">
            {loading
              ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="size-6 animate-spin rounded-full border-2 border-primary-500 border-t-transparent" />
                  </div>
                )
              : filteredCampaigns.length === 0
                ? (
                    <div className="py-8 text-center text-gray-500">
                      {t('no_campaigns_found')}
                    </div>
                  )
                : (
                    <div className="divide-y divide-gray-100">
                      {filteredCampaigns.map(campaign => (
                        <button
                          key={campaign.id}
                          type="button"
                          onClick={() => handleSelect(campaign)}
                          className="flex w-full items-center gap-3 p-3 text-left hover:bg-gray-50"
                        >
                          {campaign.platform?.logo && (
                            <img
                              src={campaign.platform.logo}
                              alt={campaign.platform.name}
                              className="size-10 shrink-0 rounded object-contain"
                            />
                          )}
                          <div className="flex-1 overflow-hidden">
                            <p className="truncate font-medium">
                              {campaign.translations?.[0]?.title || 'Untitled'}
                            </p>
                            <p className="truncate text-sm text-gray-600">
                              {campaign.platform?.name}
                            </p>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
          </div>
        </div>
      )}
    </div>
  );
}
