import type { SupportedLanguage } from '@/services/TranslationService';
import type { CampaignTranslation } from '@/types/Campaign';

/**
 * Get translation for a specific locale from campaign translations
 * Falls back to the other language if requested locale is not available
 */
export function getTranslationForLocale(
  translations: CampaignTranslation[] | undefined,
  locale: SupportedLanguage,
): CampaignTranslation | null {
  if (!translations || translations.length === 0) {
    return null;
  }

  // Try to find exact match
  const exactMatch = translations.find(t => t.locale === locale);
  if (exactMatch) {
    return exactMatch;
  }

  // Fallback to any available translation
  return translations[0] || null;
}

/**
 * Check if a campaign has translations for both languages
 */
export function hasCompleteTranslations(
  translations: CampaignTranslation[] | undefined,
): boolean {
  if (!translations || translations.length < 2) {
    return false;
  }

  const hasZh = translations.some(t => t.locale === 'zh');
  const hasEn = translations.some(t => t.locale === 'en');

  return hasZh && hasEn;
}

/**
 * Get missing translation locales
 */
export function getMissingTranslationLocales(
  translations: CampaignTranslation[] | undefined,
): SupportedLanguage[] {
  const missing: SupportedLanguage[] = [];

  if (!translations) {
    return ['zh', 'en'];
  }

  const hasZh = translations.some(t => t.locale === 'zh');
  const hasEn = translations.some(t => t.locale === 'en');

  if (!hasZh) {
    missing.push('zh');
  }
  if (!hasEn) {
    missing.push('en');
  }

  return missing;
}

/**
 * Format campaign data for API response with locale-specific translation
 */
export function formatCampaignWithLocale<T extends { translations?: CampaignTranslation[] }>(
  campaign: T,
  locale: SupportedLanguage,
): T & { title?: string; description?: string | null } {
  const translation = getTranslationForLocale(campaign.translations, locale);

  return {
    ...campaign,
    title: translation?.title,
    description: translation?.description,
  };
}
