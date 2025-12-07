'use client';

import { useEffect, useState } from 'react';

type SocialMediaLinks = {
  twitter?: string;
  github?: string;
  discord?: string;
  telegram?: string;
  wechat?: string;
};

type GeneralSettings = {
  siteName: string;
  siteDescription: string;
  contactEmail: string;
  socialMedia: SocialMediaLinks;
};

export default function AdminSettingsPage() {
  const [activeTab, setActiveTab] = useState<'general' | 'social' | 'tags' | 'security'>('general');
  const [settings, setSettings] = useState<GeneralSettings>({
    siteName: 'AI Free Pool',
    siteDescription: 'Discover and track AI free credit campaigns',
    contactEmail: 'admin@aifreepool.com',
    socialMedia: {},
  });
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    // TODO: Fetch settings from API
    // For now, using default values
  }, []);

  const handleSaveGeneral = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSaveSuccess(false);

    try {
      // TODO: Implement API call to save settings
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      console.error('Failed to save settings:', err);
      alert('Failed to save settings');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="mt-1 text-sm text-gray-600">
          Manage platform settings and configuration
        </p>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('general')}
            className={`border-b-2 px-1 py-4 text-sm font-medium whitespace-nowrap ${
              activeTab === 'general'
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
            }`}
            type="button"
          >
            General
          </button>
          <button
            onClick={() => setActiveTab('social')}
            className={`border-b-2 px-1 py-4 text-sm font-medium whitespace-nowrap ${
              activeTab === 'social'
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
            }`}
            type="button"
          >
            Social Media
          </button>
          <button
            onClick={() => setActiveTab('tags')}
            className={`border-b-2 px-1 py-4 text-sm font-medium whitespace-nowrap ${
              activeTab === 'tags'
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
            }`}
            type="button"
          >
            Condition Tags
          </button>
          <button
            onClick={() => setActiveTab('security')}
            className={`border-b-2 px-1 py-4 text-sm font-medium whitespace-nowrap ${
              activeTab === 'security'
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
            }`}
            type="button"
          >
            Security
          </button>
        </nav>
      </div>

      {/* General Settings */}
      {activeTab === 'general' && (
        <div className="rounded-lg bg-white shadow">
          <div className="border-b border-gray-200 px-6 py-4">
            <h2 className="text-lg font-medium text-gray-900">General Settings</h2>
          </div>
          <form onSubmit={handleSaveGeneral} className="space-y-6 p-6">
            <div>
              <label htmlFor="siteName" className="block text-sm font-medium text-gray-700">
                Site Name
              </label>
              <input
                type="text"
                id="siteName"
                value={settings.siteName}
                onChange={e => setSettings({ ...settings, siteName: e.target.value })}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 focus:outline-none"
              />
            </div>

            <div>
              <label htmlFor="siteDescription" className="block text-sm font-medium text-gray-700">
                Site Description
              </label>
              <textarea
                id="siteDescription"
                rows={3}
                value={settings.siteDescription}
                onChange={e => setSettings({ ...settings, siteDescription: e.target.value })}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 focus:outline-none"
              />
            </div>

            <div>
              <label htmlFor="contactEmail" className="block text-sm font-medium text-gray-700">
                Contact Email
              </label>
              <input
                type="email"
                id="contactEmail"
                value={settings.contactEmail}
                onChange={e => setSettings({ ...settings, contactEmail: e.target.value })}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 focus:outline-none"
              />
            </div>

            <div className="flex justify-end gap-4">
              {saveSuccess && (
                <span className="flex items-center gap-2 text-sm text-green-600">
                  <svg className="size-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Settings saved successfully
                </span>
              )}
              <button
                type="submit"
                disabled={isSaving}
                className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
              >
                {isSaving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Social Media Settings */}
      {activeTab === 'social' && (
        <div className="rounded-lg bg-white shadow">
          <div className="border-b border-gray-200 px-6 py-4">
            <h2 className="text-lg font-medium text-gray-900">Social Media Links</h2>
            <p className="mt-1 text-sm text-gray-600">
              Configure social media links displayed on the site
            </p>
          </div>
          <form onSubmit={handleSaveGeneral} className="space-y-6 p-6">
            <div>
              <label htmlFor="twitter" className="block text-sm font-medium text-gray-700">
                Twitter / X
              </label>
              <input
                type="url"
                id="twitter"
                placeholder="https://twitter.com/yourhandle"
                value={settings.socialMedia.twitter || ''}
                onChange={e => setSettings({
                  ...settings,
                  socialMedia: { ...settings.socialMedia, twitter: e.target.value },
                })}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 focus:outline-none"
              />
            </div>

            <div>
              <label htmlFor="github" className="block text-sm font-medium text-gray-700">
                GitHub
              </label>
              <input
                type="url"
                id="github"
                placeholder="https://github.com/yourorg"
                value={settings.socialMedia.github || ''}
                onChange={e => setSettings({
                  ...settings,
                  socialMedia: { ...settings.socialMedia, github: e.target.value },
                })}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 focus:outline-none"
              />
            </div>

            <div>
              <label htmlFor="discord" className="block text-sm font-medium text-gray-700">
                Discord
              </label>
              <input
                type="url"
                id="discord"
                placeholder="https://discord.gg/yourinvite"
                value={settings.socialMedia.discord || ''}
                onChange={e => setSettings({
                  ...settings,
                  socialMedia: { ...settings.socialMedia, discord: e.target.value },
                })}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 focus:outline-none"
              />
            </div>

            <div>
              <label htmlFor="telegram" className="block text-sm font-medium text-gray-700">
                Telegram
              </label>
              <input
                type="url"
                id="telegram"
                placeholder="https://t.me/yourchannel"
                value={settings.socialMedia.telegram || ''}
                onChange={e => setSettings({
                  ...settings,
                  socialMedia: { ...settings.socialMedia, telegram: e.target.value },
                })}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 focus:outline-none"
              />
            </div>

            <div>
              <label htmlFor="wechat" className="block text-sm font-medium text-gray-700">
                WeChat QR Code URL
              </label>
              <input
                type="url"
                id="wechat"
                placeholder="https://example.com/wechat-qr.png"
                value={settings.socialMedia.wechat || ''}
                onChange={e => setSettings({
                  ...settings,
                  socialMedia: { ...settings.socialMedia, wechat: e.target.value },
                })}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 focus:outline-none"
              />
            </div>

            <div className="flex justify-end gap-4">
              {saveSuccess && (
                <span className="flex items-center gap-2 text-sm text-green-600">
                  <svg className="size-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Settings saved successfully
                </span>
              )}
              <button
                type="submit"
                disabled={isSaving}
                className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
              >
                {isSaving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Condition Tags Management */}
      {activeTab === 'tags' && (
        <div className="rounded-lg bg-white shadow">
          <div className="border-b border-gray-200 px-6 py-4">
            <h2 className="text-lg font-medium text-gray-900">Condition Tags Management</h2>
            <p className="mt-1 text-sm text-gray-600">
              Manage condition tags used for campaign requirements
            </p>
          </div>
          <div className="p-6">
            <p className="text-sm text-gray-600">
              Condition tags are managed in the
              {' '}
              <a href="/admin/tags" className="text-indigo-600 hover:text-indigo-500">
                Tags section
              </a>
              .
            </p>
          </div>
        </div>
      )}

      {/* Security Settings */}
      {activeTab === 'security' && (
        <div className="rounded-lg bg-white shadow">
          <div className="border-b border-gray-200 px-6 py-4">
            <h2 className="text-lg font-medium text-gray-900">Security Settings</h2>
            <p className="mt-1 text-sm text-gray-600">
              Configure security and access control settings
            </p>
          </div>
          <div className="space-y-6 p-6">
            <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
              <h3 className="font-medium text-gray-900">API Encryption</h3>
              <p className="mt-1 text-sm text-gray-600">
                API encryption is enabled by default. Encryption key is configured via environment variables.
              </p>
              <div className="mt-4 flex items-center gap-2">
                <svg className="size-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-sm font-medium text-green-700">Encryption Active</span>
              </div>
            </div>

            <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
              <h3 className="font-medium text-gray-900">Rate Limiting</h3>
              <p className="mt-1 text-sm text-gray-600">
                Rate limiting is managed by Arcjet. Configure limits in your Arcjet dashboard.
              </p>
              <div className="mt-4 flex items-center gap-2">
                <svg className="size-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-sm font-medium text-green-700">Rate Limiting Active</span>
              </div>
            </div>

            <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
              <h3 className="font-medium text-gray-900">Bot Detection</h3>
              <p className="mt-1 text-sm text-gray-600">
                Bot detection is managed by Arcjet. Search engines are allowed by default.
              </p>
              <div className="mt-4 flex items-center gap-2">
                <svg className="size-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-sm font-medium text-green-700">Bot Detection Active</span>
              </div>
            </div>

            <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4">
              <div className="flex items-start gap-3">
                <svg className="mt-0.5 size-5 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <div>
                  <h3 className="font-medium text-yellow-900">Admin Access Control</h3>
                  <p className="mt-1 text-sm text-yellow-700">
                    Currently, all authenticated users have admin access. In production, implement proper role-based access control.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
