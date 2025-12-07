'use client';

import type { ChangeEventHandler } from 'react';
import { useLocale } from 'next-intl';
import { useRouter } from 'next/navigation';
import { trackLanguageSwitch } from '@/libs/Analytics';
import { usePathname } from '@/libs/I18nNavigation';
import { routing } from '@/libs/I18nRouting';

export const LocaleSwitcher = () => {
  const router = useRouter();
  const pathname = usePathname();
  const locale = useLocale();

  // Language display names
  const localeNames: Record<string, string> = {
    en: 'English',
    zh: '中文',
    fr: 'Français',
  };

  const handleChange: ChangeEventHandler<HTMLSelectElement> = (event) => {
    const newLocale = event.target.value;

    // Track language switch
    trackLanguageSwitch(locale, newLocale);

    router.push(`/${newLocale}${pathname}`);
    router.refresh(); // Ensure the page takes the new locale into account related to the issue #395
  };

  return (
    <select
      defaultValue={locale}
      onChange={handleChange}
      className="cursor-pointer rounded-xl border-2 border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-700 shadow-sm transition-all hover:border-blue-400 hover:bg-blue-50 hover:shadow-md focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none active:scale-95"
      aria-label="lang-switcher"
    >
      {routing.locales.map(elt => (
        <option key={elt} value={elt}>
          {localeNames[elt] || elt.toUpperCase()}
        </option>
      ))}
    </select>
  );
};
