import type { LocalePrefixMode } from 'next-intl/routing';
import { enUS, frFR, zhCN } from '@clerk/localizations';

const localePrefix: LocalePrefixMode = 'as-needed';

export const AppConfig = {
  name: 'AI Free Pool',
  description: 'Discover and track AI free credit campaigns - Your gateway to free AI resources',
  locales: ['en', 'zh', 'fr'],
  defaultLocale: 'en',
  localePrefix,
  url: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
  author: 'AI Free Pool Team',
  keywords: ['AI', 'free credits', 'AI tools', 'free resources', 'OpenAI', 'Claude', 'GPT'],
};

const supportedLocales = {
  en: enUS,
  zh: zhCN,
  fr: frFR,
};

export const ClerkLocalizations = {
  defaultLocale: enUS,
  supportedLocales,
};
