import { useTranslation } from 'react-i18next';

export interface MultilingualText {
  en?: string;
  fr: string;
  es?: string;
}

/**
 * Get the translated text from a multilingual object
 * @param text - The multilingual text object
 * @param fallback - Fallback text if the requested locale is not available
 * @param locale - The current locale (defaults to 'fr')
 * @returns The translated text
 */
export const getTranslatedText = (
  text: MultilingualText | string | null | undefined,
  fallback?: string,
  locale = 'fr'
): string => {
  // If text is a string, return it directly (backward compatibility)
  if (typeof text === 'string') {
    return text;
  }

  // If text is null or undefined, return fallback or empty string
  if (!text) {
    return fallback || '';
  }

  // Try to get the text for the requested locale
  const translatedText = text[locale as keyof MultilingualText];

  // If the requested locale is available, return it
  if (translatedText) {
    return translatedText;
  }

  // Fallback order: fr -> en -> ar -> es -> fallback -> empty string
  const fallbackOrder = ['fr', 'en', 'es'];

  for (const fallbackLocale of fallbackOrder) {
    const fallbackText = text[fallbackLocale as keyof MultilingualText];
    if (fallbackText) {
      return fallbackText;
    }
  }

  return fallback || '';
};

/**
 * Hook to get translated text with current locale
 */
export const useTranslatedText = () => {
  const { i18n } = useTranslation();

  return (text: MultilingualText | string | null | undefined, fallback?: string) =>
    getTranslatedText(text, fallback, i18n.language);
};
