import OpenAI from 'openai';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export type SupportedLanguage = 'zh' | 'en';

/**
 * Detects the language of the given text
 * @param text - The text to detect language for
 * @returns The detected language code ('zh' or 'en')
 */
export async function detectLanguage(text: string): Promise<SupportedLanguage> {
  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'You are a language detection system. Respond with only "zh" for Chinese or "en" for English. No other text.',
        },
        {
          role: 'user',
          content: `Detect the language of this text: "${text.substring(0, 200)}"`,
        },
      ],
      temperature: 0,
      max_tokens: 10,
    });

    const detectedLang = response.choices[0]?.message?.content?.trim().toLowerCase();

    // Default to English if detection fails or returns unexpected value
    if (detectedLang === 'zh' || detectedLang === 'chinese') {
      return 'zh';
    }

    return 'en';
  } catch (error) {
    console.error('Language detection error:', error);
    // Default to English on error
    return 'en';
  }
}

/**
 * Translates content from one language to another using OpenAI
 * @param text - The text to translate
 * @param fromLang - Source language
 * @param toLang - Target language
 * @returns The translated text
 */
export async function translateContent(
  text: string,
  fromLang: SupportedLanguage,
  toLang: SupportedLanguage,
): Promise<string> {
  // If source and target are the same, return original text
  if (fromLang === toLang) {
    return text;
  }

  try {
    const languageNames = {
      zh: 'Chinese (Simplified)',
      en: 'English',
    };

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: `You are a professional translator specializing in AI and technology content. Translate the following text from ${languageNames[fromLang]} to ${languageNames[toLang]}. Maintain the original meaning, tone, and technical accuracy. Preserve any URLs, numbers, and technical terms appropriately.`,
        },
        {
          role: 'user',
          content: text,
        },
      ],
      temperature: 0.3,
      max_tokens: 2000,
    });

    return response.choices[0]?.message?.content || text;
  } catch (error) {
    console.error('Translation error:', error);
    // Return original text on error
    return text;
  }
}

/**
 * Translates campaign content (title and description)
 * @param title - Campaign title
 * @param description - Campaign description
 * @param fromLang - Source language
 * @param toLang - Target language
 * @returns Object with translated title and description
 */
export async function translateCampaignContent(
  title: string,
  description: string | null,
  fromLang: SupportedLanguage,
  toLang: SupportedLanguage,
): Promise<{ title: string; description: string | null }> {
  if (fromLang === toLang) {
    return { title, description };
  }

  try {
    // Translate title and description in parallel for efficiency
    const [translatedTitle, translatedDescription] = await Promise.all([
      translateContent(title, fromLang, toLang),
      description ? translateContent(description, fromLang, toLang) : Promise.resolve(null),
    ]);

    return {
      title: translatedTitle,
      description: translatedDescription,
    };
  } catch (error) {
    console.error('Campaign translation error:', error);
    // Return original content on error
    return { title, description };
  }
}

/**
 * Auto-detects language and translates to the target language
 * @param text - The text to translate
 * @param toLang - Target language
 * @returns The translated text
 */
export async function autoTranslate(
  text: string,
  toLang: SupportedLanguage,
): Promise<string> {
  const detectedLang = await detectLanguage(text);
  return translateContent(text, detectedLang, toLang);
}
