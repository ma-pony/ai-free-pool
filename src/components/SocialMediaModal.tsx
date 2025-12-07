'use client';

import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';
import { trackSocialMediaPrompt } from '@/libs/Analytics';

type SocialMediaModalProps = {
  isOpen: boolean;
  onClose: () => void;
  trigger?: 'welcome' | 'bookmark' | 'expired' | 'manual';
};

export default function SocialMediaModal({
  isOpen,
  onClose,
  trigger = 'manual',
}: SocialMediaModalProps) {
  const t = useTranslations('Index');
  const [activeTab, setActiveTab] = useState<'links' | 'qr'>('links');

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) {
    return null;
  }

  const getTriggerMessage = () => {
    switch (trigger) {
      case 'welcome':
        return t('social_modal_welcome_message');
      case 'bookmark':
        return t('social_modal_bookmark_message');
      case 'expired':
        return t('social_modal_expired_message');
      default:
        return t('social_modal_default_message');
    }
  };

  const socialPlatforms = [
    {
      name: 'Twitter',
      handle: '@AIFreePool',
      url: 'https://twitter.com/aifreepool',
      icon: (
        <svg className="size-6" fill="currentColor" viewBox="0 0 24 24">
          <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" />
        </svg>
      ),
      color: 'bg-[#1DA1F2]',
      qrPlaceholder: '/qr/twitter-qr.png',
    },
    {
      name: 'GitHub',
      handle: 'github.com/aifreepool',
      url: 'https://github.com/aifreepool',
      icon: (
        <svg className="size-6" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
        </svg>
      ),
      color: 'bg-[#333333]',
      qrPlaceholder: '/qr/github-qr.png',
    },
    {
      name: 'Discord',
      handle: 'discord.gg/aifreepool',
      url: 'https://discord.gg/aifreepool',
      icon: (
        <svg className="size-6" fill="currentColor" viewBox="0 0 24 24">
          <path d="M20.317 4.37a19.791 19.791 0 00-4.885-1.515.074.074 0 00-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 00-5.487 0 12.64 12.64 0 00-.617-1.25.077.077 0 00-.079-.037A19.736 19.736 0 003.677 4.37a.07.07 0 00-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 00.031.057 19.9 19.9 0 005.993 3.03.078.078 0 00.084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 00-.041-.106 13.107 13.107 0 01-1.872-.892.077.077 0 01-.008-.128 10.2 10.2 0 00.372-.292.074.074 0 01.077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 01.078.01c.12.098.246.198.373.292a.077.077 0 01-.006.127 12.299 12.299 0 01-1.873.892.077.077 0 00-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 00.084.028 19.839 19.839 0 006.002-3.03.077.077 0 00.032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 00-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
        </svg>
      ),
      color: 'bg-[#5865F2]',
      qrPlaceholder: '/qr/discord-qr.png',
    },
    {
      name: 'Telegram',
      handle: 't.me/aifreepool',
      url: 'https://t.me/aifreepool',
      icon: (
        <svg className="size-6" fill="currentColor" viewBox="0 0 24 24">
          <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
        </svg>
      ),
      color: 'bg-[#0088cc]',
      qrPlaceholder: '/qr/telegram-qr.png',
    },
    {
      name: 'WeChat',
      handle: 'AIFreePool',
      url: '#',
      icon: (
        <svg className="size-6" fill="currentColor" viewBox="0 0 24 24">
          <path d="M8.691 2.188C3.891 2.188 0 5.476 0 9.53c0 2.212 1.17 4.203 3.002 5.55a.59.59 0 0 1 .213.665l-.39 1.48c-.019.07-.048.141-.048.213 0 .163.13.295.29.295a.326.326 0 0 0 .167-.054l1.903-1.114a.864.864 0 0 1 .717-.098 10.16 10.16 0 0 0 2.837.403c.276 0 .543-.027.811-.05-.857-2.578.157-4.972 1.932-6.446 1.703-1.415 3.882-1.98 5.853-1.838-.576-3.583-4.196-6.348-8.596-6.348zM5.785 5.991c.642 0 1.162.529 1.162 1.18a1.17 1.17 0 0 1-1.162 1.178A1.17 1.17 0 0 1 4.623 7.17c0-.651.52-1.18 1.162-1.18zm5.813 0c.642 0 1.162.529 1.162 1.18a1.17 1.17 0 0 1-1.162 1.178 1.17 1.17 0 0 1-1.162-1.178c0-.651.52-1.18 1.162-1.18zm5.34 2.867c-1.797-.052-3.746.512-5.28 1.786-1.72 1.428-2.687 3.72-1.78 6.22.942 2.453 3.666 4.229 6.884 4.229.826 0 1.622-.12 2.361-.336a.722.722 0 0 1 .598.082l1.584.926a.272.272 0 0 0 .14.047c.134 0 .24-.111.24-.247 0-.06-.023-.12-.038-.177l-.327-1.233a.582.582 0 0 1-.023-.156.49.49 0 0 1 .201-.398C23.024 18.48 24 16.82 24 14.98c0-3.21-2.931-5.837-6.656-6.088V8.89c-.135-.01-.27-.027-.407-.03zm-2.53 3.274c.535 0 .969.44.969.982a.976.976 0 0 1-.969.983.976.976 0 0 1-.969-.983c0-.542.434-.982.969-.982zm4.844 0c.535 0 .969.44.969.982a.976.976 0 0 1-.969.983.976.976 0 0 1-.969-.983c0-.542.434-.982.969-.982z" />
        </svg>
      ),
      color: 'bg-[#09B83E]',
      qrPlaceholder: '/qr/wechat-qr.png',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal */}
      <div className="relative z-10 mx-4 max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white shadow-2xl">
        {/* Header */}
        <div className="sticky top-0 rounded-t-2xl border-b border-gray-200 bg-white px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                {t('social_modal_title')}
              </h2>
              <p className="mt-1 text-sm text-gray-600">
                {getTriggerMessage()}
              </p>
            </div>
            <button
              onClick={() => {
                // Track dismiss
                const promptType = trigger === 'welcome' ? 'welcome' : trigger === 'bookmark' ? 'bookmark_3rd' : 'expired_campaign';
                trackSocialMediaPrompt(promptType, 'dismissed');
                onClose();
              }}
              className="text-gray-400 transition-colors hover:text-gray-600"
              aria-label="Close modal"
              type="button"
            >
              <svg className="size-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Tabs */}
          <div className="mt-4 flex gap-4 border-b border-gray-200">
            <button
              onClick={() => setActiveTab('links')}
              className={`border-b-2 px-1 pb-2 text-sm font-medium transition-colors ${
                activeTab === 'links'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
              type="button"
            >
              {t('social_modal_tab_links')}
            </button>
            <button
              onClick={() => setActiveTab('qr')}
              className={`border-b-2 px-1 pb-2 text-sm font-medium transition-colors ${
                activeTab === 'qr'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
              type="button"
            >
              {t('social_modal_tab_qr')}
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {activeTab === 'links' && (
            <div className="space-y-4">
              {socialPlatforms.map(platform => (
                <a
                  key={platform.name}
                  href={platform.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex items-center gap-4 rounded-lg border border-gray-200 p-4 transition-all hover:border-primary-300 hover:bg-primary-50"
                  onClick={() => {
                    // Track social media click
                    const promptType = trigger === 'welcome' ? 'welcome' : trigger === 'bookmark' ? 'bookmark_3rd' : 'expired_campaign';
                    trackSocialMediaPrompt(promptType, 'clicked');
                  }}
                >
                  <div className={`${platform.color} rounded-lg p-3 text-white`}>
                    {platform.icon}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 transition-colors group-hover:text-primary-600">
                      {platform.name}
                    </h3>
                    <p className="text-sm text-gray-600">{platform.handle}</p>
                  </div>
                  <svg className="size-5 text-gray-400 transition-colors group-hover:text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </a>
              ))}
            </div>
          )}

          {activeTab === 'qr' && (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              {socialPlatforms.map(platform => (
                <div
                  key={platform.name}
                  className="flex flex-col items-center rounded-lg border border-gray-200 bg-gray-50 p-4"
                >
                  <div className={`${platform.color} mb-3 rounded-lg p-3 text-white`}>
                    {platform.icon}
                  </div>
                  <h3 className="mb-2 font-semibold text-gray-900">{platform.name}</h3>
                  <div className="mb-2 flex h-40 w-40 items-center justify-center rounded-lg border-2 border-gray-300 bg-white">
                    {/* Placeholder for QR code */}
                    <div className="p-4 text-center text-xs text-gray-400">
                      <svg className="mx-auto mb-2 size-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                      </svg>
                      QR Code
                    </div>
                  </div>
                  <p className="text-center text-xs text-gray-600">{platform.handle}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 rounded-b-2xl border-t border-gray-200 bg-gray-50 px-6 py-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-600">
              {t('social_modal_footer_text')}
            </p>
            <button
              onClick={onClose}
              className="rounded-lg bg-primary-600 px-4 py-2 font-medium text-white transition-colors hover:bg-primary-700"
              type="button"
            >
              {t('social_modal_close')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
