'use client';

import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { BookmarksTab } from './BookmarksTab';
import { OverviewTab } from './OverviewTab';
import { SettingsTab } from './SettingsTab';
import { SubmittedTab } from './SubmittedTab';

type TabType = 'overview' | 'bookmarks' | 'submitted' | 'settings';

type ProfileTabsProps = {
  userId: string;
  locale: string;
};

export function ProfileTabs({ userId, locale }: ProfileTabsProps) {
  const t = useTranslations('Profile');
  const [activeTab, setActiveTab] = useState<TabType>('overview');

  const tabs: { id: TabType; label: string }[] = [
    { id: 'overview', label: t('tab_overview') },
    { id: 'bookmarks', label: t('tab_bookmarks') },
    { id: 'submitted', label: t('tab_submitted') },
    { id: 'settings', label: t('tab_settings') },
  ];

  return (
    <div className="rounded-lg border border-gray-200 bg-white shadow-sm">
      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8 px-6" aria-label="Tabs">
          {tabs.map(tab => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`
                border-b-2 px-1 py-4 text-sm font-medium whitespace-nowrap transition-colors
                ${
            activeTab === tab.id
              ? 'border-blue-500 text-blue-600'
              : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
            }
              `}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="p-6">
        {activeTab === 'overview' && <OverviewTab userId={userId} />}
        {activeTab === 'bookmarks' && <BookmarksTab userId={userId} locale={locale} />}
        {activeTab === 'submitted' && <SubmittedTab userId={userId} locale={locale} />}
        {activeTab === 'settings' && <SettingsTab />}
      </div>
    </div>
  );
}
