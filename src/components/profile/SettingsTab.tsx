'use client';

import { UserProfile } from '@clerk/nextjs';
import { useTranslations } from 'next-intl';

export function SettingsTab() {
  const t = useTranslations('Profile');

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-gray-900">
          {t('settings_title')}
        </h2>
        <p className="mt-2 text-gray-600">{t('settings_description')}</p>
      </div>

      {/* Clerk UserProfile Component */}
      <div className="rounded-lg border border-gray-200 bg-white">
        <UserProfile
          appearance={{
            elements: {
              rootBox: 'w-full',
              card: 'shadow-none border-0',
            },
          }}
        />
      </div>
    </div>
  );
}
